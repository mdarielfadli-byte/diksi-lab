"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import { PortalTools, type AdSpend, type DocumentItem, type WorkItem } from "./PortalTools";
import { TeamWorkspace } from "./TeamWorkspace";
import { PublicMemberDashboard } from "./PublicMemberDashboard";
import styles from "./portal.module.css";
import live from "./portal-live.module.css";

type Company = { id: string; name: string; slug: string };
type Project = { id: string; name: string; status: string; progress: number; due_on: string | null };
type Cycle = { id: string; name: string; starts_on: string; ends_on: string; status: string; summary: string | null };
type Activity = { id: string; detail: string; created_at: string };
type Membership = { company_id: string; role: string };
type PortalData = { company: Company; project: Project | null; cycle: Cycle | null; workItems: WorkItem[]; activities: Activity[]; spend: AdSpend[]; documents: DocumentItem[]; role: string; isSuperAdmin: boolean };

export type ClientAreaPage = "overview" | "project" | "calendar" | "documents" | "launchpad" | "collaboration";
const dashboardViewStorageKey = "diksilab:member-area-dashboard-view";

function readSavedDashboardView(): { company: Company; projectId: string | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const savedView = window.sessionStorage.getItem(dashboardViewStorageKey);
    if (!savedView) return null;
    const parsed = JSON.parse(savedView) as { company?: Partial<Company>; projectId?: string | null };
    const company = parsed.company;
    return company?.id && company.name && company.slug && (parsed.projectId === null || typeof parsed.projectId === "string")
      ? { company: { id: company.id, name: company.name, slug: company.slug }, projectId: parsed.projectId }
      : null;
  } catch {
    return null;
  }
}

function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "DL"; }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Belum dijadwalkan"; }
function formatActivityDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export function MemberPortal({ initialPage = "overview" }: { initialPage?: ClientAreaPage }) {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);
  const [dashboardView, setDashboardView] = useState<{ company: Company; projectId: string | null } | null>(readSavedDashboardView);

  const loadPortal = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError && userError.name !== "AuthSessionMissingError") throw userError;
      const user = userResult.user;
      setUserEmail(user?.email ?? null);
      if (!user) { setData(null); return; }
      const [{ data: profile, error: profileError }, { data: memberships, error: membershipError }] = await Promise.all([
        supabase.from("profiles").select("access_level").eq("id", user.id).maybeSingle(),
        supabase.from("company_memberships").select("company_id, role").eq("user_id", user.id).limit(1),
      ]);
      if (profileError) throw profileError;
      if (membershipError) throw membershipError;
      let membership = (memberships?.[0] ?? null) as Membership | null;
      const isSuperAdmin = profile?.access_level === "super_admin";
      if (!membership && isSuperAdmin) {
        const { data: fallbackCompany, error: fallbackError } = await supabase.from("companies").select("id").order("name").limit(1);
        if (fallbackError) throw fallbackError;
        membership = fallbackCompany?.[0] ? { company_id: fallbackCompany[0].id, role: "admin" } : null;
      }
      if (!membership) { setData(null); setNotice("Akun Anda sudah masuk, tetapi belum memiliki akses ke ruang perusahaan. Hubungi project lead Diksilab."); return; }
      const { data: companyResult, error: companyError } = await supabase.from("companies").select("id, name, slug").eq("id", membership.company_id).single();
      if (companyError) throw companyError;
      const company = companyResult as Company;
      const { data: projectResult, error: projectError } = await supabase.from("projects").select("id, name, status, progress, due_on").eq("company_id", company.id).order("created_at", { ascending: false }).limit(1);
      if (projectError) throw projectError;
      const project = (projectResult?.[0] ?? null) as Project | null;
      const projectId = project?.id;
      const [cycleResponse, workResponse, activityResponse, spendResponse, documentResponse] = await Promise.all([
        projectId ? supabase.from("cycles").select("id, name, starts_on, ends_on, status, summary").eq("project_id", projectId).order("starts_on", { ascending: false }).limit(1) : Promise.resolve({ data: [], error: null }),
        projectId ? supabase.from("project_tasks").select("id, project_id, cycle_id, workstream, title, status, due_on, created_at").eq("project_id", projectId).order("due_on", { ascending: true }) : Promise.resolve({ data: [], error: null }),
        projectId ? supabase.from("activities").select("id, detail, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(8) : Promise.resolve({ data: [], error: null }),
        projectId ? supabase.from("ad_spend").select("id, channel, budget, amount_spent, currency, recorded_on").eq("project_id", projectId).order("recorded_on", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        supabase.from("documents").select("id, name, storage_path, content_type, byte_size, created_at").eq("company_id", company.id).order("created_at", { ascending: false }).limit(8),
      ]);
      for (const response of [cycleResponse, workResponse, activityResponse, spendResponse, documentResponse]) if (response.error) throw response.error;
      const projectTasks = (workResponse.data ?? []) as Array<{ id: string; project_id: string; cycle_id: string | null; workstream: string; title: string; status: string; due_on: string | null; created_at: string }>;
      const workItems = projectTasks.map((task) => ({ id: task.id, project_id: task.project_id, cycle_id: task.cycle_id, channel: task.workstream, title: task.title, status: task.status, scheduled_for: task.due_on, owner_name: "Diksilab", created_at: task.created_at }));
      setData({ company, project, cycle: (cycleResponse.data?.[0] ?? null) as Cycle | null, workItems, activities: (activityResponse.data ?? []) as Activity[], spend: (spendResponse.data ?? []) as AdSpend[], documents: (documentResponse.data ?? []) as DocumentItem[], role: membership.role, isSuperAdmin });
      setNotice("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Data portal belum dapat dimuat."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initialLoad = window.set◊ﬁ¯∂âûÀk∫wµÁyName}</b><small>client ¬∑ lihat saja</small></div><button onClick={signOut} aria-label="Keluar">‚Üó</button></div></aside><main className={styles.content}><header className={styles.topbar}><div className={styles.breadcrumb}><span>Ruang klien</span><i>/</i><b>Ringkasan</b></div><div className={styles.topActions}><span>Data tersinkron dari ruang kerja Diksilab</span></div></header><section className={styles.intro} id="ringkasan"><div><p className={styles.eyebrow}>SELAMAT DATANG, {displayName.toUpperCase()}</p><h1>Semua yang sedang <em>bergerak.</em></h1><p>Data proyek, kalender, pengeluaran iklan, dan dokumen di bawah ini bersumber dari ruang kerja perusahaan Anda.</p></div><div className={styles.month}><span>{data.cycle?.status ?? "PROJECT"}</span><b>{data.cycle?.name ?? data.project?.name ?? "Belum ada proyek"}</b><small>‚óè Data aktif</small></div></section><section className={styles.stats} aria-label="Ringkasan proyek"><article><span>PROGRES PROYEK</span><strong>{data.project?.progress ?? 0}<span>%</span></strong><div className={styles.track}><b style={{ width: `${data.project?.progress ?? 0}%` }} /></div><small>{data.project?.due_on ? `Target selesai ${formatDate(data.project.due_on)}` : "Target belum ditetapkan"}</small></article><article><span>PEKERJAAN AKTIF</span><strong>{String(metrics.active).padStart(2, "0")}</strong><p>Item pada kalender dan produksi<br />yang belum selesai.</p></article><article><span>ITEM PERLU DITINJAU</span><strong>{String(metrics.review).padStart(2, "0")}</strong><p><a href="#proyek">Lihat pekerjaan proyek <i>‚Üí</i></a></p></article></section><section className={styles.project} id="proyek"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>PROYEK UTAMA</p><h2>{data.project?.name ?? "Belum ada proyek aktif"}</h2></div><a href="#aktivitas">Lihat semua aktivitas <span>‚Üí</span></a></div><div className={styles.projectBody}><div className={styles.roadmap}><div className={styles.roadmapTop}><p>Cycle aktif</p><span>{data.cycle ? `${formatDate(data.cycle.starts_on)} ‚Äî ${formatDate(data.cycle.ends_on)}` : "Belum dibuat"}</span></div><div className={live.cycleSummary}>{data.cycle?.summary ?? "Tim akan menambahkan ringkasan cycle setelah proyek dan jadwal disiapkan."}</div></div><aside className={styles.review}><div><span className={styles.alert}>‚úì</span><p className={styles.eyebrow}>AKSES TERLINDUNGI</p></div><h3>Ruang ini hanya menampilkan data perusahaan Anda.</h3><p>Klien tidak dapat mengubah pekerjaan, progress, atau biaya.</p></aside></div></section><PortalTools workItems={data.workItems} spend={data.spend} documents={data.documents} onUpload={uploadFile} canUpload={false} /><section className={styles.lower}><section className={styles.taskPanel}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>YANG SEDANG DIKERJAKAN</p><h2>Daftar pekerjaan</h2></div></div><div className={styles.taskList}>{data.workItems.slice(0, 6).map((item) => <article key={item.id}><span className={styles.state}>{item.status}</span><div><b>{item.title}</b><small>{item.owner_name ?? item.channel}</small></div><time>{formatDate(item.scheduled_for)}</time></article>)}{data.workItems.length === 0 ? <p className={live.empty}>Belum ada pekerjaan yang dipublikasikan.</p> : null}</div></section><section className={styles.activityPanel} id="aktivitas"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>JEJAK KERJA</p><h2>Aktivitas terbaru</h2></div></div><div className={styles.activityList}>{data.activities.map((activity, index) => <article key={activity.id}><span className={index === 0 ? styles.fresh : ""} /><div><small>{formatActivityDate(activity.created_at)}</small><p>{activity.detail}</p></div></article>)}{data.activities.length === 0 ? <p className={live.empty}>Aktivitas akan muncul setelah tim mulai memperbarui proyek.</p> : null}</div></section></section><footer className={styles.footer}>Diksilab Client Area <span>‚Ä¢</span> Data proyek bersifat rahasia</footer></main></div>;
}

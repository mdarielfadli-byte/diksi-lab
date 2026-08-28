"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import { PortalTools, type AdSpend, type DocumentItem, type WorkItem } from "./PortalTools";
import styles from "./portal.module.css";
import live from "./portal-live.module.css";

type Company = { id: string; name: string; slug: string };
type Project = { id: string; name: string; status: string; progress: number; due_on: string | null };
type Cycle = { id: string; name: string; starts_on: string; ends_on: string; status: string; summary: string | null };
type Activity = { id: string; detail: string; created_at: string };
type Membership = { company_id: string; role: string };
type PortalData = { company: Company; project: Project | null; cycle: Cycle | null; workItems: WorkItem[]; activities: Activity[]; spend: AdSpend[]; documents: DocumentItem[]; role: string };

function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "DL"; }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Belum dijadwalkan"; }
function formatActivityDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export function MemberPortal() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);

  const loadPortal = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError && userError.name !== "AuthSessionMissingError") throw userError;
      const user = userResult.user;
      setUserEmail(user?.email ?? null);
      if (!user) { setData(null); return; }
      const { data: memberships, error: membershipError } = await supabase.from("company_memberships").select("company_id, role").eq("user_id", user.id).limit(1);
      if (membershipError) throw membershipError;
      const membership = (memberships?.[0] ?? null) as Membership | null;
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
        projectId ? supabase.from("work_items").select("id, project_id, cycle_id, channel, title, status, scheduled_for, owner_name, created_at").eq("project_id", projectId).order("scheduled_for", { ascending: true }) : Promise.resolve({ data: [], error: null }),
        projectId ? supabase.from("activities").select("id, detail, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(8) : Promise.resolve({ data: [], error: null }),
        projectId ? supabase.from("ad_spend").select("id, channel, budget, amount_spent, currency, recorded_on").eq("project_id", projectId).order("recorded_on", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        supabase.from("documents").select("id, name, storage_path, content_type, byte_size, created_at").eq("company_id", company.id).order("created_at", { ascending: false }).limit(8),
      ]);
      for (const response of [cycleResponse, workResponse, activityResponse, spendResponse, documentResponse]) if (response.error) throw response.error;
      setData({ company, project, cycle: (cycleResponse.data?.[0] ?? null) as Cycle | null, workItems: (workResponse.data ?? []) as WorkItem[], activities: (activityResponse.data ?? []) as Activity[], spend: (spendResponse.data ?? []) as AdSpend[], documents: (documentResponse.data ?? []) as DocumentItem[], role: membership.role });
      setNotice("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Data portal belum dapat dimuat."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadPortal();
    const supabase = getSupabaseBrowserClient();
    const { data: listener } = supabase.auth.onAuthStateChange(() => void loadPortal());
    return () => listener.subscription.unsubscribe();
  }, [loadPortal]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSending(true);
    try {
      const { error: otpError } = await getSupabaseBrowserClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/member-area`, shouldCreateUser: false } });
      if (otpError) throw otpError;
      setNotice("Link masuk telah dikirim. Buka email Anda untuk melanjutkan.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Link masuk belum dapat dikirim."); }
    finally { setSending(false); }
  }
  async function signOut() { await getSupabaseBrowserClient().auth.signOut(); setData(null); setNotice("Anda telah keluar dari ruang klien."); }
  async function uploadFile(file: File) {
    if (!data) return;
    if (file.size > 25 * 1024 * 1024) throw new Error("Ukuran file maksimal 25 MB.");
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "file";
    const path = `${data.company.id}/${crypto.randomUUID()}.${extension}`;
    const supabase = getSupabaseBrowserClient();
    const { data: currentUser } = await supabase.auth.getUser();
    const { error: uploadError } = await supabase.storage.from("client-documents").upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (uploadError) throw uploadError;
    const { error: documentError } = await supabase.from("documents").insert({ company_id: data.company.id, project_id: data.project?.id ?? null, uploaded_by: currentUser.user?.id ?? null, name: file.name, storage_path: path, content_type: file.type || null, byte_size: file.size });
    if (documentError) throw documentError;
    await loadPortal();
  }
  const metrics = useMemo(() => ({ active: data?.workItems.filter((item) => !["done", "completed", "approved"].includes(item.status.toLowerCase())).length ?? 0, review: data?.workItems.filter((item) => /review|approve|menunggu/i.test(item.status)).length ?? 0 }), [data]);
  if (loading) return <main className={live.state}><div className={live.card}>Menyiapkan ruang klien Diksilab…</div></main>;
  if (!userEmail) return <main className={live.state}><section className={live.card}><Link className={live.brand} href="/">DIKSI<span>LAB</span></Link><p className={live.eyebrow}>RUANG KLIEN</p><h1>Masuk untuk melihat yang sedang bergerak.</h1><p>Gunakan alamat email yang telah diundang oleh tim Diksilab.</p><form onSubmit={sendMagicLink}><label htmlFor="portal-email">Email kerja</label><input id="portal-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@perusahaan.com" required /><button type="submit" disabled={sending}>{sending ? "Mengirim…" : "Kirim link masuk"}</button></form>{notice ? <p className={live.notice}>{notice}</p> : null}{error ? <p className={live.error}>{error}</p> : null}</section></main>;
  if (!data) return <main className={live.state}><section className={live.card}><Link className={live.brand} href="/">DIKSI<span>LAB</span></Link><p className={live.eyebrow}>AKSES BELUM DIAKTIFKAN</p><h1>Halo, {userEmail}</h1><p>{notice || "Akses ruang klien Anda sedang diperiksa."}</p><button onClick={signOut}>Keluar</button>{error ? <p className={live.error}>{error}</p> : null}</section></main>;
  const displayName = userEmail.split("@")[0];
  return <div className={styles.portal}><aside className={styles.sidebar}><Link className={styles.brand} href="/" aria-label="Kembali ke beranda Diksilab">DIKSI<span>LAB</span></Link><div className={styles.workspace}><span className={styles.workspaceMark}>{initials(data.company.name)}</span><div><strong>{data.company.name}</strong><small>Ruang kerja klien</small></div></div><nav className={styles.menu} aria-label="Navigasi ruang klien"><a className={styles.active} href="#ringkasan">Ringkasan</a><a href="#proyek">Proyek</a><a href="#aktivitas">Aktivitas</a><a href="#dokumen">Dokumen</a></nav><div className={styles.support}><p>Butuh bantuan?</p><span>Hubungi project lead Anda untuk hal yang perlu dibicarakan.</span><a href="mailto:hello@diksilab.com">Hubungi Diksilab ↗</a></div><div className={styles.user}><span>{initials(displayName)}</span><div><b>{displayName}</b><small>{data.role}</small></div><button onClick={signOut} aria-label="Keluar">↗</button></div></aside><main className={styles.content}><header className={styles.topbar}><div className={styles.breadcrumb}><span>Ruang klien</span><i>/</i><b>Ringkasan</b></div><div className={styles.topActions}><span>Data tersinkron dari ruang kerja</span></div></header><section className={styles.intro} id="ringkasan"><div><p className={styles.eyebrow}>SELAMAT DATANG, {displayName.toUpperCase()}</p><h1>Semua yang sedang <em>bergerak.</em></h1><p>Data proyek, kalender, pengeluaran iklan, dan dokumen di bawah ini bersumber dari ruang kerja perusahaan Anda.</p></div><div className={styles.month}><span>{data.cycle?.status ?? "PROJECT"}</span><b>{data.cycle?.name ?? data.project?.name ?? "Belum ada proyek"}</b><small>● Data aktif</small></div></section><section className={styles.stats} aria-label="Ringkasan proyek"><article><span>PROGRES PROYEK</span><strong>{data.project?.progress ?? 0}<span>%</span></strong><div className={styles.track}><b style={{ width: `${data.project?.progress ?? 0}%` }} /></div><small>{data.project?.due_on ? `Target selesai ${formatDate(data.project.due_on)}` : "Target belum ditetapkan"}</small></article><article><span>PEKERJAAN AKTIF</span><strong>{String(metrics.active).padStart(2, "0")}</strong><p>Item pada kalender dan produksi<br />yang belum selesai.</p></article><article><span>ITEM PERLU DITINJAU</span><strong>{String(metrics.review).padStart(2, "0")}</strong><p><a href="#proyek">Lihat pekerjaan proyek <i>→</i></a></p></article></section><section className={styles.project} id="proyek"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>PROYEK UTAMA</p><h2>{data.project?.name ?? "Belum ada proyek aktif"}</h2></div><a href="#aktivitas">Lihat semua aktivitas <span>→</span></a></div><div className={styles.projectBody}><div className={styles.roadmap}><div className={styles.roadmapTop}><p>Cycle aktif</p><span>{data.cycle ? `${formatDate(data.cycle.starts_on)} — ${formatDate(data.cycle.ends_on)}` : "Belum dibuat"}</span></div><div className={live.cycleSummary}>{data.cycle?.summary ?? "Tim akan menambahkan ringkasan cycle setelah proyek dan jadwal disiapkan."}</div></div><aside className={styles.review}><div><span className={styles.alert}>✓</span><p className={styles.eyebrow}>AKSES TERLINDUNGI</p></div><h3>Ruang ini hanya menampilkan data perusahaan Anda.</h3><p>Dokumen dan aktivitas dibatasi oleh akses anggota perusahaan.</p></aside></div></section><PortalTools workItems={data.workItems} spend={data.spend} documents={data.documents} onUpload={uploadFile} /><section className={styles.lower}><section className={styles.taskPanel}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>YANG SEDANG DIKERJAKAN</p><h2>Daftar pekerjaan</h2></div></div><div className={styles.taskList}>{data.workItems.slice(0, 6).map((item) => <article key={item.id}><span className={styles.state}>{item.status}</span><div><b>{item.title}</b><small>{item.owner_name ?? item.channel}</small></div><time>{formatDate(item.scheduled_for)}</time></article>)}{data.workItems.length === 0 ? <p className={live.empty}>Belum ada pekerjaan yang dipublikasikan.</p> : null}</div></section><section className={styles.activityPanel} id="aktivitas"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>JEJAK KERJA</p><h2>Aktivitas terbaru</h2></div></div><div className={styles.activityList}>{data.activities.map((activity, index) => <article key={activity.id}><span className={index === 0 ? styles.fresh : ""} /><div><small>{formatActivityDate(activity.created_at)}</small><p>{activity.detail}</p></div></article>)}{data.activities.length === 0 ? <p className={live.empty}>Aktivitas akan muncul setelah tim mulai memperbarui proyek.</p> : null}</div></section></section><footer className={styles.footer}>Diksilab Client Area <span>•</span> Data proyek bersifat rahasia</footer></main></div>;
}

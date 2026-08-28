"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./team-workspace.module.css";

type Company = { id: string; name: string };
type Project = { id: string; name: string; progress: number; status: string };
type WorkItem = { id: string; title: string; channel: string; status: string; scheduled_for: string | null; owner_name: string | null };

export function TeamWorkspace({ userEmail, initialCompanyId, isSuperAdmin, onSignOut }: { userEmail: string; initialCompanyId: string; isSuperAdmin: boolean; onSignOut: () => Promise<void> }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [items, setItems] = useState<WorkItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) return;
    const memberships = isSuperAdmin ? null : await supabase.from("company_memberships").select("company_id").eq("user_id", userResult.user.id);
    if (memberships?.error) throw memberships.error;
    const permittedIds = memberships?.data?.map((membership: { company_id: string }) => membership.company_id) ?? [];
    const companyResponse = isSuperAdmin ? await supabase.from("companies").select("id, name").order("name") : permittedIds.length ? await supabase.from("companies").select("id, name").in("id", permittedIds).order("name") : { data: [], error: null };
    if (companyResponse.error) throw companyResponse.error;
    const nextCompanies = (companyResponse.data ?? []) as Company[];
    setCompanies(nextCompanies);
    const validCompanyId = nextCompanies.some((company) => company.id === companyId) ? companyId : nextCompanies[0]?.id ?? "";
    setCompanyId(validCompanyId);
    if (!validCompanyId) { setProjects([]); setProjectId(""); setItems([]); return; }
    const projectResponse = await supabase.from("projects").select("id, name, progress, status").eq("company_id", validCompanyId).order("created_at", { ascending: false });
    if (projectResponse.error) throw projectResponse.error;
    const nextProjects = (projectResponse.data ?? []) as Project[];
    setProjects(nextProjects);
    const validProjectId = nextProjects.some((project) => project.id === projectId) ? projectId : nextProjects[0]?.id ?? "";
    setProjectId(validProjectId);
    if (!validProjectId) { setItems([]); return; }
    const itemResponse = await supabase.from("work_items").select("id, title, channel, status, scheduled_for, owner_name").eq("project_id", validProjectId).order("scheduled_for", { ascending: true });
    if (itemResponse.error) throw itemResponse.error;
    setItems((itemResponse.data ?? []) as WorkItem[]);
  }, [companyId, isSuperAdmin, projectId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadWorkspace().catch((caught) => setError(caught instanceof Error ? caught.message : "Ruang kerja belum dapat dimuat.")), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadWorkspace]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!projectId) return setError("Pilih atau buat proyek terlebih dahulu.");
    setBusy(true); setMessage(""); setError("");
    try {
      const title = String(form.get("title") ?? "").trim();
      const channel = String(form.get("channel") ?? "Content");
      const status = String(form.get("status") ?? "planned");
      const scheduledFor = String(form.get("scheduled_for") ?? "") || null;
      const ownerName = String(form.get("owner_name") ?? "").trim() || null;
      const supabase = getSupabaseBrowserClient();
      const { error: insertError } = await supabase.from("work_items").insert({ project_id: projectId, title, channel, status, scheduled_for: scheduledFor, owner_name: ownerName });
      if (insertError) throw insertError;
      const { error: activityError } = await supabase.from("activities").insert({ project_id: projectId, detail: `Tim Diksilab menambahkan pekerjaan: ${title}.` });
      if (activityError) throw activityError;
      event.currentTarget.reset(); setMessage("Task dan catatan aktivitas berhasil ditambahkan."); await loadWorkspace();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Task belum dapat disimpan."); }
    finally { setBusy(false); }
  }

  async function updateProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId) return;
    const value = Number(new FormData(event.currentTarget).get("progress"));
    if (!Number.isFinite(value) || value < 0 || value > 100) return setError("Progress harus antara 0–100.");
    setBusy(true); setMessage(""); setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const project = projects.find((item) => item.id === projectId);
      const { error: updateError } = await supabase.from("projects").update({ progress: value }).eq("id", projectId);
      if (updateError) throw updateError;
      const { error: activityError } = await supabase.from("activities").insert({ project_id: projectId, detail: `Progress ${project?.name ?? "proyek"} diperbarui menjadi ${value}%.` });
      if (activityError) throw activityError;
      setMessage("Progress proyek sudah diperbarui dan terlihat oleh klien."); await loadWorkspace();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Progress belum dapat diperbarui."); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.brand}>DIKSI<span>LAB</span></Link><div><b>{isSuperAdmin ? "Super admin" : "Tim Diksilab"}</b><small>{userEmail}</small></div><button onClick={() => void onSignOut()}>Keluar</button></header><section className={styles.hero}><p>RUANG KERJA INTERNAL</p><h1>Kelola progress yang<br /><em>dilihat klien.</em></h1><span>Perubahan di bawah langsung tersimpan ke proyek dan muncul pada Member Area klien yang terkait.</span></section><section className={styles.controls}><label>Perusahaan<select value={companyId} onChange={(event) => { setCompanyId(event.target.value); setProjectId(""); }}><option value="">Pilih perusahaan</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Proyek<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Pilih proyek</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></section>{!companyId ? <p className={styles.empty}>Belum ada perusahaan yang dapat Anda kelola.</p> : null}{companyId && !projectId ? <p className={styles.empty}>Belum ada proyek untuk perusahaan ini. Tambahkan proyek melalui Super Admin terlebih dahulu.</p> : null}{projectId ? <><section className={styles.actionGrid}><form className={styles.card} onSubmit={updateProgress}><p>UPDATE PROGRESS</p><h2>{projects.find((project) => project.id === projectId)?.name}</h2><label>Progress proyek (%)<input name="progress" type="number" min="0" max="100" defaultValue={projects.find((project) => project.id === projectId)?.progress ?? 0} required /></label><button disabled={busy}>Simpan progress</button></form><form className={styles.card} onSubmit={addTask}><p>TAMBAH TASK / PROGRESS</p><h2>Kalender dan aktivitas</h2><label>Judul task<input name="title" required placeholder="Contoh: Draft artikel SEO" /></label><div className={styles.dual}><label>Channel<select name="channel"><option>Instagram</option><option>LinkedIn</option><option>Article SEO</option><option>Ads</option></select></label><label>Status<select name="status"><option value="planned">Planned</option><option value="in progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></div><div className={styles.dual}><label>Jadwal<input name="scheduled_for" type="date" /></label><label>Penanggung jawab<input name="owner_name" placeholder="Nama tim" /></label></div><button disabled={busy}>Publikasikan task</button></form></section><section className={styles.list}><div><p>PEKERJAAN TERBARU</p><h2>Yang terlihat oleh klien</h2></div>{items.length ? items.map((item) => <article key={item.id}><span>{item.status}</span><b>{item.title}</b><small>{item.channel} · {item.owner_name ?? "Diksilab"}</small></article>) : <p className={styles.empty}>Belum ada task pada proyek ini.</p>}</section></> : null}{message ? <p className={styles.notice}>{message}</p> : null}{error ? <p className={styles.error}>{error}</p> : null}</main>;
}

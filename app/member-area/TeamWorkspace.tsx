"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./team-workspace.module.css";

type Company = { id: string; name: string };
type Project = { id: string; name: string; progress: number; status: string };
type Task = { id: string; title: string; workstream: string; status: string; priority: string; progress: number; due_on: string | null; client_visible: boolean; created_at: string };
type Comment = { id: string; body: string; visibility: string; created_at: string };
type Approval = { id: string; status: string; request_note: string | null; created_at: string };
type Notification = { id: string; title: string; body: string | null; read_at: string | null; created_at: string };
type Audit = { id: string; action: string; detail: { title?: string; status?: string }; created_at: string };

const workstreams = ["website", "landing_page", "seo", "crm", "email_marketing", "ads", "content", "general"];
const statuses = ["planned", "in_progress", "needs_review", "blocked", "approved", "completed"];
const label = (value: string) => value.replaceAll("_", " ");
const date = (value: string | null) => value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(value + "T00:00:00")) : "Tanpa tenggat";
const timestamp = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function TeamWorkspace({ userEmail, initialCompanyId, isSuperAdmin, onSignOut }: { userEmail: string; initialCompanyId: string; isSuperAdmin: boolean; onSignOut: () => Promise<void> }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadWorkspace = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult.user) return;
    const memberships = isSuperAdmin ? null : await supabase.from("company_memberships").select("company_id").eq("user_id", userResult.user.id);
    if (memberships?.error) throw memberships.error;
    const ids = memberships?.data?.map((membership: { company_id: string }) => membership.company_id) ?? [];
    const companyResponse = isSuperAdmin ? await supabase.from("companies").select("id, name").order("name") : ids.length ? await supabase.from("companies").select("id, name").in("id", ids).order("name") : { data: [], error: null };
    if (companyResponse.error) throw companyResponse.error;
    const nextCompanies = (companyResponse.data ?? []) as Company[];
    setCompanies(nextCompanies);
    const nextCompanyId = nextCompanies.some((company) => company.id === companyId) ? companyId : nextCompanies.find((company) => /santi/i.test(company.name))?.id ?? nextCompanies[0]?.id ?? "";
    setCompanyId(nextCompanyId);
    if (!nextCompanyId) { setProjects([]); setTasks([]); return; }
    const projectResponse = await supabase.from("projects").select("id, name, progress, status").eq("company_id", nextCompanyId).order("created_at", { ascending: false });
    if (projectResponse.error) throw projectResponse.error;
    const nextProjects = (projectResponse.data ?? []) as Project[];
    setProjects(nextProjects);
    const nextProjectId = nextProjects.some((project) => project.id === projectId) ? projectId : nextProjects[0]?.id ?? "";
    setProjectId(nextProjectId);
    if (!nextProjectId) { setTasks([]); return; }
    const [taskResponse, auditResponse, notificationResponse] = await Promise.all([
      supabase.from("project_tasks").select("id, title, workstream, status, priority, progress, due_on, client_visible, created_at").eq("project_id", nextProjectId).order("due_on", { ascending: true }),
      supabase.from("audit_logs").select("id, action, detail, created_at").eq("project_id", nextProjectId).order("created_at", { ascending: false }).limit(8),
      supabase.from("notifications").select("id, title, body, read_at, created_at").order("created_at", { ascending: false }).limit(6),
    ]);
    for (const response of [taskResponse, auditResponse, notificationResponse]) if (response.error) throw response.error;
    const nextTasks = (taskResponse.data ?? []) as Task[];
    setTasks(nextTasks); setAudit((auditResponse.data ?? []) as Audit[]); setNotifications((notificationResponse.data ?? []) as Notification[]);
    const nextTaskId = nextTasks.some((task) => task.id === selectedTaskId) ? selectedTaskId : nextTasks[0]?.id ?? "";
    setSelectedTaskId(nextTaskId);
    if (!nextTaskId) { setComments([]); setApprovals([]); return; }
    const [commentResponse, approvalResponse] = await Promise.all([
      supabase.from("task_comments").select("id, body, visibility, created_at").eq("task_id", nextTaskId).order("created_at", { ascending: false }),
      supabase.from("task_approvals").select("id, status, request_note, created_at").eq("task_id", nextTaskId).order("created_at", { ascending: false }),
    ]);
    if (commentResponse.error) throw commentResponse.error;
    if (approvalResponse.error) throw approvalResponse.error;
    setComments((commentResponse.data ?? []) as Comment[]); setApprovals((approvalResponse.data ?? []) as Approval[]);
  }, [companyId, isSuperAdmin, projectId, selectedTaskId]);

  useEffect(() => { const timer = window.setTimeout(() => void loadWorkspace().catch((caught) => setError(caught instanceof Error ? caught.message : "Ruang kerja belum dapat dimuat.")), 0); return () => window.clearTimeout(timer); }, [loadWorkspace]);
  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId) ?? null, [tasks, selectedTaskId]);
  const kpi = useMemo(() => ({ active: tasks.filter((task) => !["approved", "completed"].includes(task.status)).length, review: tasks.filter((task) => task.status === "needs_review").length, complete: tasks.filter((task) => ["approved", "completed"].includes(task.status)).length }), [tasks]);
  async function withAction(action: () => Promise<void>) { setBusy(true); setError(""); setMessage(""); try { await action(); await loadWorkspace(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Perubahan belum dapat disimpan."); } finally { setBusy(false); } }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); if (!projectId || !companyId) return;
    await withAction(async () => { const supabase = getSupabaseBrowserClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: insertError } = await supabase.from("project_tasks").insert({ company_id: companyId, project_id: projectId, title: String(form.get("title") ?? "").trim(), workstream: String(form.get("workstream")), status: String(form.get("status")), priority: String(form.get("priority")), due_on: String(form.get("due_on") || "") || null, client_visible: form.get("client_visible") === "on", created_by: auth.user.id });
      if (insertError) throw insertError; event.currentTarget.reset(); setMessage("Task disimpan; progres dan audit log diperbarui otomatis."); });
  }
  async function updateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedTask) return; const form = new FormData(event.currentTarget);
    await withAction(async () => { const { error: updateError } = await getSupabaseBrowserClient().from("project_tasks").update({ status: String(form.get("status")), progress: Number(form.get("progress")), client_visible: form.get("client_visible") === "on" }).eq("id", selectedTask.id); if (updateError) throw updateError; setMessage("Status task diperbarui."); });
  }
  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedTask || !companyId) return; const form = new FormData(event.currentTarget);
    await withAction(async () => { const supabase = getSupabaseBrowserClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: insertError } = await supabase.from("task_comments").insert({ task_id: selectedTask.id, company_id: companyId, author_id: auth.user.id, body: String(form.get("body") ?? "").trim(), visibility: String(form.get("visibility")) }); if (insertError) throw insertError; event.currentTarget.reset(); setMessage("Komentar tersimpan."); });
  }
  async function requestApproval() {
    if (!selectedTask || !companyId) return;
    await withAction(async () => { const supabase = getSupabaseBrowserClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: approvalError } = await supabase.from("task_approvals").insert({ task_id: selectedTask.id, company_id: companyId, requested_by: auth.user.id, request_note: "Mohon review: " + selectedTask.title }); if (approvalError) throw approvalError;
      const { error: taskError } = await supabase.from("project_tasks").update({ status: "needs_review" }).eq("id", selectedTask.id); if (taskError) throw taskError; setMessage("Permintaan approval dikirim."); });
  }
  async function markRead(id: string) { await withAction(async () => { const { error: updateError } = await getSupabaseBrowserClient().from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id); if (updateError) throw updateError; }); }

  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.brand}>DIKSI<span>LAB</span></Link><div><b>{isSuperAdmin ? "Super admin" : "Tim Diksilab"}</b><small>{userEmail}</small></div><button onClick={() => void onSignOut()}>Keluar</button></header><section className={styles.hero}><p>RUANG KERJA INTERNAL</p><h1>Kelola progress yang<br /><em>dipantau klien.</em></h1><span>Task, approval, komentar, notifikasi, dan audit log tersimpan pada proyek. Hanya task yang Anda tandai terlihat yang muncul untuk klien.</span></section><section className={styles.controls}><label>Perusahaan<select value={companyId} onChange={(event) => { setCompanyId(event.target.value); setProjectId(""); }}><option value="">Pilih perusahaan</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label><label>Proyek<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Pilih proyek</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></section>{projectId ? <><section className={styles.kpi}><article><small>PROGRES OTOMATIS</small><b>{projects.find((project) => project.id === projectId)?.progress ?? 0}%</b><span>Dihitung dari task selesai</span></article><article><small>TASK AKTIF</small><b>{kpi.active}</b><span>Termasuk yang diblokir</span></article><article><small>MENUNGGU REVIEW</small><b>{kpi.review}</b><span>Siap diperiksa klien</span></article><article><small>SELESAI</small><b>{kpi.complete}</b><span>Approved / completed</span></article></section><section className={styles.actionGrid}><form className={styles.card} onSubmit={addTask}><p>TAMBAH TASK</p><h2>Rencana kerja baru</h2><label>Judul task<input name="title" required placeholder="Contoh: Audit teknis SEO" /></label><div className={styles.dual}><label>Workstream<select name="workstream">{workstreams.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label><label>Status<select name="status">{statuses.slice(0, 4).map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label></div><div className={styles.dual}><label>Prioritas<select name="priority"><option value="normal">Normal</option><option value="high">Tinggi</option><option value="urgent">Mendesak</option><option value="low">Rendah</option></select></label><label>Tenggat<input name="due_on" type="date" /></label></div><label className={styles.check}><input name="client_visible" type="checkbox" defaultChecked /> Tampilkan kepada klien</label><button disabled={busy}>Simpan task</button></form><form className={styles.card} onSubmit={updateTask}><p>UPDATE TASK</p><h2>{selectedTask?.title ?? "Pilih task"}</h2>{selectedTask ? <><label>Status<select name="status" defaultValue={selectedTask.status}>{statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label><label>Progress task (%)<input name="progress" type="number" min="0" max="100" defaultValue={selectedTask.progress} /></label><label className={styles.check}><input name="client_visible" type="checkbox" defaultChecked={selectedTask.client_visible} /> Tampilkan kepada klien</label><div className={styles.inline}><button disabled={busy}>Simpan update</button><button type="button" className={styles.secondary} onClick={() => void requestApproval()} disabled={busy || approvals.some((approval) => approval.status === "pending")}>Minta approval</button></div></> : <p className={styles.empty}>Pilih task dari daftar di bawah.</p>}</form></section><section className={styles.workspaceGrid}><section className={styles.list}><div><p>TASK PROYEK</p><h2>Board kerja</h2></div>{tasks.map((task) => <button type="button" key={task.id} className={task.id === selectedTaskId ? styles.selectedTask : ""} onClick={() => setSelectedTaskId(task.id)}><span>{label(task.status)}</span><b>{task.title}</b><small>{label(task.workstream)} · {date(task.due_on)} · {task.client_visible ? "terlihat klien" : "internal"}</small></button>)}{tasks.length === 0 ? <p className={styles.empty}>Belum ada task pada proyek ini.</p> : null}</section><section className={styles.context}><p>DISKUSI & APPROVAL</p><h2>{selectedTask?.title ?? "Pilih task"}</h2>{selectedTask ? <><form onSubmit={addComment}><textarea name="body" required placeholder="Catatan progress atau pertanyaan…" /><div className={styles.inline}><select name="visibility"><option value="team">Internal team</option><option value="client">Terlihat klien</option></select><button disabled={busy}>Kirim komentar</button></div></form><div className={styles.feed}>{approvals.map((approval) => <article key={approval.id}><b>Approval {label(approval.status)}</b><small>{approval.request_note ?? "Tanpa catatan"} · {timestamp(approval.created_at)}</small></article>)}{comments.map((comment) => <article key={comment.id}><b>{comment.visibility === "client" ? "Untuk klien" : "Internal"}</b><small>{comment.body} · {timestamp(comment.created_at)}</small></article>)}</div></> : null}</section></section><section className={styles.workspaceGrid}><section className={styles.context}><p>NOTIFIKASI SAYA</p><h2>Yang perlu diperhatikan</h2><div className={styles.feed}>{notifications.map((notification) => <button type="button" key={notification.id} onClick={() => void markRead(notification.id)}><b>{notification.read_at ? "Dibaca" : "Baru"} · {notification.title}</b><small>{notification.body ?? ""} · {timestamp(notification.created_at)}</small></button>)}{notifications.length === 0 ? <p className={styles.empty}>Belum ada notifikasi untuk akun ini.</p> : null}</div></section><section className={styles.context}><p>AUDIT LOG</p><h2>Jejak perubahan</h2><div className={styles.feed}>{audit.map((entry) => <article key={entry.id}><b>{label(entry.action)}</b><small>{entry.detail.title ?? "Task"} · {entry.detail.status ? label(entry.detail.status) : ""} · {timestamp(entry.created_at)}</small></article>)}{audit.length === 0 ? <p className={styles.empty}>Perubahan pada task akan tercatat otomatis di sini.</p> : null}</div></section></section></> : <p className={styles.empty}>Pilih proyek untuk membuka workspace.</p>}{message ? <p className={styles.notice}>{message}</p> : null}{error ? <p className={styles.error}>{error}</p> : null}</main>;
}

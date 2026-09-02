"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./client-project-actions.module.css";

type Task = {
  id: string;
  title: string;
  workstream: string;
  status: string;
  progress: number;
  due_on: string | null;
};
type Approval = {
  id: string;
  task_id: string;
  status: "pending" | "approved" | "revision_requested";
  request_note: string | null;
  response_note: string | null;
  created_at: string;
};
type Comment = {
  id: string;
  task_id: string;
  body: string;
  created_at: string;
};
type ChecklistItem = {
  id: string;
  task_id: string;
  label: string;
  is_done: boolean;
};
type FileItem = {
  id: string;
  task_id: string;
  name: string;
  storage_path: string;
  version_label: string;
  review_status: string;
};

const label = (value: string) => value.replaceAll("_", " ");
const due = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(new Date(`${value}T00:00:00`))
    : "Tanpa tenggat";

export function ClientProjectActions({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string | null;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [responseNote, setResponseNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) return;
    const supabase = getSupabaseBrowserClient();
    const { data: taskData, error: taskError } = await supabase
      .from("project_tasks")
      .select("id,title,workstream,status,progress,due_on")
      .eq("project_id", projectId)
      .order("due_on", { ascending: true });
    if (taskError) throw taskError;
    const nextTasks = (taskData ?? []) as Task[];
    setTasks(nextTasks);
    const ids = nextTasks.map((task) => task.id);
    if (!ids.length) {
      setApprovals([]);
      setComments([]);
      setChecklist([]);
      setFiles([]);
      return;
    }
    if (!nextTasks.some((task) => task.id === selectedTaskId))
      setSelectedTaskId(nextTasks[0].id);
    const [approvalResponse, commentResponse, checklistResponse, fileResponse] =
      await Promise.all([
        supabase
          .from("task_approvals")
          .select("id,task_id,status,request_note,response_note,created_at")
          .in("task_id", ids)
          .order("created_at", { ascending: false }),
        supabase
          .from("task_comments")
          .select("id,task_id,body,created_at")
          .in("task_id", ids)
          .order("created_at", { ascending: false }),
        supabase
          .from("task_checklist_items")
          .select("id,task_id,label,is_done")
          .in("task_id", ids)
          .order("position", { ascending: true }),
        supabase
          .from("task_files")
          .select("id,task_id,name,storage_path,version_label,review_status")
          .in("task_id", ids)
          .order("created_at", { ascending: false }),
      ]);
    for (const response of [
      approvalResponse,
      commentResponse,
      checklistResponse,
      fileResponse,
    ])
      if (response.error) throw response.error;
    setApprovals((approvalResponse.data ?? []) as Approval[]);
    setComments((commentResponse.data ?? []) as Comment[]);
    setChecklist((checklistResponse.data ?? []) as ChecklistItem[]);
    setFiles((fileResponse.data ?? []) as FileItem[]);
  }, [projectId, selectedTaskId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load().catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "Data interaktif belum dapat dimuat.",
        ),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const selected = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );
  const selectedApprovals = approvals.filter(
    (item) => item.task_id === selectedTaskId,
  );

  async function decide(
    approvalId: string,
    status: "approved" | "revision_requested",
  ) {
    setError("");
    setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: updateError } = await supabase
        .from("task_approvals")
        .update({
          status,
          decided_by: auth.user.id,
          decided_at: new Date().toISOString(),
          response_note: responseNote.trim() || null,
        })
        .eq("id", approvalId)
        .eq("status", "pending");
      if (updateError) throw updateError;
      setResponseNote("");
      setMessage(
        status === "approved"
          ? "Approval telah dikirim ke tim Diksilab."
          : "Permintaan revisi telah dikirim ke tim Diksilab.",
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Keputusan belum dapat disimpan.",
      );
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setError("");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const body = String(form.get("body") ?? "").trim();
      if (!body) return;
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: insertError } = await supabase
        .from("task_comments")
        .insert({
          task_id: selected.id,
          company_id: companyId,
          author_id: auth.user.id,
          body,
          visibility: "client",
        });
      if (insertError) throw insertError;
      event.currentTarget.reset();
      setMessage("Komentar Anda sudah tersimpan di task ini.");
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Komentar belum dapat disimpan.",
      );
    }
  }

  async function downloadFile(file: FileItem) {
    setError("");
    setMessage("");
    try {
      const { data, error: signedUrlError } = await getSupabaseBrowserClient()
        .storage.from("client-documents")
        .createSignedUrl(file.storage_path, 60, { download: file.name });
      if (signedUrlError) throw signedUrlError;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      setMessage(
        "File dibuka melalui tautan aman yang berlaku selama satu menit.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "File belum dapat diunduh.",
      );
    }
  }

  if (!projectId) return null;
  return (
    <section
      id="client-actions"
      className={styles.panel}
      aria-label="Ruang aksi klien"
    >
      <div className={styles.header}>
        <div>
          <p>RUANG AKSI KLIEN</p>
          <h2>Review, approval, dan catatan</h2>
        </div>
        <span>{tasks.length} task aktif</span>
      </div>
      <div className={styles.grid}>
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <button
              type="button"
              key={task.id}
              className={task.id === selectedTaskId ? styles.selected : ""}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <b>{task.title}</b>
              <small>
                {label(task.workstream)} · {task.progress}% · {due(task.due_on)}
              </small>
            </button>
          ))}
          {!tasks.length ? (
            <p>Belum ada task yang dipublikasikan tim.</p>
          ) : null}
        </div>
        <div className={styles.detail}>
          {selected ? (
            <>
              <div className={styles.taskMeta}>
                <span>{label(selected.status)}</span>
                <h3>{selected.title}</h3>
              </div>
              <div className={styles.checklist}>
                <b>Checklist</b>
                {checklist
                  .filter((item) => item.task_id === selected.id)
                  .map((item) => (
                    <span key={item.id}>
                      {item.is_done ? "✓" : "○"} {item.label}
                    </span>
                  ))}
                {!checklist.some((item) => item.task_id === selected.id) ? (
                  <span>Checklist belum ditambahkan tim.</span>
                ) : null}
              </div>
              <div className={styles.approvals}>
                <b>Approval</b>
                {selectedApprovals.map((approval) => (
                  <article key={approval.id}>
                    <p>
                      {approval.request_note ??
                        "Tim meminta review atas task ini."}
                    </p>
                    <small>{label(approval.status)}</small>
                    {approval.status === "pending" ? (
                      <div>
                        <textarea
                          value={responseNote}
                          onChange={(event) =>
                            setResponseNote(event.target.value)
                          }
                          placeholder="Tambahkan catatan keputusan atau revisi (opsional)…"
                        />
                        <button
                          type="button"
                          onClick={() => void decide(approval.id, "approved")}
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          className={styles.revision}
                          onClick={() =>
                            void decide(approval.id, "revision_requested")
                          }
                        >
                          Minta revisi
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
                {!selectedApprovals.length ? (
                  <span>Belum ada approval yang menunggu.</span>
                ) : null}
              </div>
              <form onSubmit={addComment}>
                <label htmlFor="client-comment">
                  Catatan untuk tim Diksilab
                </label>
                <textarea
                  id="client-comment"
                  name="body"
                  required
                  placeholder="Tulis feedback, pertanyaan, atau revisi…"
                />
                <button>Kirim komentar</button>
              </form>
              <div className={styles.files}>
                <b>File pada task</b>
                {files
                  .filter((file) => file.task_id === selected.id)
                  .map((file) => (
                    <button
                      type="button"
                      key={file.id}
                      onClick={() => void downloadFile(file)}
                      style={{
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        color: "inherit",
                        font: "inherit",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      ▤ {file.name} · {file.version_label} ·{" "}
                      {label(file.review_status)} · Unduh ↓
                    </button>
                  ))}
                {!files.some((file) => file.task_id === selected.id) ? (
                  <span>Belum ada file yang dibagikan.</span>
                ) : null}
              </div>
              <div className={styles.comments}>
                {comments
                  .filter((comment) => comment.task_id === selected.id)
                  .map((comment) => (
                    <p key={comment.id}>
                      {comment.body}{" "}
                      <small>
                        ·{" "}
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(comment.created_at))}
                      </small>
                    </p>
                  ))}
              </div>
            </>
          ) : (
            <p>Pilih task untuk melihat detail.</p>
          )}
        </div>
      </div>
      {message ? <p className={styles.notice}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./client-document-library.module.css";

type LibraryFile = {
  id: string;
  name: string;
  storage_path: string;
  content_type: string | null;
  byte_size: number | null;
  created_at: string;
  source: "Dokumen proyek" | "Lampiran task" | "Lampiran meeting";
  context: string;
  status: string | null;
};
type FileFilter = "Semua file" | "Dokumen proyek" | "Lampiran task" | "Lampiran meeting";
const filters: FileFilter[] = ["Semua file", "Dokumen proyek", "Lampiran task", "Lampiran meeting"];

function formatSize(bytes: number | null) {
  if (!bytes) return "Ukuran tidak tersedia";
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function fileType(file: LibraryFile) {
  const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  return extension.length <= 5 ? extension : "FILE";
}

export function ClientDocumentLibrary({ companyId, projectId }: { companyId: string; projectId: string | null }) {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [filter, setFilter] = useState<FileFilter>("Semua file");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!projectId) {
      setFiles([]);
      setLoading(false);
      return;
    }
    const db = getSupabaseBrowserClient();
    const [documents, tasks, taskFiles, meetings] = await Promise.all([
      db.from("documents").select("id,name,storage_path,content_type,byte_size,created_at").eq("company_id", companyId).eq("project_id", projectId).order("created_at", { ascending: false }),
      db.from("project_tasks").select("id,title").eq("project_id", projectId),
      db.from("task_files").select("id,task_id,name,storage_path,content_type,byte_size,created_at,review_status,client_visible").eq("project_id", projectId).eq("client_visible", true).order("created_at", { ascending: false }),
      db.from("meeting_files").select("id,meeting_id,name,storage_path,content_type,byte_size,created_at,client_visible").eq("project_id", projectId).eq("client_visible", true).order("created_at", { ascending: false }),
    ]);
    for (const response of [documents, tasks, taskFiles, meetings]) {
      if (response.error) throw response.error;
    }
    const taskRows = (tasks.data ?? []) as Array<{ id: string; title: string }>;
    const taskFileRows = (taskFiles.data ?? []) as Array<{
      id: string; task_id: string; name: string; storage_path: string;
      content_type: string | null; byte_size: number | null; created_at: string;
      review_status: string; client_visible: boolean;
    }>;
    const meetingFileRows = (meetings.data ?? []) as Array<{
      id: string; meeting_id: string; name: string; storage_path: string;
      content_type: string | null; byte_size: number | null; created_at: string;
      client_visible: boolean;
    }>;
    const taskNames = new Map(taskRows.map((task) => [task.id, task.title]));
    const meetingIds = [...new Set(meetingFileRows.map((file) => file.meeting_id))];
    const meetingResponse = meetingIds.length
      ? await db.from("project_meetings").select("id,title").in("id", meetingIds)
      : { data: [], error: null };
    if (meetingResponse.error) throw meetingResponse.error;
    const meetingRows = (meetingResponse.data ?? []) as Array<{ id: string; title: string }>;
    const meetingNames = new Map(meetingRows.map((meeting) => [meeting.id, meeting.title]));
    const documentRows = (documents.data ?? []) as Array<{
      id: string; name: string; storage_path: string; content_type: string | null;
      byte_size: number | null; created_at: string;
    }>;
    const allFiles: LibraryFile[] = [
      ...documentRows.map((file) => ({ ...file, source: "Dokumen proyek" as const, context: "Dokumen bersama", status: null })),
      ...taskFileRows.map((file) => ({ ...file, source: "Lampiran task" as const, context: taskNames.get(file.task_id) ?? "Task proyek", status: file.review_status.replaceAll("_", " ") })),
      ...meetingFileRows.map((file) => ({ ...file, source: "Lampiran meeting" as const, context: meetingNames.get(file.meeting_id) ?? "Meeting proyek", status: null })),
    ];
    setFiles(allFiles.sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }, [companyId, projectId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => load())
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "File proyek belum dapat dimuat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [load]);

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return files.filter((file) => (filter === "Semua file" || file.source === filter)
      && (!query || `${file.name} ${file.source} ${file.context} ${file.status ?? ""}`.toLowerCase().includes(query)));
  }, [files, filter, search]);

  async function download(file: LibraryFile) {
    setError("");
    setNotice("");
    setDownloadingId(file.id);
    try {
      const { data, error: signedUrlError } = await getSupabaseBrowserClient().storage
        .from("client-documents")
        .createSignedUrl(file.storage_path, 60, { download: file.name });
      if (signedUrlError) throw signedUrlError;
      const anchor = window.document.createElement("a");
      anchor.href = data.signedUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
      setNotice(`Tautan aman untuk “${file.name}” aktif selama satu menit.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "File belum dapat diunduh.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className={styles.library} aria-labelledby="document-library-title">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>PROJECT FILES</p>
          <h2 id="document-library-title">Files, links & deliverables</h2>
          <p>Materi kickoff, hasil kerja, dan lampiran meeting ada di sini. File hanya bisa dibuka oleh anggota project yang memiliki akses.</p>
        </div>
        <div className={styles.total}><strong>{files.length}</strong><span>files shared</span></div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari file, task, atau meeting…" aria-label="Cari file proyek" />
        </label>
        <div className={styles.filters} role="group" aria-label="Filter kategori file">
          {filters.map((item) => (
            <button key={item} type="button" className={filter === item ? styles.selectedFilter : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>
          ))}
        </div>
      </div>

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      {error ? <p className={styles.error} role="alert">File belum bisa dimuat atau diunduh: {error}</p> : null}
      {loading ? <p className={styles.empty}>Loading project files…</p> : null}
      {!loading && !projectId ? <p className={styles.empty}>Belum ada project yang terhubung ke ruang ini.</p> : null}
      {!loading && projectId && visibleFiles.length ? (
        <div className={styles.fileList}>
          {visibleFiles.map((file) => (
            <article className={styles.fileCard} key={`${file.source}-${file.id}`}>
              <span className={styles.type}>{fileType(file)}</span>
              <div className={styles.fileDetails}>
                <div className={styles.fileHeading}><h3>{file.name}</h3>{file.status ? <span className={styles.status}>{file.status}</span> : null}</div>
                <p>{file.context}</p>
                <div className={styles.meta}><span>{file.source}</span><i>·</i><span>{formatSize(file.byte_size)}</span><i>·</i><time dateTime={file.created_at}>{formatDate(file.created_at)}</time></div>
              </div>
              <button className={styles.download} type="button" onClick={() => void download(file)} disabled={downloadingId === file.id}>
                {downloadingId === file.id ? "Menyiapkan link…" : "Download file ↓"}
              </button>
            </article>
          ))}
        </div>
      ) : null}
      {!loading && projectId && visibleFiles.length === 0 ? (
        <div className={styles.emptyState}><span>▤</span><h3>{search ? "File tidak ditemukan" : "Belum ada file yang dibagikan"}</h3><p>{search ? "Coba keyword atau kategori lain." : "File kickoff, deliverable, dan lampiran meeting akan muncul di sini setelah dibagikan oleh team Diksilab."}</p></div>
      ) : null}
    </section>
  );
}

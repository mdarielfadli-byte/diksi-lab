"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./client-document-library.module.css";

type LibraryFile = {
  id: string;
  name: string;
  storage_path: string | null;
  external_url: string | null;
  content_type: string | null;
  byte_size: number | null;
  created_at: string;
  pic: string | null;
  objective: string | null;
  cycle_label: string | null;
  notes: string | null;
  source: "Dokumen proyek" | "Lampiran task" | "Lampiran meeting" | "Link dokumen";
  context: string;
  status: string | null;
};
type FileFilter = "Semua" | "File upload" | "Link dokumen" | "Lampiran task" | "Lampiran meeting";
const filters: FileFilter[] = ["Semua", "File upload", "Link dokumen", "Lampiran task", "Lampiran meeting"];
const acceptedTypes = ".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.webp";
const maxFileSize = 25 * 1024 * 1024;
const googleDocumentHosts = new Set(["docs.google.com", "drive.google.com", "sheets.google.com"]);

function parseGoogleDocumentUrl(value: string) {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== "https:") throw new Error("Gunakan link Google dengan HTTPS.");
  if (!googleDocumentHosts.has(parsed.hostname.toLowerCase())) {
    throw new Error("Gunakan link dari Google Docs, Google Sheets, atau Google Drive.");
  }
  return parsed.toString();
}

function formatSize(bytes: number | null) {
  if (!bytes) return "Ukuran tidak tersedia";
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function fileType(file: LibraryFile) {
  if (file.external_url) return "LINK";
  const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  return extension.length <= 5 ? extension : "FILE";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Coba lagi atau hubungi project lead Diksilab.";
}

export function ClientDocumentLibrary({ companyId, projectId, isTeam = false }: { companyId: string; projectId: string | null; isTeam?: boolean }) {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [filter, setFilter] = useState<FileFilter>("Semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPic, setLinkPic] = useState("");
  const [linkObjective, setLinkObjective] = useState("");
  const [linkCycle, setLinkCycle] = useState("");
  const [linkNotes, setLinkNotes] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setFiles([]);
      setLoading(false);
      return;
    }
    const db = getSupabaseBrowserClient();
    let taskFilesQuery = db.from("task_files").select("id,task_id,name,storage_path,content_type,byte_size,created_at,review_status").eq("project_id", projectId).order("created_at", { ascending: false });
    let meetingFilesQuery = db.from("meeting_files").select("id,meeting_id,name,storage_path,content_type,byte_size,created_at").eq("project_id", projectId).order("created_at", { ascending: false });
    if (!isTeam) {
      taskFilesQuery = taskFilesQuery.eq("client_visible", true);
      meetingFilesQuery = meetingFilesQuery.eq("client_visible", true);
    }
    const [documents, tasks, taskFiles, meetingFiles] = await Promise.all([
      db.from("documents").select("id,name,storage_path,external_url,content_type,byte_size,created_at,pic,objective,cycle_label,notes").eq("company_id", companyId).eq("project_id", projectId).order("created_at", { ascending: false }),
      db.from("project_tasks").select("id,title").eq("project_id", projectId),
      taskFilesQuery,
      meetingFilesQuery,
    ]);
    for (const response of [documents, tasks, taskFiles, meetingFiles]) if (response.error) throw response.error;

    const taskRows = (tasks.data ?? []) as Array<{ id: string; title: string }>;
    const taskNames = new Map(taskRows.map((task) => [task.id, task.title]));
    const taskIds = [...new Set(((taskFiles.data ?? []) as Array<{ task_id: string }>).map((file) => file.task_id))];
    const meetingIds = [...new Set(((meetingFiles.data ?? []) as Array<{ meeting_id: string }>).map((file) => file.meeting_id))];
    const [taskResponses, meetingResponses] = await Promise.all([
      taskIds.length ? db.from("project_tasks").select("id,title").in("id", taskIds) : Promise.resolve({ data: [], error: null }),
      meetingIds.length ? db.from("project_meetings").select("id,title").in("id", meetingIds) : Promise.resolve({ data: [], error: null }),
    ]);
    if (taskResponses.error) throw taskResponses.error;
    if (meetingResponses.error) throw meetingResponses.error;
    const taskNameMap = new Map(((taskResponses.data ?? []) as Array<{ id: string; title: string }>).map((task) => [task.id, task.title]));
    const meetingNameMap = new Map(((meetingResponses.data ?? []) as Array<{ id: string; title: string }>).map((meeting) => [meeting.id, meeting.title]));

    const allFiles: LibraryFile[] = [
      ...((documents.data ?? []) as Array<Omit<LibraryFile, "source" | "context" | "status">>).map((file) => ({
        ...file,
        source: file.external_url ? "Link dokumen" as const : "Dokumen proyek" as const,
        context: file.external_url ? "Link yang dibagikan anggota project" : "Dokumen bersama project",
        status: null,
      })),
      ...((taskFiles.data ?? []) as Array<{ id: string; task_id: string; name: string; storage_path: string; content_type: string | null; byte_size: number | null; created_at: string; review_status: string }>).map((file) => ({
        ...file, external_url: null, pic: null, objective: null, cycle_label: null, notes: null, source: "Lampiran task" as const,
        context: taskNameMap.get(file.task_id) ?? taskNames.get(file.task_id) ?? "Task project",
        status: file.review_status.replaceAll("_", " "),
      })),
      ...((meetingFiles.data ?? []) as Array<{ id: string; meeting_id: string; name: string; storage_path: string; content_type: string | null; byte_size: number | null; created_at: string }>).map((file) => ({
        ...file, external_url: null, pic: null, objective: null, cycle_label: null, notes: null, source: "Lampiran meeting" as const,
        context: meetingNameMap.get(file.meeting_id) ?? "Meeting project", status: null,
      })),
    ];
    setFiles(allFiles.sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }, [companyId, isTeam, projectId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => load()).catch((caught) => {
      if (active) setError(`Dokumen belum dapat dimuat. ${errorMessage(caught)}`);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [load]);

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return files.filter((file) => {
      const matchesFilter = filter === "Semua"
        || (filter === "File upload" && file.source !== "Link dokumen")
        || file.source === filter;
      return matchesFilter && (!query || `${file.name} ${file.source} ${file.context} ${file.status ?? ""} ${file.external_url ?? ""}`.toLowerCase().includes(query));
    });
  }, [files, filter, search]);

  async function uploadSelectedFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length || !projectId) return;
    setError("");
    setNotice("");
    setUploading(true);
    let uploaded = 0;
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError || !userResult.user) throw userError ?? new Error("Sesi Anda sudah berakhir. Silakan masuk kembali.");
      for (const file of selected) {
        if (file.size > maxFileSize) throw new Error(`“${file.name}” melebihi batas 25 MB.`);
        const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "file";
        const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("client-documents").upload(path, file, {
          contentType: file.type || undefined,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { error: rowError } = await supabase.from("documents").insert({
          company_id: companyId,
          project_id: projectId,
          uploaded_by: userResult.user.id,
          name: file.name,
          storage_path: path,
          external_url: null,
          content_type: file.type || null,
          byte_size: file.size,
        });
        if (rowError) {
          await supabase.storage.from("client-documents").remove([path]);
          throw rowError;
        }
        uploaded += 1;
      }
      await load();
      setNotice(`${uploaded} file berhasil diunggah dan dibagikan ke project.`);
    } catch (caught) {
      setError(`Upload belum berhasil. ${errorMessage(caught)}`);
      if (uploaded) {
        await load();
        setNotice(`${uploaded} file sudah berhasil diunggah sebelum proses berikutnya terhenti.`);
      }
    } finally {
      setUploading(false);
    }
  }

  async function addDocumentLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!projectId) return;
    const name = linkName.trim();
    try {
      const normalizedUrl = parseGoogleDocumentUrl(linkUrl);
      setUploading(true);
      const supabase = getSupabaseBrowserClient();
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError || !userResult.user) throw userError ?? new Error("Sesi Anda sudah berakhir. Silakan masuk kembali.");
      const { error: insertError } = await supabase.from("documents").insert({
        company_id: companyId,
        project_id: projectId,
        uploaded_by: userResult.user.id,
        name,
        storage_path: null,
        external_url: normalizedUrl,
        content_type: "text/uri-list",
        byte_size: null,
        pic: linkPic.trim() || null,
        objective: linkObjective.trim() || null,
        cycle_label: linkCycle.trim() || null,
        notes: linkNotes.trim() || null,
      });
      if (insertError) throw insertError;
      setLinkName("");
      setLinkUrl("");
      setLinkPic("");
      setLinkObjective("");
      setLinkCycle("");
      setLinkNotes("");
      setShowLinkForm(false);
      await load();
      setNotice("Link Google berhasil ditambahkan ke project.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Periksa kembali URL dokumennya.");
      if (!(caught instanceof Error && /Gunakan link Google|Gunakan link dari/.test(caught.message))) {
        setError(`Link belum dapat ditambahkan. ${errorMessage(caught)}`);
      }
    } finally {
      setUploading(false);
    }
  }

  async function openFile(file: LibraryFile) {
    setError("");
    setNotice("");
    if (file.external_url) {
      window.open(file.external_url, "_blank", "noopener,noreferrer");
      return;
    }
    if (!file.storage_path) return;
    const fileWindow = window.open("about:blank", "_blank");
    if (fileWindow) fileWindow.opener = null;
    setBusyId(file.id);
    try {
      const { data, error: signedUrlError } = await getSupabaseBrowserClient().storage
        .from("client-documents")
        .createSignedUrl(file.storage_path, 300);
      if (signedUrlError) throw signedUrlError;
      if (fileWindow) fileWindow.location.replace(data.signedUrl);
      else {
        const anchor = window.document.createElement("a");
        anchor.href = data.signedUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.click();
      }
      setNotice(`Link aman untuk “${file.name}” berlaku selama lima menit.`);
    } catch (caught) {
      fileWindow?.close();
      setError(`File belum dapat dibuka. ${errorMessage(caught)}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className={styles.library} aria-labelledby="document-library-title">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>PROJECT LIBRARY</p>
          <h2 id="document-library-title">Semua file & link project</h2>
          <p>Upload file atau tambahkan Google Docs, Sheets, dan Drive link. Team dapat menambahkan materi di sini; link akan dibuka langsung di tab baru.</p>
        </div>
        <div className={styles.total}><strong>{files.length}</strong><span>file & link</span></div>
      </header>

      <div className={styles.actions}>
        <input ref={fileInput} className={styles.fileInput} type="file" multiple accept={acceptedTypes} onChange={(event) => void uploadSelectedFiles(event)} aria-label="Pilih file untuk diunggah" />
        <button type="button" className={styles.uploadButton} onClick={() => fileInput.current?.click()} disabled={uploading || !projectId}>
          <span aria-hidden="true">↑</span>{uploading ? "Sedang memproses…" : "Upload file"}
        </button>
        <button type="button" className={styles.linkButton} onClick={() => setShowLinkForm((value) => !value)} disabled={uploading || !projectId}>
          + Tambah Google Docs / Sheets / Drive
        </button>
        <small>PDF, DOCX, XLSX, PPTX, JPG, PNG, WEBP · maks. 25 MB/file</small>
      </div>

      {showLinkForm ? (
        <section className={styles.linkFormSection} aria-label="Tambah Google Drive link">
          <div className={styles.linkFormIntro}><h3>Bagikan dokumen Google</h3><p>Tempel link Google Docs, Sheets, atau Drive. Pastikan akses file di pengaturan Google sudah diberikan kepada orang yang perlu membukanya.</p></div>
          <form className={styles.linkForm} onSubmit={(event) => void addDocumentLink(event)}>
            <label>Nama dokumen<input value={linkName} onChange={(event) => setLinkName(event.target.value)} maxLength={255} placeholder="Contoh: Content calendar Cycle 1" required /></label>
            <label>Link Google Docs / Sheets / Drive<input type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://docs.google.com/…" required /></label>
            <label>PIC<input value={linkPic} onChange={(event) => setLinkPic(event.target.value)} maxLength={120} placeholder="Nama PIC" /></label>
            <label>Objective<input value={linkObjective} onChange={(event) => setLinkObjective(event.target.value)} maxLength={500} placeholder="Tujuan dokumen" /></label>
            <label>Cycle<input value={linkCycle} onChange={(event) => setLinkCycle(event.target.value)} maxLength={80} placeholder="Contoh: Cycle 1" /></label>
            <label className={styles.notesField}>Notes<textarea value={linkNotes} onChange={(event) => setLinkNotes(event.target.value)} maxLength={2000} rows={3} placeholder="Catatan atau konteks untuk klien dan team" /></label>
            <div><button type="submit" disabled={uploading || !projectId}>{uploading ? "Menyimpan…" : "Tambahkan link"}</button><button type="button" onClick={() => setShowLinkForm(false)}>Batal</button></div>
          </form>
        </section>
      ) : null}

      <div className={styles.toolbar}>
        <label className={styles.search}><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama file, task, meeting, atau URL…" aria-label="Cari dokumen project" /></label>
        <div className={styles.filters} role="group" aria-label="Filter kategori dokumen">
          {filters.map((item) => <button key={item} type="button" className={filter === item ? styles.selectedFilter : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}
        </div>
      </div>

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
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
                <div className={styles.meta}><span>{file.source}</span><i>·</i>{file.external_url ? <span className={styles.url}>{file.external_url}</span> : <span>{formatSize(file.byte_size)}</span>}<i>·</i><time dateTime={file.created_at}>{formatDate(file.created_at)}</time></div>
                {file.pic || file.objective || file.cycle_label || file.notes ? (
                  <dl className={styles.documentMetadata}>
                    <div><dt>PIC</dt><dd>{file.pic || "—"}</dd></div>
                    <div><dt>Objective</dt><dd>{file.objective || "—"}</dd></div>
                    <div><dt>Cycle</dt><dd>{file.cycle_label || "—"}</dd></div>
                    {file.notes ? <div className={styles.notes}><dt>Notes</dt><dd>{file.notes}</dd></div> : null}
                  </dl>
                ) : null}
              </div>
              <button className={styles.openButton} type="button" onClick={() => void openFile(file)} disabled={busyId === file.id || uploading}>
                {busyId === file.id ? "Menyiapkan…" : file.external_url ? "Buka dokumen ↗" : "Buka file ↗"}
              </button>
            </article>
          ))}
        </div>
      ) : null}
      {!loading && projectId && visibleFiles.length === 0 ? (
        <div className={styles.emptyState}><span>▤</span><h3>{search ? "Dokumen tidak ditemukan" : "Library masih kosong"}</h3><p>{search ? "Coba kata kunci atau filter lain." : "Upload file atau tambahkan link dokumen. Materi yang dibagikan anggota project akan muncul di sini."}</p></div>
      ) : null}
    </section>
  );
}

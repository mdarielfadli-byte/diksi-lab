"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./client-meeting-notes.module.css";

type Meeting = {
  id: string;
  title: string;
  meeting_at: string;
  agenda: string;
  discussion_points: string;
  minutes_of_meeting: string;
  status: "planned" | "completed" | "cancelled";
};
type MeetingAction = {
  id: string;
  meeting_id: string;
  title: string;
  owner_label: string | null;
  due_on: string | null;
  is_done: boolean;
};
type MeetingFile = {
  id: string;
  meeting_id: string;
  name: string;
  storage_path: string;
};

const formatMeetingTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const formatDue = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(new Date(value + "T00:00:00"))
    : "Tanpa tenggat";

export function ClientMeetingNotes({
  projectId,
}: {
  projectId: string | null;
}) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<MeetingAction[]>([]);
  const [files, setFiles] = useState<MeetingFile[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) return;
    const supabase = getSupabaseBrowserClient();
    const { data: meetingData, error: meetingError } = await supabase
      .from("project_meetings")
      .select(
        "id,title,meeting_at,agenda,discussion_points,minutes_of_meeting,status",
      )
      .eq("project_id", projectId)
      .order("meeting_at", { ascending: false });
    if (meetingError) throw meetingError;
    const nextMeetings = (meetingData ?? []) as Meeting[];
    setMeetings(nextMeetings);
    const meetingIds = nextMeetings.map((meeting) => meeting.id);
    if (!meetingIds.length) {
      setActions([]);
      setFiles([]);
      return;
    }
    if (!nextMeetings.some((meeting) => meeting.id === selectedMeetingId))
      setSelectedMeetingId(nextMeetings[0].id);
    const [actionResponse, fileResponse] = await Promise.all([
      supabase
        .from("meeting_action_items")
        .select("id,meeting_id,title,owner_label,due_on,is_done")
        .in("meeting_id", meetingIds)
        .order("is_done", { ascending: true })
        .order("due_on", { ascending: true }),
      supabase
        .from("meeting_files")
        .select("id,meeting_id,name,storage_path")
        .in("meeting_id", meetingIds)
        .order("created_at", { ascending: false }),
    ]);
    if (actionResponse.error) throw actionResponse.error;
    if (fileResponse.error) throw fileResponse.error;
    setActions((actionResponse.data ?? []) as MeetingAction[]);
    setFiles((fileResponse.data ?? []) as MeetingFile[]);
  }, [projectId, selectedMeetingId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load().catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "Catatan meeting belum dapat dimuat.",
        ),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selected = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null,
    [meetings, selectedMeetingId],
  );

  async function download(file: MeetingFile) {
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

  if (!projectId || !meetings.length) return null;
  const selectedActions = actions.filter(
    (action) => action.meeting_id === selectedMeetingId,
  );
  const selectedFiles = files.filter(
    (file) => file.meeting_id === selectedMeetingId,
  );
  return (
    <section id="meetings" className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p>CATATAN MEETING</p>
          <h2>Agenda, MoM, dan tindak lanjut</h2>
        </div>
        <span>{meetings.length} MEETING</span>
      </div>
      <div className={styles.grid}>
        <div className={styles.list}>
          {meetings.map((meeting) => (
            <button
              type="button"
              key={meeting.id}
              className={
                meeting.id === selectedMeetingId ? styles.selected : ""
              }
              onClick={() => setSelectedMeetingId(meeting.id)}
            >
              <b>{meeting.title}</b>
              <small>
                {formatMeetingTime(meeting.meeting_at)} · {meeting.status}
              </small>
            </button>
          ))}
        </div>
        {selected ? (
          <article className={styles.detail}>
            <div>
              <small>AGENDA</small>
              <p>{selected.agenda || "Agenda akan dilengkapi oleh tim."}</p>
            </div>
            <div>
              <small>POIN DISKUSI</small>
              <p>
                {selected.discussion_points ||
                  "Poin diskusi akan muncul setelah meeting."}
              </p>
            </div>
            <div>
              <small>MINUTES OF MEETING</small>
              <p>
                {selected.minutes_of_meeting ||
                  "MoM akan dibagikan setelah dirapikan tim."}
              </p>
            </div>
            <div className={styles.actions}>
              <small>TO-DO / TINDAK LANJUT</small>
              {selectedActions.map((action) => (
                <p key={action.id}>
                  {action.is_done ? "✓" : "○"} {action.title}
                  <span>
                    {action.owner_label || "Diksilab"} ·{" "}
                    {formatDue(action.due_on)}
                  </span>
                </p>
              ))}
              {!selectedActions.length ? (
                <p>Belum ada tindak lanjut yang dibagikan.</p>
              ) : null}
            </div>
            <div className={styles.files}>
              <small>MATERI MEETING</small>
              {selectedFiles.map((file) => (
                <button
                  type="button"
                  key={file.id}
                  onClick={() => void download(file)}
                >
                  ▤ {file.name} · Unduh ↓
                </button>
              ))}
              {!selectedFiles.length ? (
                <p>Belum ada materi dibagikan.</p>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
      {message ? <p className={styles.notice}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}

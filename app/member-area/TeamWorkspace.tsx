"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import { CalendarEntry, TeamProjectCalendar } from "./TeamProjectCalendar";
import styles from "./team-workspace.module.css";

type Company = { id: string; name: string; slug: string };
type Project = { id: string; name: string; progress: number; status: string };
type Task = {
  id: string;
  title: string;
  description: string | null;
  owner_label: string | null;
  blocked_reason: string | null;
  workstream: string;
  status: string;
  priority: string;
  progress: number;
  due_on: string | null;
  client_visible: boolean;
  created_at: string;
};
type Comment = {
  id: string;
  body: string;
  visibility: string;
  created_at: string;
};
type Approval = {
  id: string;
  status: string;
  request_note: string | null;
  created_at: string;
};
type Notification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};
type Audit = {
  id: string;
  action: string;
  detail: { title?: string; status?: string };
  created_at: string;
};
type Cycle = { id: string; name: string };
type ChecklistItem = {
  id: string;
  task_id: string;
  label: string;
  is_done: boolean;
  position: number;
};
type CycleReport = {
  id: string;
  summary: string;
  completed_summary: string;
  blockers: string;
  next_focus: string;
};
type Meeting = {
  id: string;
  title: string;
  meeting_at: string;
  agenda: string;
  discussion_points: string;
  minutes_of_meeting: string;
  status: "planned" | "completed" | "cancelled";
  client_visible: boolean;
};
type MeetingActionItem = {
  id: string;
  meeting_id: string;
  title: string;
  owner_label: string | null;
  due_on: string | null;
  is_done: boolean;
  client_visible: boolean;
};
type MeetingFile = {
  id: string;
  meeting_id: string;
  name: string;
  storage_path: string;
  client_visible: boolean;
};

const workstreams = [
  "website",
  "landing_page",
  "seo",
  "crm",
  "email_marketing",
  "ads",
  "content",
  "general",
];
const statuses = [
  "planned",
  "in_progress",
  "needs_review",
  "blocked",
  "approved",
  "completed",
];
const label = (value: string) => value.replaceAll("_", " ");
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(new Date(value + "T00:00:00"))
    : "Tanpa tenggat";
const timestamp = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const dateTimeInput = (value: string) => {
  const local = new Date(value);
  const offset = local.getTimezoneOffset() * 60_000;
  return new Date(local.getTime() - offset).toISOString().slice(0, 16);
};

export function TeamWorkspace({
  userEmail,
  initialCompanyId,
  isSuperAdmin,
  onSignOut,
  onViewDashboard,
}: {
  userEmail: string;
  initialCompanyId: string;
  isSuperAdmin: boolean;
  onSignOut: () => Promise<void>;
  onViewDashboard: (company: Company, projectId: string | null) => void;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleReport, setCycleReport] = useState<CycleReport | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [meetingActions, setMeetingActions] = useState<MeetingActionItem[]>([]);
  const [meetingFiles, setMeetingFiles] = useState<MeetingFile[]>([]);
  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const updateFileInput = useRef<HTMLInputElement>(null);
  const meetingFileInput = useRef<HTMLInputElement>(null);

  const loadWorkspace = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: userResult, error: userError } =
      await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult.user) return;
    const memberships = isSuperAdmin
      ? null
      : await supabase
          .from("company_memberships")
          .select("company_id")
          .eq("user_id", userResult.user.id);
    if (memberships?.error) throw memberships.error;
    const ids =
      memberships?.data?.map(
        (membership: { company_id: string }) => membership.company_id,
      ) ?? [];
    const companyResponse = isSuperAdmin
      ? await supabase.from("companies").select("id, name, slug").order("name")
      : ids.length
        ? await supabase
            .from("companies")
            .select("id, name, slug")
            .in("id", ids)
            .order("name")
        : { data: [], error: null };
    if (companyResponse.error) throw companyResponse.error;
    const nextCompanies = (companyResponse.data ?? []) as Company[];
    setCompanies(nextCompanies);
    const nextCompanyId = nextCompanies.some(
      (company) => company.id === companyId,
    )
      ? companyId
      : (nextCompanies.find((company) => /santi/i.test(company.name))?.id ??
        nextCompanies[0]?.id ??
        "");
    setCompanyId(nextCompanyId);
    if (!nextCompanyId) {
      setProjects([]);
      setTasks([]);
      setMeetings([]);
      return;
    }
    const projectResponse = await supabase
      .from("projects")
      .select("id, name, progress, status")
      .eq("company_id", nextCompanyId)
      .order("created_at", { ascending: false });
    if (projectResponse.error) throw projectResponse.error;
    const nextProjects = (projectResponse.data ?? []) as Project[];
    setProjects(nextProjects);
    const nextProjectId = nextProjects.some(
      (project) => project.id === projectId,
    )
      ? projectId
      : (nextProjects[0]?.id ?? "");
    setProjectId(nextProjectId);
    if (!nextProjectId) {
      setTasks([]);
      setCycles([]);
      setMeetings([]);
      return;
    }
    const [
      taskResponse,
      cycleResponse,
      meetingResponse,
      auditResponse,
      notificationResponse,
    ] = await Promise.all([
      supabase
        .from("project_tasks")
        .select(
          "id, title, description, owner_label, blocked_reason, workstream, status, priority, progress, due_on, client_visible, created_at",
        )
        .eq("project_id", nextProjectId)
        .order("due_on", { ascending: true }),
      supabase
        .from("cycles")
        .select("id, name")
        .eq("project_id", nextProjectId)
        .order("starts_on", { ascending: false })
        .limit(1),
      supabase
        .from("project_meetings")
        .select(
          "id,title,meeting_at,agenda,discussion_points,minutes_of_meeting,status,client_visible",
        )
        .eq("project_id", nextProjectId)
        .order("meeting_at", { ascending: false }),
      supabase
        .from("audit_logs")
        .select("id, action, detail, created_at")
        .eq("project_id", nextProjectId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("notifications")
        .select("id, title, body, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);
    for (const response of [
      taskResponse,
      cycleResponse,
      meetingResponse,
      auditResponse,
      notificationResponse,
    ])
      if (response.error) throw response.error;
    const nextTasks = (taskResponse.data ?? []) as Task[];
    const nextCycles = (cycleResponse.data ?? []) as Cycle[];
    const nextMeetings = (meetingResponse.data ?? []) as Meeting[];
    setTasks(nextTasks);
    setCycles(nextCycles);
    setMeetings(nextMeetings);
    setAudit((auditResponse.data ?? []) as Audit[]);
    setNotifications((notificationResponse.data ?? []) as Notification[]);
    if (nextCycles[0]) {
      const reportResponse = await supabase
        .from("cycle_reports")
        .select("id,summary,completed_summary,blockers,next_focus")
        .eq("cycle_id", nextCycles[0].id)
        .maybeSingle();
      if (reportResponse.error) throw reportResponse.error;
      setCycleReport(reportResponse.data as CycleReport | null);
    } else setCycleReport(null);
    const nextTaskId = nextTasks.some((task) => task.id === selectedTaskId)
      ? selectedTaskId
      : (nextTasks[0]?.id ?? "");
    setSelectedTaskId(nextTaskId);
    const nextMeetingId = nextMeetings.some(
      (meeting) => meeting.id === selectedMeetingId,
    )
      ? selectedMeetingId
      : (nextMeetings[0]?.id ?? "");
    setSelectedMeetingId(nextMeetingId);
    if (nextMeetingId) {
      const [meetingActionResponse, meetingFileResponse] = await Promise.all([
        supabase
          .from("meeting_action_items")
          .select(
            "id,meeting_id,title,owner_label,due_on,is_done,client_visible",
          )
          .eq("meeting_id", nextMeetingId)
          .order("is_done", { ascending: true })
          .order("due_on", { ascending: true }),
        supabase
          .from("meeting_files")
          .select("id,meeting_id,name,storage_path,client_visible")
          .eq("meeting_id", nextMeetingId)
          .order("created_at", { ascending: false }),
      ]);
      if (meetingActionResponse.error) throw meetingActionResponse.error;
      if (meetingFileResponse.error) throw meetingFileResponse.error;
      setMeetingActions(
        (meetingActionResponse.data ?? []) as MeetingActionItem[],
      );
      setMeetingFiles((meetingFileResponse.data ?? []) as MeetingFile[]);
    } else {
      setMeetingActions([]);
      setMeetingFiles([]);
    }
    if (!nextTaskId) {
      setComments([]);
      setApprovals([]);
      setChecklist([]);
    } else {
      const [commentResponse, approvalResponse, checklistResponse] =
        await Promise.all([
          supabase
            .from("task_comments")
            .select("id, body, visibility, created_at")
            .eq("task_id", nextTaskId)
            .order("created_at", { ascending: false }),
          supabase
            .from("task_approvals")
            .select("id, status, request_note, created_at")
            .eq("task_id", nextTaskId)
            .order("created_at", { ascending: false }),
          supabase
            .from("task_checklist_items")
            .select("id,task_id,label,is_done,position")
            .eq("task_id", nextTaskId)
            .order("position", { ascending: true }),
        ]);
      if (commentResponse.error) throw commentResponse.error;
      if (approvalResponse.error) throw approvalResponse.error;
      if (checklistResponse.error) throw checklistResponse.error;
      setComments((commentResponse.data ?? []) as Comment[]);
      setApprovals((approvalResponse.data ?? []) as Approval[]);
      setChecklist((checklistResponse.data ?? []) as ChecklistItem[]);
    }
  }, [companyId, isSuperAdmin, projectId, selectedMeetingId, selectedTaskId]);

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        void loadWorkspace().catch((caught) =>
          setError(
            caught instanceof Error
              ? caught.message
              : "Ruang kerja belum dapat dimuat.",
          ),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );
  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null,
    [meetings, selectedMeetingId],
  );
  const calendarEntries = useMemo<CalendarEntry[]>(
    () => [
      ...tasks
        .filter((task) => task.due_on)
        .map((task) => ({
          id: task.id,
          title: task.title,
          date: task.due_on as string,
          kind: "task" as const,
          status: task.status,
        })),
      ...meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        date: meeting.meeting_at.slice(0, 10),
        kind: "meeting" as const,
        status: meeting.status,
      })),
    ],
    [meetings, tasks],
  );
  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyId) ?? null,
    [companies, companyId],
  );
  const kpi = useMemo(
    () => ({
      active: tasks.filter(
        (task) => !["approved", "completed"].includes(task.status),
      ).length,
      review: tasks.filter((task) => task.status === "needs_review").length,
      complete: tasks.filter((task) =>
        ["approved", "completed"].includes(task.status),
      ).length,
    }),
    [tasks],
  );
  async function withAction(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      await loadWorkspace();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Perubahan belum dapat disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!projectId || !companyId) return;
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: insertError } = await supabase
        .from("project_tasks")
        .insert({
          company_id: companyId,
          project_id: projectId,
          title: String(form.get("title") ?? "").trim(),
          description: String(form.get("description") ?? "").trim() || null,
          owner_label: String(form.get("owner_label") ?? "").trim() || null,
          workstream: String(form.get("workstream")),
          status: String(form.get("status")),
          priority: String(form.get("priority")),
          due_on: String(form.get("due_on") || "") || null,
          client_visible: form.get("client_visible") === "on",
          created_by: auth.user.id,
        });
      if (insertError) throw insertError;
      event.currentTarget.reset();
      setMessage("Task disimpan; progres dan audit log diperbarui otomatis.");
    });
  }
  async function updateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const status = String(form.get("status"));
      const { error: updateError } = await supabase
        .from("project_tasks")
        .update({
          status,
          progress: Number(form.get("progress")),
          description: String(form.get("description") ?? "").trim() || null,
          owner_label: String(form.get("owner_label") ?? "").trim() || null,
          blocked_reason:
            status === "blocked"
              ? String(form.get("blocked_reason") ?? "").trim() ||
                "Menunggu tindak lanjut"
              : null,
          due_on: String(form.get("due_on") || "") || null,
          client_visible: form.get("client_visible") === "on",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTask.id);
      if (updateError) throw updateError;
      const file = form.get("attachment");
      if (file instanceof File && file.size > 0) {
        if (file.size > 25 * 1024 * 1024)
          throw new Error("Ukuran file maksimal 25 MB.");
        const extension = file.name.includes(".")
          ? file.name.split(".").pop()
          : "file";
        const storagePath = `${companyId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("client-documents")
          .upload(storagePath, file, {
            contentType: file.type || undefined,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const { error: fileError } = await supabase.from("task_files").insert({
          task_id: selectedTask.id,
          company_id: companyId,
          project_id: projectId,
          uploaded_by: auth.user.id,
          name: file.name,
          storage_path: storagePath,
          content_type: file.type || null,
          byte_size: file.size,
          review_status: status === "needs_review" ? "needs_review" : "draft",
          client_visible: form.get("file_client_visible") === "on",
        });
        if (fileError) throw fileError;
      }
      if (updateFileInput.current) updateFileInput.current.value = "";
      setMessage(
        file instanceof File && file.size > 0
          ? "Task dan file output diperbarui. Progress proyek mengikuti status task."
          : "Status task diperbarui.",
      );
    });
  }
  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask || !companyId) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: insertError } = await supabase
        .from("task_comments")
        .insert({
          task_id: selectedTask.id,
          company_id: companyId,
          author_id: auth.user.id,
          body: String(form.get("body") ?? "").trim(),
          visibility: String(form.get("visibility")),
        });
      if (insertError) throw insertError;
      event.currentTarget.reset();
      setMessage("Komentar tersimpan.");
    });
  }
  async function requestApproval() {
    if (!selectedTask || !companyId) return;
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: approvalError } = await supabase
        .from("task_approvals")
        .insert({
          task_id: selectedTask.id,
          company_id: companyId,
          requested_by: auth.user.id,
          request_note: "Mohon review: " + selectedTask.title,
        });
      if (approvalError) throw approvalError;
      const { error: taskError } = await supabase
        .from("project_tasks")
        .update({ status: "needs_review" })
        .eq("id", selectedTask.id);
      if (taskError) throw taskError;
      setMessage("Permintaan approval dikirim.");
    });
  }
  async function markRead(id: string) {
    await withAction(async () => {
      const { error: updateError } = await getSupabaseBrowserClient()
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (updateError) throw updateError;
    });
  }
  async function addChecklist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const { error: insertError } = await getSupabaseBrowserClient()
        .from("task_checklist_items")
        .insert({
          task_id: selectedTask.id,
          company_id: companyId,
          label: String(form.get("label") ?? "").trim(),
          position: checklist.length,
        });
      if (insertError) throw insertError;
      event.currentTarget.reset();
      setMessage("Checklist ditambahkan.");
    });
  }
  async function toggleChecklist(item: ChecklistItem) {
    await withAction(async () => {
      const { error: updateError } = await getSupabaseBrowserClient()
        .from("task_checklist_items")
        .update({
          is_done: !item.is_done,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      if (updateError) throw updateError;
    });
  }
  async function saveCycleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cycle = cycles[0];
    if (!cycle) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const { data: auth } = await getSupabaseBrowserClient().auth.getUser();
      const { error: reportError } = await getSupabaseBrowserClient()
        .from("cycle_reports")
        .upsert(
          {
            id: cycleReport?.id,
            company_id: companyId,
            project_id: projectId,
            cycle_id: cycle.id,
            summary: String(form.get("summary") ?? ""),
            completed_summary: String(form.get("completed_summary") ?? ""),
            blockers: String(form.get("blockers") ?? ""),
            next_focus: String(form.get("next_focus") ?? ""),
            updated_by: auth.user?.id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "cycle_id" },
        );
      if (reportError) throw reportError;
      setMessage("Ringkasan cycle diperbarui.");
    });
  }
  async function addMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId || !projectId) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const meetingAt = String(form.get("meeting_at") ?? "");
      const { data: meeting, error: meetingError } = await supabase
        .from("project_meetings")
        .insert({
          company_id: companyId,
          project_id: projectId,
          cycle_id: cycles[0]?.id ?? null,
          title: String(form.get("title") ?? "").trim(),
          meeting_at: new Date(meetingAt).toISOString(),
          agenda: String(form.get("agenda") ?? "").trim(),
          client_visible: form.get("client_visible") === "on",
          created_by: auth.user.id,
          updated_by: auth.user.id,
        })
        .select("id")
        .single();
      if (meetingError) throw meetingError;
      event.currentTarget.reset();
      setSelectedMeetingId(meeting.id);
      setMessage(
        "Agenda meeting tersimpan. Tambahkan MoM dan tindak lanjut setelah diskusi.",
      );
    });
  }
  async function updateMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMeeting || !companyId || !projectId) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const meetingAt = String(form.get("meeting_at") ?? "");
      const { error: meetingError } = await supabase
        .from("project_meetings")
        .update({
          title: String(form.get("title") ?? "").trim(),
          meeting_at: new Date(meetingAt).toISOString(),
          agenda: String(form.get("agenda") ?? "").trim(),
          discussion_points: String(form.get("discussion_points") ?? "").trim(),
          minutes_of_meeting: String(
            form.get("minutes_of_meeting") ?? "",
          ).trim(),
          status: String(form.get("status")),
          client_visible: form.get("client_visible") === "on",
          updated_by: auth.user.id,
        })
        .eq("id", selectedMeeting.id);
      if (meetingError) throw meetingError;
      const file = form.get("attachment");
      if (file instanceof File && file.size > 0) {
        if (file.size > 25 * 1024 * 1024)
          throw new Error("Ukuran file maksimal 25 MB.");
        const extension = file.name.includes(".")
          ? file.name.split(".").pop()
          : "file";
        const storagePath =
          companyId +
          "/meetings/" +
          selectedMeeting.id +
          "/" +
          crypto.randomUUID() +
          "." +
          extension;
        const { error: uploadError } = await supabase.storage
          .from("client-documents")
          .upload(storagePath, file, {
            contentType: file.type || undefined,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const { error: fileError } = await supabase
          .from("meeting_files")
          .insert({
            meeting_id: selectedMeeting.id,
            company_id: companyId,
            project_id: projectId,
            uploaded_by: auth.user.id,
            name: file.name,
            storage_path: storagePath,
            content_type: file.type || null,
            byte_size: file.size,
            client_visible: form.get("file_client_visible") === "on",
          });
        if (fileError) throw fileError;
      }
      if (meetingFileInput.current) meetingFileInput.current.value = "";
      setMessage("Detail meeting, MoM, dan file telah diperbarui.");
    });
  }
  async function addMeetingAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMeeting || !companyId || !projectId) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const { data: auth } = await getSupabaseBrowserClient().auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const { error: itemError } = await getSupabaseBrowserClient()
        .from("meeting_action_items")
        .insert({
          meeting_id: selectedMeeting.id,
          company_id: companyId,
          project_id: projectId,
          title: String(form.get("title") ?? "").trim(),
          owner_label: String(form.get("owner_label") ?? "").trim() || null,
          due_on: String(form.get("due_on") ?? "") || null,
          client_visible: form.get("client_visible") === "on",
          created_by: auth.user.id,
        });
      if (itemError) throw itemError;
      event.currentTarget.reset();
      setMessage("Tindak lanjut meeting ditambahkan.");
    });
  }
  async function toggleMeetingAction(item: MeetingActionItem) {
    await withAction(async () => {
      const { error: itemError } = await getSupabaseBrowserClient()
        .from("meeting_action_items")
        .update({
          is_done: !item.is_done,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      if (itemError) throw itemError;
    });
  }
  async function addCalendarEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!calendarDate || !companyId || !projectId) return;
    const form = new FormData(event.currentTarget);
    await withAction(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesi masuk berakhir.");
      const kind = String(form.get("kind"));
      const title = String(form.get("title") ?? "").trim();
      const clientVisible = form.get("client_visible") === "on";
      if (kind === "meeting") {
        const meetingTime = String(form.get("meeting_time") || "09:00");
        const { error: meetingError } = await supabase
          .from("project_meetings")
          .insert({
            company_id: companyId,
            project_id: projectId,
            cycle_id: cycles[0]?.id ?? null,
            title,
            meeting_at: new Date(
              calendarDate + "T" + meetingTime,
            ).toISOString(),
            agenda: String(form.get("agenda") ?? "").trim(),
            client_visible: clientVisible,
            created_by: auth.user.id,
            updated_by: auth.user.id,
          });
        if (meetingError) throw meetingError;
        setMessage("Meeting ditambahkan ke kalender proyek.");
      } else {
        const { error: taskError } = await supabase
          .from("project_tasks")
          .insert({
            company_id: companyId,
            project_id: projectId,
            title,
            description:
              String(form.get("agenda") ?? "").trim() || "Agenda proyek",
            owner_label: String(form.get("owner_label") ?? "").trim() || null,
            workstream: "general",
            status: "planned",
            priority: "normal",
            due_on: calendarDate,
            client_visible: clientVisible,
            created_by: auth.user.id,
          });
        if (taskError) throw taskError;
        setMessage("Action ditambahkan ke kalender dan board task.");
      }
      event.currentTarget.reset();
      setCalendarDate(null);
    });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          DIKSI<span>LAB</span>
        </Link>
        <button
          type="button"
          onClick={() =>
            selectedCompany &&
            onViewDashboard(selectedCompany, projectId || null)
          }
          disabled={!selectedCompany || !projectId}
        >
          View dashboard
        </button>
        <div>
          <b>{isSuperAdmin ? "Super admin" : "Tim Diksilab"}</b>
          <small>{userEmail}</small>
        </div>
        <button onClick={() => void onSignOut()}>Keluar</button>
      </header>
      <section className={styles.hero}>
        <p>RUANG KERJA INTERNAL</p>
        <h1>
          Kelola progress yang
          <br />
          <em>dipantau klien.</em>
        </h1>
        <span>
          Task, approval, komentar, notifikasi, dan audit log tersimpan pada
          proyek. Hanya task yang Anda tandai terlihat yang muncul untuk klien.
        </span>
      </section>
      <section className={styles.controls}>
        <label>
          Perusahaan
          <select
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
              setProjectId("");
            }}
          >
            <option value="">Pilih perusahaan</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Proyek
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">Pilih proyek</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </section>
      {projectId ? (
        <>
          <section className={styles.kpi}>
            <article>
              <small>PROGRES OTOMATIS</small>
              <b>
                {projects.find((project) => project.id === projectId)
                  ?.progress ?? 0}
                %
              </b>
              <span>Dihitung dari task selesai</span>
            </article>
            <article>
              <small>TASK AKTIF</small>
              <b>{kpi.active}</b>
              <span>Termasuk yang diblokir</span>
            </article>
            <article>
              <small>MENUNGGU REVIEW</small>
              <b>{kpi.review}</b>
              <span>Siap diperiksa klien</span>
            </article>
            <article>
              <small>SELESAI</small>
              <b>{kpi.complete}</b>
              <span>Approved / completed</span>
            </article>
          </section>
          <TeamProjectCalendar
            entries={calendarEntries}
            onSelectDate={(date) => setCalendarDate(date)}
          />
          {calendarDate ? (
            <div
              className={styles.calendarModalBackdrop}
              role="presentation"
              onMouseDown={() => setCalendarDate(null)}
            >
              <form
                className={styles.calendarModal}
                onSubmit={addCalendarEntry}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div>
                    <p>TAMBAH KE KALENDER</p>
                    <h2>
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(calendarDate + "T00:00:00"))}
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Tutup pop-up kalender"
                    onClick={() => setCalendarDate(null)}
                  >
                    ×
                  </button>
                </div>
                <label>
                  Jenis agenda
                  <select name="kind" defaultValue="task">
                    <option value="task">Action / task</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </label>
                <label>
                  Judul
                  <input
                    name="title"
                    required
                    placeholder="Contoh: Review wireframe website"
                  />
                </label>
                <label>
                  Jam meeting (bila memilih meeting)
                  <input name="meeting_time" type="time" defaultValue="09:00" />
                </label>
                <label>
                  Agenda / catatan awal
                  <textarea
                    name="agenda"
                    placeholder="Tujuan, konteks, atau bahan diskusi…"
                  />
                </label>
                <label>
                  PIC action (opsional)
                  <input name="owner_label" placeholder="Contoh: Ibel Zamif" />
                </label>
                <label className={styles.check}>
                  <input name="client_visible" type="checkbox" defaultChecked />{" "}
                  Tampilkan kepada klien
                </label>
                <div className={styles.inline}>
                  <button disabled={busy}>Simpan ke kalender</button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setCalendarDate(null)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          ) : null}
          <section className={styles.actionGrid}>
            <form className={styles.card} onSubmit={addTask}>
              <p>TAMBAH TASK</p>
              <h2>Rencana kerja baru</h2>
              <label>
                Judul task
                <input
                  name="title"
                  required
                  placeholder="Contoh: Audit teknis SEO"
                />
              </label>
              <label>
                Brief / output
                <textarea
                  name="description"
                  placeholder="Tujuan, output, atau catatan kerja…"
                />
              </label>
              <label>
                PIC
                <input name="owner_label" placeholder="Contoh: Ibel Zamif" />
              </label>
              <div className={styles.dual}>
                <label>
                  Workstream
                  <select name="workstream">
                    {workstreams.map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select name="status">
                    {statuses.slice(0, 4).map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.dual}>
                <label>
                  Prioritas
                  <select name="priority">
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                    <option value="low">Rendah</option>
                  </select>
                </label>
                <label>
                  Tanggal agenda / tenggat
                  <input name="due_on" type="date" />
                </label>
              </div>
              <label className={styles.check}>
                <input name="client_visible" type="checkbox" defaultChecked />{" "}
                Tampilkan kepada klien
              </label>
              <button disabled={busy}>Simpan task</button>
            </form>
            <form className={styles.card} onSubmit={updateTask}>
              <p>UPDATE TASK &amp; OUTPUT</p>
              <h2>{selectedTask?.title ?? "Pilih task"}</h2>
              {selectedTask ? (
                <>
                  <label>
                    Status
                    <select name="status" defaultValue={selectedTask.status}>
                      {statuses.map((value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Progress task (%)
                    <input
                      name="progress"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={selectedTask.progress}
                    />
                  </label>
                  <label>
                    Brief / output
                    <textarea
                      name="description"
                      defaultValue={selectedTask.description ?? ""}
                    />
                  </label>
                  <label>
                    PIC
                    <input
                      name="owner_label"
                      defaultValue={selectedTask.owner_label ?? ""}
                    />
                  </label>
                  <label>
                    Tanggal agenda / tenggat
                    <input
                      name="due_on"
                      type="date"
                      defaultValue={selectedTask.due_on ?? ""}
                    />
                  </label>
                  {selectedTask.status === "blocked" ? (
                    <label>
                      Hambatan
                      <textarea
                        name="blocked_reason"
                        defaultValue={selectedTask.blocked_reason ?? ""}
                      />
                    </label>
                  ) : (
                    <input name="blocked_reason" type="hidden" />
                  )}
                  <label>
                    File output (opsional)
                    <input
                      ref={updateFileInput}
                      name="attachment"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.jpg,.jpeg,.png,.webp"
                    />
                  </label>
                  <label className={styles.check}>
                    <input
                      name="file_client_visible"
                      type="checkbox"
                      defaultChecked
                    />{" "}
                    Bagikan file kepada klien
                  </label>
                  <label className={styles.check}>
                    <input
                      name="client_visible"
                      type="checkbox"
                      defaultChecked={selectedTask.client_visible}
                    />{" "}
                    Tampilkan kepada klien
                  </label>
                  <div className={styles.inline}>
                    <button disabled={busy}>Simpan update &amp; output</button>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => void requestApproval()}
                      disabled={
                        busy ||
                        approvals.some(
                          (approval) => approval.status === "pending",
                        )
                      }
                    >
                      Minta approval
                    </button>
                  </div>
                </>
              ) : (
                <p className={styles.empty}>Pilih task dari daftar di bawah.</p>
              )}
            </form>
          </section>
          {cycles[0] ? (
            <form className={styles.card} onSubmit={saveCycleReport}>
              <p>RINGKASAN {cycles[0].name.toUpperCase()}</p>
              <h2>Laporan yang dibaca klien</h2>
              <label>
                Fokus cycle
                <textarea
                  name="summary"
                  defaultValue={cycleReport?.summary ?? ""}
                />
              </label>
              <label>
                Yang telah dilakukan
                <textarea
                  name="completed_summary"
                  defaultValue={cycleReport?.completed_summary ?? ""}
                />
              </label>
              <label>
                Hambatan / keputusan yang dibutuhkan
                <textarea
                  name="blockers"
                  defaultValue={cycleReport?.blockers ?? ""}
                />
              </label>
              <label>
                Fokus berikutnya
                <textarea
                  name="next_focus"
                  defaultValue={cycleReport?.next_focus ?? ""}
                />
              </label>
              <button disabled={busy}>Simpan ringkasan cycle</button>
            </form>
          ) : null}
          <section className={styles.actionGrid}>
            <form className={styles.card} onSubmit={addMeeting}>
              <p>AGENDA MEETING</p>
              <h2>Jadwalkan diskusi</h2>
              <label>
                Judul meeting
                <input
                  name="title"
                  required
                  placeholder="Contoh: Weekly progress review"
                />
              </label>
              <label>
                Tanggal dan jam
                <input name="meeting_at" type="datetime-local" required />
              </label>
              <label>
                Agenda / materi yang dibahas
                <textarea
                  name="agenda"
                  placeholder="Tujuan, pertanyaan, dan bahan diskusi…"
                />
              </label>
              <label className={styles.check}>
                <input name="client_visible" type="checkbox" defaultChecked />{" "}
                Tampilkan jadwal kepada klien
              </label>
              <button disabled={busy}>Simpan agenda meeting</button>
            </form>
            <section className={styles.card}>
              <p>DAFTAR MEETING</p>
              <h2>Agenda proyek</h2>
              <div className={styles.meetingList}>
                {meetings.map((meeting) => (
                  <button
                    type="button"
                    key={meeting.id}
                    className={
                      meeting.id === selectedMeetingId
                        ? styles.selectedMeeting
                        : ""
                    }
                    onClick={() => setSelectedMeetingId(meeting.id)}
                  >
                    <b>{meeting.title}</b>
                    <small>
                      {timestamp(meeting.meeting_at)} · {label(meeting.status)}
                    </small>
                  </button>
                ))}
                {!meetings.length ? (
                  <p className={styles.empty}>
                    Belum ada agenda meeting pada proyek ini.
                  </p>
                ) : null}
              </div>
            </section>
          </section>
          {selectedMeeting ? (
            <section className={styles.actionGrid}>
              <form
                key={selectedMeeting.id}
                className={styles.card}
                onSubmit={updateMeeting}
              >
                <p>MOM &amp; MATERI MEETING</p>
                <h2>{selectedMeeting.title}</h2>
                <label>
                  Judul meeting
                  <input
                    name="title"
                    required
                    defaultValue={selectedMeeting.title}
                  />
                </label>
                <label>
                  Tanggal dan jam
                  <input
                    name="meeting_at"
                    type="datetime-local"
                    required
                    defaultValue={dateTimeInput(selectedMeeting.meeting_at)}
                  />
                </label>
                <label>
                  Agenda
                  <textarea
                    name="agenda"
                    defaultValue={selectedMeeting.agenda}
                  />
                </label>
                <label>
                  Poin-poin diskusi
                  <textarea
                    name="discussion_points"
                    defaultValue={selectedMeeting.discussion_points}
                    placeholder="Tuliskan keputusan, insight, dan isu penting…"
                  />
                </label>
                <label>
                  Minutes of Meeting (MoM)
                  <textarea
                    name="minutes_of_meeting"
                    defaultValue={selectedMeeting.minutes_of_meeting}
                    placeholder="Ringkasan diskusi dan keputusan yang disepakati…"
                  />
                </label>
                <label>
                  Status meeting
                  <select name="status" defaultValue={selectedMeeting.status}>
                    <option value="planned">Terjadwal</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </label>
                <label>
                  Upload agenda / materi / MoM (opsional)
                  <input
                    ref={meetingFileInput}
                    name="attachment"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.jpg,.jpeg,.png,.webp"
                  />
                </label>
                <label className={styles.check}>
                  <input
                    name="file_client_visible"
                    type="checkbox"
                    defaultChecked
                  />{" "}
                  Bagikan file kepada klien
                </label>
                <label className={styles.check}>
                  <input
                    name="client_visible"
                    type="checkbox"
                    defaultChecked={selectedMeeting.client_visible}
                  />{" "}
                  Tampilkan MoM kepada klien
                </label>
                <button disabled={busy}>Simpan MoM &amp; materi</button>
              </form>
              <section className={styles.card}>
                <p>TO-DO MEETING</p>
                <h2>Tindak lanjut yang disepakati</h2>
                <form onSubmit={addMeetingAction}>
                  <label>
                    Tindak lanjut
                    <input
                      name="title"
                      required
                      placeholder="Contoh: Kirim akses Meta Ads"
                    />
                  </label>
                  <label>
                    PIC
                    <input name="owner_label" placeholder="Nama PIC" />
                  </label>
                  <label>
                    Tanggal agenda / tenggat
                    <input name="due_on" type="date" />
                  </label>
                  <label className={styles.check}>
                    <input
                      name="client_visible"
                      type="checkbox"
                      defaultChecked
                    />{" "}
                    Tampilkan kepada klien
                  </label>
                  <button disabled={busy}>Tambah tindak lanjut</button>
                </form>
                <div className={styles.meetingList}>
                  {meetingActions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => void toggleMeetingAction(item)}
                    >
                      <b>
                        {item.is_done ? "✓" : "○"} {item.title}
                      </b>
                      <small>
                        {item.owner_label || "Diksilab"} · {date(item.due_on)}
                      </small>
                    </button>
                  ))}
                  {!meetingActions.length ? (
                    <p className={styles.empty}>
                      Belum ada tindak lanjut dari meeting ini.
                    </p>
                  ) : null}
                </div>
                <div className={styles.meetingFiles}>
                  <b>Materi tersimpan</b>
                  {meetingFiles.map((file) => (
                    <span key={file.id}>
                      ▤ {file.name}{" "}
                      {file.client_visible ? "· terlihat klien" : "· internal"}
                    </span>
                  ))}
                  {!meetingFiles.length ? (
                    <span>Belum ada file yang dilampirkan.</span>
                  ) : null}
                </div>
              </section>
            </section>
          ) : null}
          <section className={styles.workspaceGrid}>
            <section className={styles.list}>
              <div>
                <p>TASK PROYEK</p>
                <h2>Board kerja</h2>
              </div>
              {tasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  className={
                    task.id === selectedTaskId ? styles.selectedTask : ""
                  }
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <span>{label(task.status)}</span>
                  <b>{task.title}</b>
                  <small>
                    {label(task.workstream)} · {date(task.due_on)} ·{" "}
                    {task.client_visible ? "terlihat klien" : "internal"}
                  </small>
                </button>
              ))}
              {tasks.length === 0 ? (
                <p className={styles.empty}>Belum ada task pada proyek ini.</p>
              ) : null}
            </section>
            <section className={styles.context}>
              <p>DISKUSI & APPROVAL</p>
              <h2>{selectedTask?.title ?? "Pilih task"}</h2>
              {selectedTask ? (
                <>
                  <div className={styles.feed}>
                    <b>CHECKLIST TASK</b>
                    {checklist.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => void toggleChecklist(item)}
                      >
                        <b>
                          {item.is_done ? "✓" : "○"} {item.label}
                        </b>
                      </button>
                    ))}
                    <form onSubmit={addChecklist}>
                      <div className={styles.inline}>
                        <input
                          name="label"
                          required
                          placeholder="Tambahkan checklist…"
                        />
                        <button disabled={busy}>Tambah</button>
                      </div>
                    </form>
                  </div>
                  <form onSubmit={addComment}>
                    <textarea
                      name="body"
                      required
                      placeholder="Catatan progress atau pertanyaan…"
                    />
                    <div className={styles.inline}>
                      <select name="visibility">
                        <option value="team">Internal team</option>
                        <option value="client">Terlihat klien</option>
                      </select>
                      <button disabled={busy}>Kirim komentar</button>
                    </div>
                  </form>
                  <div className={styles.feed}>
                    {approvals.map((approval) => (
                      <article key={approval.id}>
                        <b>Approval {label(approval.status)}</b>
                        <small>
                          {approval.request_note ?? "Tanpa catatan"} ·{" "}
                          {timestamp(approval.created_at)}
                        </small>
                      </article>
                    ))}
                    {comments.map((comment) => (
                      <article key={comment.id}>
                        <b>
                          {comment.visibility === "client"
                            ? "Untuk klien"
                            : "Internal"}
                        </b>
                        <small>
                          {comment.body} · {timestamp(comment.created_at)}
                        </small>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          </section>
          <section className={styles.workspaceGrid}>
            <section className={styles.context}>
              <p>NOTIFIKASI SAYA</p>
              <h2>Yang perlu diperhatikan</h2>
              <div className={styles.feed}>
                {notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => void markRead(notification.id)}
                  >
                    <b>
                      {notification.read_at ? "Dibaca" : "Baru"} ·{" "}
                      {notification.title}
                    </b>
                    <small>
                      {notification.body ?? ""} ·{" "}
                      {timestamp(notification.created_at)}
                    </small>
                  </button>
                ))}
                {notifications.length === 0 ? (
                  <p className={styles.empty}>
                    Belum ada notifikasi untuk akun ini.
                  </p>
                ) : null}
              </div>
            </section>
            <section className={styles.context}>
              <p>AUDIT LOG</p>
              <h2>Jejak perubahan</h2>
              <div className={styles.feed}>
                {audit.map((entry) => (
                  <article key={entry.id}>
                    <b>{label(entry.action)}</b>
                    <small>
                      {entry.detail.title ?? "Task"} ·{" "}
                      {entry.detail.status ? label(entry.detail.status) : ""} ·{" "}
                      {timestamp(entry.created_at)}
                    </small>
                  </article>
                ))}
                {audit.length === 0 ? (
                  <p className={styles.empty}>
                    Perubahan pada task akan tercatat otomatis di sini.
                  </p>
                ) : null}
              </div>
            </section>
          </section>
        </>
      ) : (
        <p className={styles.empty}>Pilih proyek untuk membuka workspace.</p>
      )}
      {message ? <p className={styles.notice}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </main>
  );
}

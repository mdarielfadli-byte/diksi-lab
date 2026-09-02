"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import { ClientProjectActions } from "./ClientProjectActions";
import { ClientMeetingNotes } from "./ClientMeetingNotes";
import { KickoffLaunchpad } from "./KickoffLaunchpad";
import styles from "./public-member.module.css";
import brand from "./brand-guideline.module.css";

type WorkItem = {
  date: string;
  scheduled_for: string;
  activity: string;
  area: string;
  status: string;
  owner: string;
};
type Update = {
  title: string;
  detail: string;
  status: "needs_approval" | "approved" | "info";
  owner: string;
  due: string;
};
type Metric = {
  name: string;
  group: string;
  value: number | null;
  unit: string;
  status: string;
};
type DocumentItem = {
  title: string;
  type: string;
  version: string;
  status: string;
  updated: string;
};
type RoadmapItem = {
  phase: string;
  period: string;
  title: string;
  focus: string;
  status: "active" | "next" | "future";
};
type BrandColor = { name: string; hex: string; role: string };
type BrandGuideline = {
  positioning: string;
  personality: string[];
  colors: BrandColor[];
  typography: string;
  imagery: string;
  tone: string;
  cta: string;
};
type DeliveryWorkstream = {
  name: string;
  status: "ready" | "planned";
  owner: string;
  due: string;
  outputs: string[];
  kpi: string;
};
type ClientAction = {
  title: string;
  detail: string;
  status: "needs_approval" | "needs_input";
  due: string;
};
type ProjectTaskRow = {
  id: string;
  title: string;
  workstream: string;
  status: string;
  progress: number;
  due_on: string | null;
  owner_label: string | null;
  description: string | null;
  updated_at: string;
};
type ApprovalRow = {
  id: string;
  task_id: string;
  status: string;
  request_note: string | null;
  created_at: string;
};
type SpendRow = { amount_spent: number | string };
type ProjectMeetingRow = {
  id: string;
  title: string;
  meeting_at: string;
  agenda: string;
  status: "planned" | "completed" | "cancelled";
};
type DashboardData = {
  client_name: string;
  project_name: string;
  cycle_name: string;
  cycle_start: string;
  cycle_end: string;
  project_status: string;
  progress: number;
  ads_spend: number;
  tracker_count: number;
  calendar_work: WorkItem[];
  planned_work: WorkItem[];
  completed_work: WorkItem[];
  updates: Update[];
  metrics: Metric[];
  documents: DocumentItem[];
  roadmap: RoadmapItem[];
  brand_guideline: BrandGuideline;
  delivery_workstreams: DeliveryWorkstream[];
  client_actions: ClientAction[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
function formatSync(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Menyinkronkan";
}
function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ActivityTable({
  items,
  completed = false,
}: {
  items: WorkItem[];
  completed?: boolean;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.activityTable}>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Aktivitas</th>
            <th>PIC</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.date}-${item.activity}`}>
              <td>{item.date}</td>
              <td>
                <b>{item.activity}</b>
                <small>{item.area}</small>
              </td>
              <td>{item.owner}</td>
              <td>
                <span className={completed ? styles.done : styles.scheduled}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthlyCalendar({
  year,
  month,
  items,
}: {
  year: number;
  month: number;
  items: WorkItem[];
}) {
  const monthTitle = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: firstDay + days }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );
  return (
    <section className={styles.monthCard}>
      <h3>{monthTitle}</h3>
      <div className={styles.weekdays}>
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.monthGrid}>
        {cells.map((day, index) => {
          const date = day
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";
          const events = items.filter((item) => item.scheduled_for === date);
          return (
            <div
              key={`${date}-${index}`}
              className={day ? styles.day : styles.emptyDay}
            >
              <b>{day}</b>
              {events.map((event) => (
                <span key={event.activity} title={event.activity}>
                  {event.area}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PublicMemberDashboard({
  companySlug,
  companyId,
  projectId,
  onSignOut,
  onBackToWorkspace,
}: {
  companySlug: string;
  companyId: string;
  projectId: string | null;
  onSignOut: () => void;
  onBackToWorkspace?: () => void;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState("DiksiLab");
  const [error, setError] = useState("");
  const loadDashboard = useCallback(async () => {
    try {
      if (!projectId) throw new Error("Proyek klien belum tersedia.");
      const supabase = getSupabaseBrowserClient();
      const [
        referenceResponse,
        projectResponse,
        cycleResponse,
        taskResponse,
        meetingResponse,
        approvalResponse,
        spendResponse,
      ] = await Promise.all([
        supabase
          .from("client_public_dashboards")
          .select("payload")
          .eq("slug", companySlug)
          .single(),
        supabase
          .from("projects")
          .select("name,status,progress,starts_on,due_on")
          .eq("id", projectId)
          .single(),
        supabase
          .from("cycles")
          .select("id,name,starts_on,ends_on,summary")
          .eq("project_id", projectId)
          .order("starts_on", { ascending: false })
          .limit(1),
        supabase
          .from("project_tasks")
          .select(
            "id,title,workstream,status,progress,due_on,owner_label,description,updated_at",
          )
          .eq("project_id", projectId)
          .order("due_on", { ascending: true }),
        supabase
          .from("project_meetings")
          .select("id,title,meeting_at,agenda,status")
          .eq("project_id", projectId)
          .neq("status", "cancelled")
          .order("meeting_at", { ascending: true }),
        supabase
          .from("task_approvals")
          .select("id,task_id,status,request_note,created_at")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false }),
        supabase
          .from("ad_spend")
          .select("amount_spent")
          .eq("project_id", projectId),
      ]);
      for (const response of [
        referenceResponse,
        projectResponse,
        cycleResponse,
        taskResponse,
        meetingResponse,
        approvalResponse,
        spendResponse,
      ])
        if (response.error) throw response.error;
      const reference = referenceResponse.data.payload as DashboardData;
      const cycle = cycleResponse.data?.[0] as
        | {
            id: string;
            name: string;
            starts_on: string;
            ends_on: string;
            summary: string | null;
          }
        | undefined;
      const reportResponse = cycle
        ? await supabase
            .from("cycle_reports")
            .select("summary,completed_summary,blockers,next_focus,updated_at")
            .eq("cycle_id", cycle.id)
            .maybeSingle()
        : { data: null, error: null };
      if (reportResponse.error) throw reportResponse.error;
      const taskRows = (taskResponse.data ?? []) as ProjectTaskRow[];
      const meetingRows = (meetingResponse.data ?? []) as ProjectMeetingRow[];
      const completed = taskRows.filter((task) =>
        ["approved", "completed"].includes(task.status),
      );
      const planned = taskRows.filter(
        (task) => !["approved", "completed"].includes(task.status),
      );
      const toWorkItem = (task: ProjectTaskRow): WorkItem => ({
        date: task.due_on ? formatDate(task.due_on) : "Tanpa tenggat",
        scheduled_for: task.due_on ?? "",
        activity: task.title,
        area: task.description || task.workstream.replaceAll("_", " "),
        status: task.status.replaceAll("_", " "),
        owner: task.owner_label || "Diksilab",
      });
      const meetingWork: WorkItem[] = meetingRows.map((meeting) => ({
        date: new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(meeting.meeting_at)),
        scheduled_for: meeting.meeting_at.slice(0, 10),
        activity: meeting.title,
        area: meeting.agenda || "Meeting proyek",
        status: meeting.status === "completed" ? "selesai" : "meeting",
        owner: "Diksilab",
      }));
      const taskById = new Map(taskRows.map((task) => [task.id, task]));
      const updates: Update[] = ((approvalResponse.data ?? []) as ApprovalRow[])
        .slice(0, 6)
        .map((approval) => ({
          title: taskById.get(approval.task_id)?.title ?? "Approval proyek",
          detail: approval.request_note ?? "Menunggu keputusan klien.",
          status:
            approval.status === "pending"
              ? "needs_approval"
              : approval.status === "approved"
                ? "approved"
                : "info",
          owner: approval.status === "pending" ? "Klien" : "Diksilab",
          due: formatDate(approval.created_at.slice(0, 10)),
        }));
      const report = reportResponse.data;
      const project = projectResponse.data as {
        name: string;
        status: string;
        progress: number;
        starts_on: string | null;
        due_on: string | null;
      };
      const spend = (spendResponse.data ?? []) as SpendRow[];
      const adsSpend = spend.reduce(
        (total: number, item: SpendRow) => total + Number(item.amount_spent),
        0,
      );
      setData({
        ...reference,
        client_name: reference.client_name,
        project_name: project.name,
        cycle_name: cycle?.name ?? "Project",
        cycle_start:
          cycle?.starts_on ??
          project.starts_on ??
          new Date().toISOString().slice(0, 10),
        cycle_end:
          cycle?.ends_on ??
          project.due_on ??
          new Date().toISOString().slice(0, 10),
        project_status: project.status,
        progress: project.progress,
        ads_spend: adsSpend,
        tracker_count: taskRows.length,
        calendar_work: [...planned.map(toWorkItem), ...meetingWork].sort(
          (left, right) =>
            left.scheduled_for.localeCompare(right.scheduled_for),
        ),
        planned_work: planned.map(toWorkItem),
        completed_work: completed.map(toWorkItem),
        updates,
        client_actions: report?.blockers
          ? [
              {
                title: "Keputusan / hambatan cycle",
                detail: report.blockers,
                status: "needs_input",
                due: "Perlu ditinjau",
              },
            ]
          : [],
        documents: [],
        metrics: [
          {
            name: "Amount spent",
            group: "Ads",
            value: adsSpend,
            unit: "IDR",
            status: "on_track",
          },
          ...reference.metrics.filter(
            (metric) => metric.name !== "Amount spent",
          ),
        ],
      });
      setUpdatedAt(
        report?.updated_at ??
          taskRows
            .map((task) => task.updated_at)
            .sort()
            .at(-1) ??
          new Date().toISOString(),
      );
      setUpdatedBy("Ruang kerja Diksilab");
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Dashboard belum dapat disinkronkan.",
      );
    }
  }, [companyId, companySlug, projectId]);
  useEffect(() => {
    const initial = window.setTimeout(() => void loadDashboard(), 0);
    const interval = window.setInterval(() => void loadDashboard(), 60000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [loadDashboard]);
  const approvalCount = useMemo(
    () =>
      data?.updates.filter((item) => item.status === "needs_approval").length ??
      0,
    [data],
  );
  const currentCalendarMonth = new Date();
  const nextCalendarMonth = new Date(
    currentCalendarMonth.getFullYear(),
    currentCalendarMonth.getMonth() + 1,
    1,
  );
  if (!data)
    return (
      <main className={styles.loading}>
        <b>
          DIKSI<span>LAB</span>
        </b>
        <p>{error || "Menyinkronkan dashboard klien…"}</p>
        <button onClick={() => void loadDashboard()}>Coba lagi</button>
      </main>
    );
  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          DIKSI<span>LAB</span>
        </Link>
        <div className={styles.client}>
          <span>DS</span>
          <div>
            <b>{data.client_name}</b>
            <small>Client workspace</small>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Navigasi dashboard">
          <a className={styles.active} href="#overview">
            ◈ <span>Dashboard</span>
          </a>
          <a href="#launchpad">
            ✳ <span>Cycle 0 Launchpad</span>
          </a>
          <a href="#calendar">
            ▥ <span>Kalender</span>
          </a>
          <a href="#roadmap">
            ↗ <span>Roadmap</span>
          </a>
          <a href="#brand">
            ✳ <span>Brand guideline</span>
          </a>
          <a href="#delivery">
            ◫ <span>Workstreams</span>
          </a>
          <a href="#planned">
            ◷ <span>Akan dilakukan</span>
          </a>
          <a href="#completed">
            ✓ <span>Telah dilakukan</span>
          </a>
          <a href="#updates">
            ◌ <span>Update &amp; approval</span>
          </a>
          <a href="#meetings">
            ◌ <span>Meeting &amp; MoM</span>
          </a>
          <a href="#documents">
            ▤ <span>Dokumen</span>
          </a>
        </nav>
        <div className={styles.sidebarFoot}>
          <b>READ ONLY</b>
          <span>Data disinkronkan otomatis dari tracker Diksilab.</span>
          {onBackToWorkspace ? (
            <button type="button" onClick={onBackToWorkspace}>
              ← Ruang kerja Diksilab
            </button>
          ) : null}
          <button type="button" onClick={onSignOut}>
            Keluar
          </button>
        </div>
      </aside>
      <section className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p>CLIENT DASHBOARD / {data.cycle_name.toUpperCase()}</p>
            <h1>{data.client_name}</h1>
          </div>
          <div className={styles.topStatus}>
            <i /> Live workspace{" "}
            <span>
              Diperbarui {formatSync(updatedAt)} oleh {updatedBy}
            </span>
          </div>
        </header>
        <section id="overview" className={styles.metrics}>
          <article className={styles.metricLime}>
            <small>STATUS PROYEK</small>
            <strong>{data.project_status}</strong>
            <span>{data.cycle_name} berjalan</span>
            <b>↗</b>
          </article>
          <article className={styles.metricPurple}>
            <small>PROGRES CYCLE</small>
            <strong>{data.progress}%</strong>
            <span>
              {formatDate(data.cycle_start)} — {formatDate(data.cycle_end)}
            </span>
            <b>◴</b>
          </article>
          <article className={styles.metricBlue}>
            <small>PEKERJAAN TRACKER</small>
            <strong>{data.tracker_count}</strong>
            <span>{data.planned_work.length} agenda berikutnya</span>
            <b>▥</b>
          </article>
          <article className={styles.metricPink}>
            <small>AMOUNT SPENT · ADS</small>
            <strong>{rupiah(data.ads_spend)}</strong>
            <span>Dicatat pada tracker</span>
            <b>◌</b>
          </article>
        </section>
        <KickoffLaunchpad companyId={companyId} projectId={projectId} />
        <section id="calendar" className={styles.cyclePanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>KALENDER BULANAN</p>
              <h2>Jadwal saat ini dan bulan berikutnya</h2>
            </div>
            <span>Task dan meeting yang dibagikan tim</span>
          </div>
          <div className={styles.monthCalendar}>
            <MonthlyCalendar
              year={currentCalendarMonth.getFullYear()}
              month={currentCalendarMonth.getMonth()}
              items={data.calendar_work}
            />
            <MonthlyCalendar
              year={nextCalendarMonth.getFullYear()}
              month={nextCalendarMonth.getMonth()}
              items={data.calendar_work}
            />
          </div>
          <p className={styles.calendarNote}>
            Kalender otomatis menampilkan bulan berjalan dan bulan berikutnya.
            Meeting ditandai bersama task yang dibagikan oleh tim Diksilab.
          </p>
        </section>
        <section id="cycle-report" className={styles.activityPanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>RINGKASAN CYCLE</p>
              <h2>Apa yang bergerak dan keputusan berikutnya</h2>
            </div>
            <span>LIVE DARI WORKSPACE</span>
          </div>
          <div className={styles.updateList}>
            <article>
              <span className={styles.update_info}>Fokus</span>
              <div>
                <b>{data.cycle_name}</b>
                <p>
                  {data.client_actions.find((item) =>
                    item.title.includes("hambatan"),
                  )?.detail
                    ? "Tim sedang menindaklanjuti kebutuhan yang tercatat di bawah."
                    : "Target dan aktivitas cycle diperbarui langsung oleh Team Diksilab."}
                </p>
              </div>
            </article>
            <article>
              <span className={styles.update_approved}>Selesai</span>
              <div>
                <b>{data.completed_work.length} task tercatat selesai</b>
                <p>Lihat daftar detail pada bagian “Telah dilakukan”.</p>
              </div>
            </article>
            {data.client_actions.map((item) => (
              <article key={item.title}>
                <span className={styles.update_needs_approval}>Perlu aksi</span>
                <div>
                  <b>{item.title}</b>
                  <p>{item.detail}</p>
                  <small>{item.due}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="roadmap" className={styles.activityPanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>ROADMAP</p>
              <h2>Arah pengembangan proyek</h2>
            </div>
            <span>2026 — 2027</span>
          </div>
          <div className={styles.roadmap}>
            {data.roadmap.map((item) => (
              <article key={item.phase}>
                <i className={styles[`roadmap_${item.status}`]} />
                <div>
                  <small>
                    {item.phase} · {item.period}
                  </small>
                  <h3>{item.title}</h3>
                  <p>{item.focus}</p>
                </div>
                <span>
                  {item.status === "active"
                    ? "Berjalan"
                    : item.status === "next"
                      ? "Berikutnya"
                      : "Proyeksi"}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section
          id="brand"
          className={`${styles.activityPanel} ${brand.guideline}`}
        >
          <div className={styles.panelTitle}>
            <div>
              <p>BRAND GUIDELINE</p>
              <h2>Dr. Santi&apos;s Story visual system</h2>
            </div>
            <span>KEY VISUAL · AGUSTUS 2026</span>
          </div>
          <p className={brand.positioning}>
            {data.brand_guideline.positioning}
          </p>
          <div className={brand.personality}>
            {data.brand_guideline.personality.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className={brand.colorGrid}>
            {data.brand_guideline.colors.map((color) => (
              <article key={color.hex}>
                <i style={{ backgroundColor: color.hex }} />
                <b>{color.name}</b>
                <code>{color.hex}</code>
                <small>{color.role}</small>
              </article>
            ))}
          </div>
          <div className={brand.rules}>
            <article>
              <small>TYPOGRAPHY</small>
              <p>{data.brand_guideline.typography}</p>
            </article>
            <article>
              <small>IMAGERY</small>
              <p>{data.brand_guideline.imagery}</p>
            </article>
            <article>
              <small>TONE &amp; CTA</small>
              <p>
                {data.brand_guideline.tone} {data.brand_guideline.cta}
              </p>
            </article>
          </div>
        </section>
        <section id="delivery" className={styles.activityPanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>DELIVERY WORKSTREAMS</p>
              <h2>Yang akan dibangun dan diukur</h2>
            </div>
            <span>6 WORKSTREAM</span>
          </div>
          <div className={brand.workstreams}>
            {data.delivery_workstreams.map((item) => (
              <article key={item.name}>
                <div>
                  <span
                    className={
                      item.status === "ready" ? brand.ready : brand.planned
                    }
                  >
                    {item.status === "ready" ? "Siap kickoff" : "Direncanakan"}
                  </span>
                  <small>
                    {item.owner} · {item.due}
                  </small>
                </div>
                <h3>{item.name}</h3>
                <ul>
                  {item.outputs.map((output) => (
                    <li key={output}>{output}</li>
                  ))}
                </ul>
                <p>
                  <b>KPI:</b> {item.kpi}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section id="planned" className={styles.activityPanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>YANG AKAN DILAKUKAN</p>
              <h2>Agenda dan PIC</h2>
            </div>
            <span className={styles.badgeSchedule}>
              {data.planned_work.length} TERJADWAL
            </span>
          </div>
          <ActivityTable items={data.planned_work} />
        </section>
        <section id="completed" className={styles.activityPanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>YANG TELAH DILAKUKAN</p>
              <h2>Aktivitas yang tercatat</h2>
            </div>
            <span className={styles.badgeDone}>
              {data.completed_work.length} SELESAI
            </span>
          </div>
          <ActivityTable items={data.completed_work} completed />
        </section>
        <section id="updates" className={styles.dualGrid}>
          <section className={styles.activityPanel}>
            <div className={styles.panelTitle}>
              <div>
                <p>UPDATE &amp; APPROVAL</p>
                <h2>Keputusan yang perlu dipantau</h2>
              </div>
              <span
                className={
                  approvalCount ? styles.badgeSchedule : styles.badgeDone
                }
              >
                {approvalCount
                  ? `${approvalCount} PERLU APPROVAL`
                  : "TIDAK ADA"}
              </span>
            </div>
            <div className={styles.updateList}>
              {data.updates.map((item) => (
                <article key={item.title}>
                  <span className={styles[`update_${item.status}`]}>
                    {item.status === "needs_approval"
                      ? "Perlu approval"
                      : item.status === "approved"
                        ? "Disetujui"
                        : "Update"}
                  </span>
                  <div>
                    <b>{item.title}</b>
                    <p>{item.detail}</p>
                    <small>
                      PIC: {item.owner} · Target: {item.due}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            <div className={brand.clientActions}>
              {data.client_actions.map((item) => (
                <article key={item.title}>
                  <span
                    className={
                      item.status === "needs_approval"
                        ? brand.actionApproval
                        : brand.actionInput
                    }
                  >
                    {item.status === "needs_approval"
                      ? "Perlu persetujuan"
                      : "Perlu input"}
                  </span>
                  <div>
                    <b>{item.title}</b>
                    <p>{item.detail}</p>
                  </div>
                  <small>{item.due}</small>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.activityPanel}>
            <div className={styles.panelTitle}>
              <div>
                <p>KPI &amp; REPORTING</p>
                <h2>Baseline Cycle 0</h2>
              </div>
              <span>AKAN DIPERBARUI</span>
            </div>
            <div className={styles.kpiGrid}>
              {data.metrics.map((metric) => (
                <article key={metric.name}>
                  <small>{metric.group}</small>
                  <strong>
                    {metric.value === null
                      ? "—"
                      : metric.unit === "IDR"
                        ? rupiah(metric.value)
                        : `${metric.value}${metric.unit}`}
                  </strong>
                  <span>{metric.name}</span>
                  <i
                    className={
                      metric.status === "on_track" ? styles.kpiReady : ""
                    }
                  >
                    {metric.status === "on_track"
                      ? "Tercatat"
                      : "Menunggu baseline"}
                  </i>
                </article>
              ))}
            </div>
          </section>
        </section>
        <section id="documents" className={styles.activityPanel}>
          <div className={styles.panelTitle}>
            <div>
              <p>DOKUMEN</p>
              <h2>Katalog dokumen proyek</h2>
            </div>
            <span>FILE TETAP PRIVAT</span>
          </div>
          <div className={styles.documentGrid}>
            {data.documents.map((document) => (
              <article key={document.title}>
                <b>▤</b>
                <div>
                  <strong>{document.title}</strong>
                  <span>
                    {document.type} · {document.version}
                  </span>
                  <small>
                    {document.status} · diperbarui {document.updated}
                  </small>
                </div>
                <i>Terproteksi</i>
              </article>
            ))}
            {data.documents.length === 0 ? (
              <p>
                File proyek dikelompokkan pada task terkait di Ruang Aksi Klien,
                agar versi, status review, dan approval selalu konsisten.
              </p>
            ) : null}
          </div>
        </section>
        <ClientProjectActions companyId={companyId} projectId={projectId} />
        <ClientMeetingNotes projectId={projectId} />
        <footer>
          DIKSILAB CLIENT DASHBOARD <span>•</span> DATA PROYEK BERSIFAT RAHASIA
        </footer>
      </section>
    </main>
  );
}

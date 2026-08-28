"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./public-member.module.css";
import brand from "./brand-guideline.module.css";

type WorkItem = { date: string; scheduled_for: string; activity: string; area: string; status: string; owner: string };
type Update = { title: string; detail: string; status: "needs_approval" | "approved" | "info"; owner: string; due: string };
type Metric = { name: string; group: string; value: number | null; unit: string; status: string };
type DocumentItem = { title: string; type: string; version: string; status: string; updated: string };
type RoadmapItem = { phase: string; period: string; title: string; focus: string; status: "active" | "next" | "future" };
type BrandColor = { name: string; hex: string; role: string };
type BrandGuideline = { positioning: string; personality: string[]; colors: BrandColor[]; typography: string; imagery: string; tone: string; cta: string };
type DeliveryWorkstream = { name: string; status: "ready" | "planned"; owner: string; due: string; outputs: string[]; kpi: string };
type ClientAction = { title: string; detail: string; status: "needs_approval" | "needs_input"; due: string };
type DashboardData = { client_name: string; project_name: string; cycle_name: string; cycle_start: string; cycle_end: string; project_status: string; progress: number; ads_spend: number; tracker_count: number; planned_work: WorkItem[]; completed_work: WorkItem[]; updates: Update[]; metrics: Metric[]; documents: DocumentItem[]; roadmap: RoadmapItem[]; brand_guideline: BrandGuideline; delivery_workstreams: DeliveryWorkstream[]; client_actions: ClientAction[] };

function formatDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatSync(value: string | null) { return value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "Menyinkronkan"; }
function rupiah(value: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value); }

function ActivityTable({ items, completed = false }: { items: WorkItem[]; completed?: boolean }) {
  return <div className={styles.tableWrap}><table className={styles.activityTable}><thead><tr><th>Waktu</th><th>Aktivitas</th><th>PIC</th><th>Status</th></tr></thead><tbody>{items.map((item) => <tr key={`${item.date}-${item.activity}`}><td>{item.date}</td><td><b>{item.activity}</b><small>{item.area}</small></td><td>{item.owner}</td><td><span className={completed ? styles.done : styles.scheduled}>{item.status}</span></td></tr>)}</tbody></table></div>;
}

function MonthlyCalendar({ year, month, items }: { year: number; month: number; items: WorkItem[] }) {
  const monthTitle = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: firstDay + days }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  return <section className={styles.monthCard}><h3>{monthTitle}</h3><div className={styles.weekdays}>{["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => <span key={day}>{day}</span>)}</div><div className={styles.monthGrid}>{cells.map((day, index) => { const date = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : ""; const events = items.filter((item) => item.scheduled_for === date); return <div key={`${date}-${index}`} className={day ? styles.day : styles.emptyDay}><b>{day}</b>{events.map((event) => <span key={event.activity} title={event.activity}>{event.area}</span>)}</div>; })}</div></section>;
}

export function PublicMemberDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState("DiksiLab");
  const [error, setError] = useState("");
  const loadDashboard = useCallback(async () => {
    try {
      const { data: row, error: queryError } = await getSupabaseBrowserClient().from("client_public_dashboards").select("payload, updated_at, updated_by").eq("slug", "dr-santi-story").single();
      if (queryError) throw queryError;
      setData(row.payload as DashboardData); setUpdatedAt(row.updated_at); setUpdatedBy(row.updated_by); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Dashboard belum dapat disinkronkan."); }
  }, []);
  useEffect(() => { const initial = window.setTimeout(() => void loadDashboard(), 0); const interval = window.setInterval(() => void loadDashboard(), 60000); return () => { window.clearTimeout(initial); window.clearInterval(interval); }; }, [loadDashboard]);
  const approvalCount = useMemo(() => data?.updates.filter((item) => item.status === "needs_approval").length ?? 0, [data]);
  if (!data) return <main className={styles.loading}><b>DIKSI<span>LAB</span></b><p>{error || "Menyinkronkan dashboard klien…"}</p><button onClick={() => void loadDashboard()}>Coba lagi</button></main>;
  return <main className={styles.dashboard}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}>DIKSI<span>LAB</span></Link>
      <div className={styles.client}><span>DS</span><div><b>{data.client_name}</b><small>Client workspace</small></div></div>
      <nav className={styles.nav} aria-label="Navigasi dashboard"><a className={styles.active} href="#overview">◈ <span>Dashboard</span></a><a href="#calendar">▥ <span>Kalender</span></a><a href="#roadmap">↗ <span>Roadmap</span></a><a href="#brand">✳ <span>Brand guideline</span></a><a href="#delivery">◫ <span>Workstreams</span></a><a href="#planned">◷ <span>Akan dilakukan</span></a><a href="#completed">✓ <span>Telah dilakukan</span></a><a href="#updates">◌ <span>Update &amp; approval</span></a><a href="#documents">▤ <span>Dokumen</span></a></nav>
      <div className={styles.sidebarFoot}><b>READ ONLY</b><span>Data disinkronkan otomatis dari tracker Diksilab.</span></div>
    </aside>
    <section className={styles.main}>
      <header className={styles.topbar}><div><p>CLIENT DASHBOARD / {data.cycle_name.toUpperCase()}</p><h1>{data.client_name}</h1></div><div className={styles.topStatus}><i /> Live workspace <span>Diperbarui {formatSync(updatedAt)} oleh {updatedBy}</span></div></header>
      <section id="overview" className={styles.metrics}>
        <article className={styles.metricLime}><small>STATUS PROYEK</small><strong>{data.project_status}</strong><span>{data.cycle_name} berjalan</span><b>↗</b></article>
        <article className={styles.metricPurple}><small>PROGRES CYCLE</small><strong>{data.progress}%</strong><span>{formatDate(data.cycle_start)} — {formatDate(data.cycle_end)}</span><b>◴</b></article>
        <article className={styles.metricBlue}><small>PEKERJAAN TRACKER</small><strong>{data.tracker_count}</strong><span>{data.planned_work.length} agenda berikutnya</span><b>▥</b></article>
        <article className={styles.metricPink}><small>AMOUNT SPENT · ADS</small><strong>{rupiah(data.ads_spend)}</strong><span>Dicatat pada tracker</span><b>◌</b></article>
      </section>
      <section id="calendar" className={styles.cyclePanel}><div className={styles.panelTitle}><div><p>KALENDER BULANAN</p><h2>Jadwal Cycle 0</h2></div><span>{formatDate(data.cycle_start)} — {formatDate(data.cycle_end)}</span></div><div className={styles.monthCalendar}><MonthlyCalendar year={2026} month={7} items={data.planned_work} /><MonthlyCalendar year={2026} month={8} items={data.planned_work} /></div><p className={styles.calendarNote}>Label pada tanggal menandai workstream yang terjadwal. Detail dan PIC tersedia di tabel agenda di bawah.</p></section>
      <section id="roadmap" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>ROADMAP</p><h2>Arah pengembangan proyek</h2></div><span>2026 — 2027</span></div><div className={styles.roadmap}>{data.roadmap.map((item) => <article key={item.phase}><i className={styles[`roadmap_${item.status}`]} /><div><small>{item.phase} · {item.period}</small><h3>{item.title}</h3><p>{item.focus}</p></div><span>{item.status === "active" ? "Berjalan" : item.status === "next" ? "Berikutnya" : "Proyeksi"}</span></article>)}</div></section>
      <section id="brand" className={`${styles.activityPanel} ${brand.guideline}`}><div className={styles.panelTitle}><div><p>BRAND GUIDELINE</p><h2>Dr. Santi&apos;s Story visual system</h2></div><span>KEY VISUAL · AGUSTUS 2026</span></div><p className={brand.positioning}>{data.brand_guideline.positioning}</p><div className={brand.personality}>{data.brand_guideline.personality.map((item) => <span key={item}>{item}</span>)}</div><div className={brand.colorGrid}>{data.brand_guideline.colors.map((color) => <article key={color.hex}><i style={{ backgroundColor: color.hex }} /><b>{color.name}</b><code>{color.hex}</code><small>{color.role}</small></article>)}</div><div className={brand.rules}><article><small>TYPOGRAPHY</small><p>{data.brand_guideline.typography}</p></article><article><small>IMAGERY</small><p>{data.brand_guideline.imagery}</p></article><article><small>TONE &amp; CTA</small><p>{data.brand_guideline.tone} {data.brand_guideline.cta}</p></article></div></section>
      <section id="delivery" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>DELIVERY WORKSTREAMS</p><h2>Yang akan dibangun dan diukur</h2></div><span>6 WORKSTREAM</span></div><div className={brand.workstreams}>{data.delivery_workstreams.map((item) => <article key={item.name}><div><span className={item.status === "ready" ? brand.ready : brand.planned}>{item.status === "ready" ? "Siap kickoff" : "Direncanakan"}</span><small>{item.owner} · {item.due}</small></div><h3>{item.name}</h3><ul>{item.outputs.map((output) => <li key={output}>{output}</li>)}</ul><p><b>KPI:</b> {item.kpi}</p></article>)}</div></section>
      <section id="planned" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>YANG AKAN DILAKUKAN</p><h2>Agenda dan PIC</h2></div><span className={styles.badgeSchedule}>{data.planned_work.length} TERJADWAL</span></div><ActivityTable items={data.planned_work} /></section>
      <section id="completed" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>YANG TELAH DILAKUKAN</p><h2>Aktivitas yang tercatat</h2></div><span className={styles.badgeDone}>{data.completed_work.length} SELESAI</span></div><ActivityTable items={data.completed_work} completed /></section>
      <section id="updates" className={styles.dualGrid}><section className={styles.activityPanel}><div className={styles.panelTitle}><div><p>UPDATE &amp; APPROVAL</p><h2>Keputusan yang perlu dipantau</h2></div><span className={approvalCount ? styles.badgeSchedule : styles.badgeDone}>{approvalCount ? `${approvalCount} PERLU APPROVAL` : "TIDAK ADA"}</span></div><div className={styles.updateList}>{data.updates.map((item) => <article key={item.title}><span className={styles[`update_${item.status}`]}>{item.status === "needs_approval" ? "Perlu approval" : item.status === "approved" ? "Disetujui" : "Update"}</span><div><b>{item.title}</b><p>{item.detail}</p><small>PIC: {item.owner} · Target: {item.due}</small></div></article>)}</div><div className={brand.clientActions}>{data.client_actions.map((item) => <article key={item.title}><span className={item.status === "needs_approval" ? brand.actionApproval : brand.actionInput}>{item.status === "needs_approval" ? "Perlu persetujuan" : "Perlu input"}</span><div><b>{item.title}</b><p>{item.detail}</p></div><small>{item.due}</small></article>)}</div></section><section className={styles.activityPanel}><div className={styles.panelTitle}><div><p>KPI &amp; REPORTING</p><h2>Baseline Cycle 0</h2></div><span>AKAN DIPERBARUI</span></div><div className={styles.kpiGrid}>{data.metrics.map((metric) => <article key={metric.name}><small>{metric.group}</small><strong>{metric.value === null ? "—" : metric.unit === "IDR" ? rupiah(metric.value) : `${metric.value}${metric.unit}`}</strong><span>{metric.name}</span><i className={metric.status === "on_track" ? styles.kpiReady : ""}>{metric.status === "on_track" ? "Tercatat" : "Menunggu baseline"}</i></article>)}</div></section></section>
      <section id="documents" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>DOKUMEN</p><h2>Katalog dokumen proyek</h2></div><span>FILE TETAP PRIVAT</span></div><div className={styles.documentGrid}>{data.documents.map((document) => <article key={document.title}><b>▤</b><div><strong>{document.title}</strong><span>{document.type} · {document.version}</span><small>{document.status} · diperbarui {document.updated}</small></div><i>Terproteksi</i></article>)}</div></section>
      <footer>DIKSILAB CLIENT DASHBOARD <span>•</span> DATA PROYEK BERSIFAT RAHASIA</footer>
    </section>
  </main>;
}

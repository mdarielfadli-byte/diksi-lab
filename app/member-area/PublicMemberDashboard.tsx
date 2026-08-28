"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./public-member.module.css";

type WorkItem = { date: string; activity: string; area: string; status: string; owner: string };
type Update = { title: string; detail: string; status: "needs_approval" | "approved" | "info"; owner: string; due: string };
type Metric = { name: string; group: string; value: number | null; unit: string; status: string };
type DocumentItem = { title: string; type: string; version: string; status: string; updated: string };
type DashboardData = { client_name: string; project_name: string; cycle_name: string; cycle_start: string; cycle_end: string; project_status: string; progress: number; ads_spend: number; tracker_count: number; planned_work: WorkItem[]; completed_work: WorkItem[]; updates: Update[]; metrics: Metric[]; documents: DocumentItem[] };

function formatDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatSync(value: string | null) { return value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "Menyinkronkan"; }
function rupiah(value: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value); }

function ActivityTable({ items, completed = false }: { items: WorkItem[]; completed?: boolean }) {
  return <div className={styles.tableWrap}><table className={styles.activityTable}><thead><tr><th>Waktu</th><th>Aktivitas</th><th>PIC</th><th>Status</th></tr></thead><tbody>{items.map((item) => <tr key={`${item.date}-${item.activity}`}><td>{item.date}</td><td><b>{item.activity}</b><small>{item.area}</small></td><td>{item.owner}</td><td><span className={completed ? styles.done : styles.scheduled}>{item.status}</span></td></tr>)}</tbody></table></div>;
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
      <nav className={styles.nav} aria-label="Navigasi dashboard"><a className={styles.active} href="#overview">◈ <span>Dashboard</span></a><a href="#calendar">▥ <span>Kalender</span></a><a href="#planned">◷ <span>Akan dilakukan</span></a><a href="#completed">✓ <span>Telah dilakukan</span></a><a href="#updates">◌ <span>Update &amp; approval</span></a><a href="#documents">▤ <span>Dokumen</span></a></nav>
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
      <section id="calendar" className={styles.cyclePanel}><div className={styles.panelTitle}><div><p>KALENDER CYCLE</p><h2>{data.project_name}</h2></div><span>{formatDate(data.cycle_start)} — {formatDate(data.cycle_end)}</span></div><div className={styles.calendarGrid}>{data.planned_work.map((item, index) => <article key={item.activity}><b>{String(index + 1).padStart(2, "0")}</b><div><small>{item.date}</small><h3>{item.area}</h3><p>{item.activity}</p></div></article>)}</div></section>
      <section id="planned" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>YANG AKAN DILAKUKAN</p><h2>Agenda dan PIC</h2></div><span className={styles.badgeSchedule}>{data.planned_work.length} TERJADWAL</span></div><ActivityTable items={data.planned_work} /></section>
      <section id="completed" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>YANG TELAH DILAKUKAN</p><h2>Aktivitas yang tercatat</h2></div><span className={styles.badgeDone}>{data.completed_work.length} SELESAI</span></div><ActivityTable items={data.completed_work} completed /></section>
      <section id="updates" className={styles.dualGrid}><section className={styles.activityPanel}><div className={styles.panelTitle}><div><p>UPDATE &amp; APPROVAL</p><h2>Keputusan yang perlu dipantau</h2></div><span className={approvalCount ? styles.badgeSchedule : styles.badgeDone}>{approvalCount ? `${approvalCount} PERLU APPROVAL` : "TIDAK ADA"}</span></div><div className={styles.updateList}>{data.updates.map((item) => <article key={item.title}><span className={styles[`update_${item.status}`]}>{item.status === "needs_approval" ? "Perlu approval" : item.status === "approved" ? "Disetujui" : "Update"}</span><div><b>{item.title}</b><p>{item.detail}</p><small>PIC: {item.owner} · Target: {item.due}</small></div></article>)}</div></section><section className={styles.activityPanel}><div className={styles.panelTitle}><div><p>KPI &amp; REPORTING</p><h2>Baseline Cycle 0</h2></div><span>AKAN DIPERBARUI</span></div><div className={styles.kpiGrid}>{data.metrics.map((metric) => <article key={metric.name}><small>{metric.group}</small><strong>{metric.value === null ? "—" : metric.unit === "IDR" ? rupiah(metric.value) : `${metric.value}${metric.unit}`}</strong><span>{metric.name}</span><i className={metric.status === "on_track" ? styles.kpiReady : ""}>{metric.status === "on_track" ? "Tercatat" : "Menunggu baseline"}</i></article>)}</div></section></section>
      <section id="documents" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>DOKUMEN</p><h2>Katalog dokumen proyek</h2></div><span>FILE TETAP PRIVAT</span></div><div className={styles.documentGrid}>{data.documents.map((document) => <article key={document.title}><b>▤</b><div><strong>{document.title}</strong><span>{document.type} · {document.version}</span><small>{document.status} · diperbarui {document.updated}</small></div><i>Terproteksi</i></article>)}</div></section>
      <footer>DIKSILAB CLIENT DASHBOARD <span>•</span> DATA PROYEK BERSIFAT RAHASIA</footer>
    </section>
  </main>;
}

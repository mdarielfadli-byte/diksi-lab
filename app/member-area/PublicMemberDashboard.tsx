import Link from "next/link";
import styles from "./public-member.module.css";

const plannedWork = [
  ["29 AGU", "Kickoff Cycle 0 & penguncian readiness", "Governance", "Terjadwal"],
  ["2 — 4 SEP", "Audit baseline Instagram, LinkedIn, ads, positioning, dan audiens", "Content & performance", "Terjadwal"],
  ["8 — 15 SEP", "Website, CTA, SEO, dan funnel/CRM", "Digital foundation", "Terjadwal"],
  ["19 — 27 SEP", "Produksi, QA, handover, dan rekomendasi Cycle 1", "Delivery", "Terjadwal"],
];

const completedWork = [
  ["28 AGU", "Project Dr. Santi Story, Cycle 0, dan 10 item pekerjaan dibuat di tracker Diksilab.", "Setup project", "Selesai"],
  ["28 AGU", "Proposal kemitraan dan Cycle 0 execution pack ditinjau sebagai dasar pelaksanaan.", "Dokumen kerja", "Selesai"],
  ["28 AGU", "Dashboard read-only untuk cycle, progres, jadwal, dan pengeluaran ads diterbitkan.", "Dashboard klien", "Selesai"],
];

function ActivityTable({ items, completed = false }: { items: string[][]; completed?: boolean }) {
  return <div className={styles.tableWrap}><table className={styles.activityTable}><thead><tr><th>Waktu</th><th>Aktivitas</th><th>Area</th><th>Status</th></tr></thead><tbody>{items.map(([date, activity, area, status]) => <tr key={`${date}-${area}`}><td>{date}</td><td>{activity}</td><td>{area}</td><td><span className={completed ? styles.done : styles.scheduled}>{status}</span></td></tr>)}</tbody></table></div>;
}

export function PublicMemberDashboard() {
  return <main className={styles.dashboard}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}>DIKSI<span>LAB</span></Link>
      <div className={styles.client}><span>DS</span><div><b>Dr. Santi Story</b><small>Client workspace</small></div></div>
      <nav className={styles.nav} aria-label="Navigasi dashboard"><a className={styles.active} href="#overview">◈ <span>Dashboard</span></a><a href="#cycle">▥ <span>Cycle 0</span></a><a href="#planned">◷ <span>Akan dilakukan</span></a><a href="#completed">✓ <span>Telah dilakukan</span></a><a href="#spend">◌ <span>Amount spent</span></a></nav>
      <div className={styles.sidebarFoot}><b>READ ONLY</b><span>Update disiapkan oleh tim Diksilab melalui Codex.</span></div>
    </aside>
    <section className={styles.main}>
      <header className={styles.topbar}><div><p>CLIENT DASHBOARD / CYCLE 0</p><h1>Dr. Santi Story</h1></div><div className={styles.topStatus}><i /> Live workspace <span>29 AGU — 27 SEP 2026</span></div></header>
      <section id="overview" className={styles.metrics}>
        <article className={styles.metricLime}><small>STATUS PROYEK</small><strong>Aktif</strong><span>Cycle 0 dimulai hari ini</span><b>↗</b></article>
        <article className={styles.metricPurple}><small>PROGRES CYCLE</small><strong>0%</strong><span>30 hari menuju handover</span><b>◴</b></article>
        <article className={styles.metricBlue}><small>PEKERJAAN TRACKER</small><strong>10</strong><span>4 tahap kerja utama</span><b>▥</b></article>
        <article id="spend" className={styles.metricPink}><small>AMOUNT SPENT · ADS</small><strong>Rp0</strong><span>Belum ada spend tercatat</span><b>◌</b></article>
      </section>
      <section id="cycle" className={styles.cyclePanel}>
        <div className={styles.panelTitle}><div><p>RINGKASAN CYCLE 0</p><h2>Foundation &amp; Digital Readiness</h2></div><span>30 HARI</span></div>
        <div className={styles.phaseGrid}><article><b>01</b><div><small>29 AGU — 4 SEP</small><h3>Kickoff &amp; strategy</h3><p>Readiness, positioning, audiens, CTA, dan alur kerja.</p></div></article><article><b>02</b><div><small>2 — 11 SEP</small><h3>Content &amp; performance</h3><p>Baseline Instagram, LinkedIn, boosting, dan paid media.</p></div></article><article><b>03</b><div><small>8 — 27 SEP</small><h3>Digital foundation</h3><p>Website, SEO, CRM, collateral, QA, dan handover.</p></div></article></div>
      </section>
      <section id="planned" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>YANG AKAN DILAKUKAN</p><h2>Agenda Cycle 0</h2></div><span className={styles.badgeSchedule}>4 TERJADWAL</span></div><ActivityTable items={plannedWork} /></section>
      <section id="completed" className={styles.activityPanel}><div className={styles.panelTitle}><div><p>YANG TELAH DILAKUKAN</p><h2>Fondasi sudah disiapkan</h2></div><span className={styles.badgeDone}>3 SELESAI</span></div><ActivityTable items={completedWork} completed /></section>
      <footer>DIKSILAB CLIENT DASHBOARD <span>•</span> DATA PROYEK BERSIFAT RAHASIA</footer>
    </section>
  </main>;
}

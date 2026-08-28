import Link from "next/link";
import styles from "./public-member.module.css";

const workstreams = [
  ["KICKOFF & STRATEGY", "29 AGU — 4 SEP", "Kickoff Cycle 0", "Mengunci readiness, positioning, audiens prioritas, CTA, dan alur kerja."],
  ["CONTENT & PERFORMANCE", "2 — 11 SEP", "Baseline dan audit", "Audit Instagram, LinkedIn, histori boosting, serta baseline paid media."],
  ["DIGITAL FOUNDATION", "8 — 27 SEP", "Build, QA & handover", "Website, landing page, SEO, CRM, collateral, QA, dan rekomendasi Cycle 1."],
];

const plannedWork = [
  ["29 AGU", "Kickoff Cycle 0 & penguncian readiness"],
  ["2 — 4 SEP", "Audit baseline Instagram, LinkedIn, ads, positioning, dan audiens"],
  ["8 — 15 SEP", "Website, CTA, SEO, dan funnel/CRM"],
  ["19 — 27 SEP", "Produksi, QA, handover, dan rekomendasi Cycle 1"],
];

const completedWork = [
  ["SETUP PROJECT", "Project Dr. Santi Story, Cycle 0, dan 10 item pekerjaan telah dibuat di tracker Diksilab."],
  ["DOKUMEN KERJA", "Proposal kemitraan dan Cycle 0 execution pack telah ditinjau sebagai dasar pelaksanaan."],
  ["DASHBOARD KLIEN", "Dashboard read-only untuk memantau cycle, progres, jadwal, dan pengeluaran ads telah diterbitkan."],
];

export function PublicMemberDashboard() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>DIKSI<span>LAB</span></Link>
        <span>DR. SANTI STORY · READ ONLY</span>
      </header>
      <section className={styles.hero}>
        <p>CLIENT DASHBOARD</p>
        <h1>Dr. Santi<br /><em>Story.</em></h1>
        <div><b>Cycle 0 · Foundation &amp; Digital Readiness</b><span>Kickoff 29 Agustus 2026 · target handover 27 September 2026.</span></div>
      </section>
      <section className={styles.stats}>
        <article><small>STATUS PROYEK</small><strong>Aktif</strong><span>Cycle 0 siap dimulai</span></article>
        <article><small>PROGRES</small><strong>0%</strong><span>Kickoff terjadwal 29 Agustus</span></article>
        <article><small>AMOUNT SPENT · ADS</small><strong>Rp0</strong><span>Belum ada pengeluaran dicatat</span></article>
      </section>
      <section className={styles.board}>
        <div className={styles.boardHead}><div><p>RINGKASAN CYCLE 0</p><h2>30 hari membangun fondasi.</h2></div><span>29 AGU — 27 SEP 2026</span></div>
        <div className={styles.channelGrid}>{workstreams.map(([channel, date, title, text]) => <article key={channel}><p>{channel}</p><h3>{title}</h3><span>{text}</span><div><i /> <small>{date}</small></div></article>)}</div>
      </section>
      <section className={styles.note}>
        <div><p>YANG AKAN DILAKUKAN</p><h2>Agenda Cycle 0.</h2></div>
        <p>{plannedWork.map(([date, task]) => <span key={task}><b>{date}</b> · {task}<br /></span>)}</p>
      </section>
      <section className={styles.board}>
        <div className={styles.boardHead}><div><p>YANG TELAH DILAKUKAN</p><h2>Fondasi sudah disiapkan.</h2></div><span>UPDATE AWAL</span></div>
        <div className={styles.channelGrid}>{completedWork.map(([label, detail]) => <article key={label}><p>{label}</p><h3>Selesai</h3><span>{detail}</span><div><i /> <small>TERCATAT</small></div></article>)}</div>
      </section>
      <footer>DIKSILAB CLIENT DASHBOARD · DATA PROYEK BERSIFAT RAHASIA</footer>
    </main>
  );
}

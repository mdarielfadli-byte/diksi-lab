"use client";

import { useState } from "react";
import styles from "./kickoff-launchpad.module.css";

type LaunchpadTab = "overview" | "brand" | "delivery" | "decisions" | "resources";

const tabs: Array<{ id: LaunchpadTab; label: string }> = [
  { id: "overview", label: "Mulai di sini" },
  { id: "brand", label: "Arah brand & kreatif" },
  { id: "delivery", label: "Execution blueprint" },
  { id: "decisions", label: "Keputusan & input" },
  { id: "resources", label: "Materi referensi" },
];

const outcomes = [
  ["01", "Inbound yang terarah", "Website dan landing page mengarahkan inquiry speaking, workshop, program sekolah, dan kolaborasi."],
  ["02", "Lead tercatat & dirawat", "Form dan WhatsApp masuk ke Brevo CRM dengan sumber, status, PIC, dan alur follow-up yang jelas."],
  ["03", "Demand tervalidasi", "SEO, konten, dan ads menguji keyword, pesan, audiens, CPL, serta konversi ke qualified lead."],
];

const workstreams = [
  ["Website", "Sitemap, wireframe, positioning, CTA, dan halaman program yang terasa seperti ruang baca hangat."],
  ["Landing Page", "Halaman konversi untuk speaking, workshop, sekolah, dan inquiry yang relevan."],
  ["SEO", "Technical baseline, keyword cluster, dan ritme 2–4 artikel per bulan."],
  ["Brevo CRM", "Pipeline lead, tagging, owner, consent, dan SOP respons inquiry."],
  ["Email Marketing", "Nurture sequence lima email: dari respons awal sampai ajakan percakapan berikutnya."],
  ["Ads", "Testing Invite Dr. Santi, Parent Workshop, retargeting, dan lead magnet."],
];

const decisions = [
  ["Domain & kanal utama", "Konfirmasi domain primer (.com / .id) dan akses domain-hosting.", "Perlu keputusan"],
  ["Aset visual", "Logo, bio dan credential final, 15–20 foto, program, testimonial, serta izin penggunaan.", "Perlu input"],
  ["Akses operasional", "Instagram/Meta, Brevo, dan alur respons inquiry yang disepakati.", "Perlu input"],
  ["Approval model", "Tentukan final approver serta SLA feedback maksimal dua hari kerja.", "Perlu persetujuan"],
];

export function KickoffLaunchpad() {
  const [activeTab, setActiveTab] = useState<LaunchpadTab>("overview");

  return <section id="launchpad" className={styles.panel} aria-label="Cycle 0 Launchpad">
    <header className={styles.hero}>
      <div>
        <p>CYCLE 0 LAUNCHPAD</p>
        <h2>Ruang awal untuk menyatukan arah, keputusan, dan eksekusi.</h2>
        <span>Kickoff 29 Agustus 2026 · Dr. Santi&apos;s Story × DiksiLab</span>
      </div>
      <div className={styles.readiness} aria-label="Status kesiapan kickoff">
        <b>03 <small>/ 07</small></b>
        <span>readiness terkonfirmasi</span>
        <i><em /></i>
      </div>
    </header>

    <div className={styles.tabs} role="tablist" aria-label="Materi Cycle 0 Launchpad">
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? styles.tabActive : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
    </div>

    {activeTab === "overview" ? <div className={styles.content} role="tabpanel">
      <section className={styles.intro}><div><p className={styles.eyebrow}>NORTH STAR · 90 HARI</p><h3>Membangun fondasi digital yang hangat, kredibel, dan siap menghasilkan percakapan yang tepat.</h3></div><p>Cycle 0 mengunci strategi, sistem, dan keputusan produksi—agar website, konten, CRM, email, serta ads bergerak dalam satu arah.</p></section>
      <div className={styles.outcomes}>{outcomes.map(([number, title, detail]) => <article key={number}><span>{number}</span><h4>{title}</h4><p>{detail}</p></article>)}</div>
      <section className={styles.flow}><p className={styles.eyebrow}>CARA KERJA PROYEK</p><div><span>ARAH</span><i>→</i><span>BUILD</span><i>→</i><span>LAUNCH</span><i>→</i><span>OPTIMISE</span></div><small>Cycle 0 · Cycle 1 · Cycle 2 · Cycle 3</small></section>
    </div> : null}

    {activeTab === "brand" ? <div className={styles.content} role="tabpanel">
      <section className={styles.intro}><div><p className={styles.eyebrow}>ARAH BRAND & KREATIF</p><h3>Warm authority—bukan hard sell.</h3></div><p>Dr. Santi&apos;s Story hadir sebagai ruang belajar yang matang: membaca sebagai pintu masuk untuk bertumbuh, mengasuh, memimpin, dan memahami kehidupan.</p></section>
      <div className={styles.brandGrid}><article><small>POSITIONING</small><b>Read · Relate · Grow</b><p>Books open the conversation; pengalaman hidup dan lensa keilmuan membuatnya relevan pada keputusan sehari-hari.</p></article><article><small>PERSONALITY</small><b>Warm · Thoughtful · Grounded · Cultured</b><p>Expertise without preaching. Cerita personal dengan batas yang jelas dan klaim yang akurat.</p></article><article><small>CONTENT RHYTHM</small><b>4 video + 4 carousel / bulan</b><p>Pilot awal: dua post per minggu, dilengkapi stories untuk dialog, polling, dan follow-up.</p></article></div>
      <section className={styles.pillars}><p className={styles.eyebrow}>CONTENT PILLARS</p>{[["Read & Grow", "35%", "Books, meaning, self-growth, lifelong learning"], ["Raise", "30%", "Raising readers, parenting, family conversations"], ["Live & Lead", "20%", "Identity, decisions, influence, leadership"], ["Explore", "15%", "Culture, place, travel, and the way we read the world"]].map(([name, amount, detail]) => <article key={name}><b>{amount}</b><div><h4>{name}</h4><p>{detail}</p></div></article>)}</section>
    </div> : null}

    {activeTab === "delivery" ? <div className={styles.content} role="tabpanel">
      <section className={styles.intro}><div><p className={styles.eyebrow}>EXECUTION BLUEPRINT</p><h3>Enam workstream, satu perjalanan klien yang terhubung.</h3></div><p>Setiap workstream akan diterjemahkan menjadi task, PIC, tenggat, output, approval, dan progress live di dashboard.</p></section>
      <div className={styles.workstreams}>{workstreams.map(([title, detail], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{title}</h4><p>{detail}</p></div></article>)}</div>
      <section className={styles.pilot}><div><p className={styles.eyebrow}>MONTH 1 CONTENT PILOT</p><h3>8 post untuk mengunci suara dan respons audiens.</h3></div><ol><li>Why Reading Is More Than a Habit</li><li>Reading Shapes How We Grow, Raise, Lead & Explore</li><li>When Children Resist Reading</li><li>5 Questions After Reading With Your Child</li></ol></section>
    </div> : null}

    {activeTab === "decisions" ? <div className={styles.content} role="tabpanel">
      <section className={styles.intro}><div><p className={styles.eyebrow}>DECISION DESK</p><h3>Hal-hal yang perlu dikunci agar produksi dapat bergerak tanpa hambatan.</h3></div><p>Konfirmasi atau berikan feedback melalui ruang aksi klien di bagian bawah dashboard. Setiap keputusan dapat ditautkan ke task dan jejak approval.</p></section>
      <div className={styles.decisions}>{decisions.map(([title, detail, state]) => <article key={title}><span>{state}</span><div><h4>{title}</h4><p>{detail}</p></div><a href="#client-actions">Buka ruang aksi →</a></article>)}</div>
      <p className={styles.sla}>Target kerja sama: feedback dan approval diberikan maksimal <b>2 hari kerja</b> agar timeline Cycle 0 tetap terjaga.</p>
    </div> : null}

    {activeTab === "resources" ? <div className={styles.content} role="tabpanel">
      <section className={styles.intro}><div><p className={styles.eyebrow}>MATERI REFERENSI</p><h3>Tiga fondasi yang menjadi sumber arah Cycle 0.</h3></div><p>Ringkasan pada Launchpad disusun dari materi ini. File final dan versi produksi akan dibagikan melalui dokumen task terkait.</p></section>
      <div className={styles.resources}><article><b>PDF</b><div><h4>Kickoff & Cycle 0 Blueprint</h4><p>Tujuan 90 hari, scope Website–Ads, measurement, CRM, roadmap, dan daftar input.</p></div><span>Execution pack</span></article><article><b>PPT</b><div><h4>Creative, Content & Brand Direction</h4><p>Positioning, audience, content pillars, pilot konten, dan commercial guardrails.</p></div><span>Creative concept</span></article><article><b>PDF</b><div><h4>Key Visual & Brand Guideline</h4><p>Visual DNA, colour system, typography, imagery, tone of voice, dan CTA.</p></div><span>Brand system</span></article></div>
      <p className={styles.resourceNote}>Akses file tetap privat dan hanya tersedia bagi anggota proyek yang memiliki otorisasi.</p>
    </div> : null}
  </section>;
}

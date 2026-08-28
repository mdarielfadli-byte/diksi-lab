import type { Metadata } from "next";
import Link from "next/link";
import { PortalTools } from "./PortalTools";
import styles from "./portal.module.css";

export const metadata: Metadata = {
  title: "Ruang Klien | Diksilab",
  description: "Pantau progres, aktivitas, dan dokumen proyek Anda bersama Diksilab.",
  robots: { index: false, follow: false },
};

const tasks = [
  { title: "Finalisasi arah visual konten", owner: "Diksilab", due: "30 Agu", state: "Berjalan" },
  { title: "Persetujuan kalender September", owner: "Dr. Santi Story", due: "1 Sep", state: "Menunggu Anda" },
  { title: "Penulisan 6 konten edukasi", owner: "Diksilab", due: "4 Sep", state: "Berjalan" },
  { title: "Review laporan performa Agustus", owner: "Bersama", due: "6 Sep", state: "Terjadwal" },
];

const activities = [
  ["Hari ini, 10.20", "Diksilab", "menambahkan 3 alternatif visual untuk seri konten September."],
  ["Kemarin, 16.40", "Nadia — Diksilab", "memperbarui strategi caption pada kalender konten."],
  ["26 Agu, 14.12", "Dr. Santi Story", "memberikan masukan pada naskah video “Mitos Kesehatan Kulit”."],
  ["25 Agu, 09.30", "Diksilab", "menyelesaikan evaluasi performa konten bulan Agustus."],
];

const documents = [
  ["Strategi Konten September 2026", "PDF · diperbarui hari ini"],
  ["Kalender Konten September", "Spreadsheet · menunggu persetujuan"],
  ["Laporan Performa Agustus", "PDF · 24 Agu 2026"],
];

export default function MemberArea() {
  return (
    <div className={styles.portal}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/" aria-label="Kembali ke beranda Diksilab">
          DIKSI<span>LAB</span>
        </Link>
        <div className={styles.workspace}>
          <span className={styles.workspaceMark}>DS</span>
          <div><strong>Dr. Santi Story</strong><small>Ruang kerja klien</small></div>
        </div>
        <nav className={styles.menu} aria-label="Navigasi ruang klien">
          <a className={styles.active} href="#ringkasan">Ringkasan</a>
          <a href="#proyek">Proyek</a>
          <a href="#aktivitas">Aktivitas</a>
          <a href="#dokumen">Dokumen</a>
        </nav>
        <div className={styles.support}>
          <p>Butuh bantuan?</p>
          <span>Hubungi project lead Anda untuk hal yang perlu dibicarakan.</span>
          <a href="mailto:hello@diksilab.com">Hubungi Diksilab ↗</a>
        </div>
        <div className={styles.user}><span>SS</span><div><b>dr. Santi</b><small>Klien</small></div><button aria-label="Buka menu akun">···</button></div>
      </aside>

      <main className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>Ruang klien</span><i>/</i><b>Ringkasan</b></div>
          <div className={styles.topActions}><button className={styles.bell} aria-label="Notifikasi">●</button><span>Terakhir diperbarui hari ini, 10.20</span></div>
        </header>

        <section className={styles.intro} id="ringkasan">
          <div><p className={styles.eyebrow}>SELAMAT DATANG, DR. SANTI</p><h1>Semua yang sedang <em>bergerak.</em></h1><p>Pantau progres kerja, tinjau hal yang membutuhkan keputusan, dan temukan dokumen proyek Anda di satu tempat.</p></div>
          <div className={styles.month}><span>AGUSTUS</span><b>2026</b><small>● Siklus kerja aktif</small></div>
        </section>

        <section className={styles.stats} aria-label="Ringkasan proyek">
          <article><span>PROGRES PROYEK</span><strong>78<span>%</span></strong><div className={styles.track}><b /></div><small>Target selesai 6 September</small></article>
          <article><span>PEKERJAAN AKTIF</span><strong>04</strong><p>2 berjalan<br />1 menunggu Anda</p></article>
          <article><span>ITEM PERLU DITINJAU</span><strong>02</strong><p><a href="#proyek">Lihat keputusan Anda <i>→</i></a></p></article>
        </section>

        <section className={styles.project} id="proyek">
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>PROYEK UTAMA</p><h2>Content Growth — Q3 2026</h2></div><a href="#aktivitas">Lihat semua aktivitas <span>→</span></a></div>
          <div className={styles.projectBody}>
            <div className={styles.roadmap}>
              <div className={styles.roadmapTop}><p>Fase proyek</p><span>4 dari 5 fase selesai</span></div>
              <div className={styles.phases}>
                <div className={styles.done}><b>01</b><span>Audit &amp;<br />arah</span></div>
                <div className={styles.done}><b>02</b><span>Strategi<br />konten</span></div>
                <div className={styles.done}><b>03</b><span>Produksi<br />konten</span></div>
                <div className={styles.now}><b>04</b><span>Optimasi &amp;<br />evaluasi</span></div>
                <div><b>05</b><span>Rencana<br />berikutnya</span></div>
              </div>
              <div className={styles.milestone}><span>FOKUS MINGGU INI</span><p>Finalisasi visual dan persetujuan kalender konten September.</p><b>30 Agu — 1 Sep</b></div>
            </div>
            <aside className={styles.review}><div><span className={styles.alert}>!</span><p className={styles.eyebrow}>MENUNGGU ANDA</p></div><h3>Kalender konten September siap ditinjau.</h3><p>Berikan persetujuan atau masukan agar tim dapat memulai produksi sesuai jadwal.</p><button>Tinjau sekarang <span>→</span></button></aside>
          </div>
        </section>

        <PortalTools />

        <section className={styles.lower}>
          <section className={styles.taskPanel}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>YANG SEDANG DIKERJAKAN</p><h2>Daftar pekerjaan</h2></div><button>Filter</button></div><div className={styles.taskList}>{tasks.map((task) => <article key={task.title}><span className={`${styles.state} ${task.state === "Menunggu Anda" ? styles.waiting : ""}`}>{task.state}</span><div><b>{task.title}</b><small>{task.owner}</small></div><time>{task.due}</time></article>)}</div></section>
          <section className={styles.activityPanel} id="aktivitas"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>JEJAK KERJA</p><h2>Aktivitas terbaru</h2></div></div><div className={styles.activityList}>{activities.map(([time, author, text], index) => <article key={text}><span className={index === 0 ? styles.fresh : ""} /><div><small>{time}</small><p><b>{author}</b> {text}</p></div></article>)}</div></section>
        </section>

        <section className={styles.documents} id="dokumen"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>ARSIP PROYEK</p><h2>Dokumen terbaru</h2></div><a href="#dokumen">Buka dokumen <span>→</span></a></div><div className={styles.documentGrid}>{documents.map(([name, meta]) => <article key={name}><span className={styles.fileMark}>↗</span><div><b>{name}</b><small>{meta}</small></div><button aria-label={`Buka ${name}`}>→</button></article>)}</div></section>

        <footer className={styles.footer}>Diksilab Client Area <span>•</span> Data proyek bersifat rahasia</footer>
      </main>
    </div>
  );
}

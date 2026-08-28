"use client";

import { ChangeEvent, useRef, useState } from "react";
import styles from "./PortalTools.module.css";

type PlannerTab = "content" | "seo" | "ads";

const calendarData: Record<PlannerTab, { title: string; helper: string; columns: Array<{ day: string; date: string; items: Array<{ tag: string; title: string; state: string }> }> }> = {
  content: { title: "Calendar Content — Instagram & LinkedIn", helper: "Rencana publikasi yang sedang berjalan pada cycle Agustus–September.", columns: [
    { day: "SEN", date: "31", items: [{ tag: "INSTAGRAM", title: "Mitos perawatan kulit", state: "Siap review" }] },
    { day: "SEL", date: "01", items: [{ tag: "LINKEDIN", title: "Sudut pandang dokter tentang trust", state: "Dalam produksi" }] },
    { day: "RAB", date: "02", items: [{ tag: "INSTAGRAM", title: "Reels: skin barrier", state: "Terjadwal" }, { tag: "STORY", title: "Polling mingguan", state: "Terjadwal" }] },
    { day: "KAM", date: "03", items: [{ tag: "LINKEDIN", title: "Poin edukasi untuk pasien", state: "Draft" }] },
    { day: "JUM", date: "04", items: [{ tag: "INSTAGRAM", title: "FAQ konsultasi", state: "Brief siap" }] },
  ] },
  seo: { title: "Calendar Article SEO", helper: "Artikel dan optimasi yang menjaga visibilitas organik tetap bergerak.", columns: [
    { day: "SEN", date: "31", items: [{ tag: "ARTIKEL", title: "Cara memilih sunscreen", state: "Outline siap" }] },
    { day: "SEL", date: "01", items: [{ tag: "SEO", title: "Riset keyword September", state: "Berjalan" }] },
    { day: "RAB", date: "02", items: [{ tag: "ARTIKEL", title: "Acne treatment: yang perlu diketahui", state: "Penulisan" }] },
    { day: "KAM", date: "03", items: [{ tag: "SEO", title: "Optimasi internal link", state: "Terjadwal" }] },
    { day: "JUM", date: "04", items: [{ tag: "ARTIKEL", title: "Panduan chemical peeling", state: "Brief siap" }] },
  ] },
  ads: { title: "Calendar Ads", helper: "Jadwal creative, evaluasi, dan optimasi untuk kampanye berbayar.", columns: [
    { day: "SEN", date: "31", items: [{ tag: "META ADS", title: "Refresh visual campaign", state: "Siap review" }] },
    { day: "SEL", date: "01", items: [{ tag: "OPTIMASI", title: "Review audience & placement", state: "Berjalan" }] },
    { day: "RAB", date: "02", items: [{ tag: "META ADS", title: "A/B copy consultation", state: "Terjadwal" }] },
    { day: "KAM", date: "03", items: [{ tag: "REPORT", title: "Mid-cycle spend review", state: "Terjadwal" }] },
    { day: "JUM", date: "04", items: [{ tag: "OPTIMASI", title: "Scale winning creative", state: "Brief siap" }] },
  ] },
};

export function PortalTools() {
  const [tab, setTab] = useState<PlannerTab>("content");
  const [files, setFiles] = useState<string[]>([]);
  const uploadInput = useRef<HTMLInputElement>(null);
  const data = calendarData[tab];
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).map((file) => file.name);
    setFiles((current) => [...current, ...selected].slice(0, 3));
    event.target.value = "";
  };
  return <>
    <section className={styles.cycle} aria-labelledby="cycle-title"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>RINGKASAN CYCLE 08</p><h2 id="cycle-title">Apa yang sudah bergerak</h2></div><span className={styles.cyclePeriod}>18 AGU — 06 SEP 2026</span></div><div className={styles.cycleGrid}><article><span className={styles.cycleNumber}>12</span><div><b>Output diselesaikan</b><p>5 post, 2 artikel SEO, 3 aset ads, dan 2 laporan.</p></div></article><article><span className={styles.cycleNumber}>08</span><div><b>Aktivitas tim</b><p>Strategi, produksi, penjadwalan, dan optimasi tercatat rapi.</p></div></article><article><span className={styles.cycleNumber}>02</span><div><b>Keputusan klien</b><p>Kalender September dan visual campaign masih perlu persetujuan.</p></div></article></div></section>
    <section className={styles.planner} aria-labelledby="planner-title"><div className={styles.plannerIntro}><div><p className={styles.eyebrow}>RENCANA KERJA MINGGU INI</p><h2 id="planner-title">Satu kalender untuk setiap channel.</h2></div><p>Pilih area kerja untuk melihat jadwal, status, dan hal yang perlu ditinjau pada cycle aktif.</p></div><div className={styles.tabList} role="tablist" aria-label="Jenis kalender"><button className={tab === "content" ? styles.tabActive : ""} onClick={() => setTab("content")} role="tab" aria-selected={tab === "content"}>Instagram &amp; LinkedIn</button><button className={tab === "seo" ? styles.tabActive : ""} onClick={() => setTab("seo")} role="tab" aria-selected={tab === "seo"}>Article SEO</button><button className={tab === "ads" ? styles.tabActive : ""} onClick={() => setTab("ads")} role="tab" aria-selected={tab === "ads"}>Ads</button></div><div className={styles.calendarPanel}><div className={styles.calendarHeader}><div><h3>{data.title}</h3><p>{data.helper}</p></div><button className={styles.exportButton}>Ekspor kalender ↗</button></div><div className={styles.calendarGrid}>{data.columns.map((column) => <article key={`${tab}-${column.date}`}><header><span>{column.day}</span><b>{column.date}</b></header>{column.items.map((item) => <div className={styles.calendarItem} key={item.title}><small>{item.tag}</small><b>{item.title}</b><span>{item.state}</span></div>)}</article>)}</div></div></section>
    <section className={styles.commerce} aria-label="Biaya dan upload aset"><article className={styles.spendCard}><p className={styles.eyebrow}>ADS — AUGUST 2026</p><h2>Amount spent</h2><div className={styles.spendAmount}>Rp 8.450.000</div><div className={styles.spendMeta}><span><b>Rp 10.000.000</b><small>Budget cycle</small></span><span><b>84,5%</b><small>Terserap</small></span><span><b>Rp 1.550.000</b><small>Sisa budget</small></span></div><div className={styles.spendTrack}><b /></div><p className={styles.spendNote}>Pengeluaran dalam jalur rencana. Review optimasi berikutnya: 3 September.</p></article><article className={styles.uploadCard}><p className={styles.eyebrow}>KIRIM MATERI KE TIM</p><h2>Upload aset proyek</h2><p className={styles.uploadIntro}>Referensi, foto, brief, atau dokumen persetujuan—semua tersimpan di ruang proyek yang sama.</p><input className={styles.fileInput} ref={uploadInput} type="file" multiple onChange={addFiles} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xlsx" /><button className={styles.uploadDrop} onClick={() => uploadInput.current?.click()}><span>↑</span><b>Pilih file untuk diunggah</b><small>PDF, DOCX, XLSX, JPG, PNG · maks. 25 MB</small></button>{files.length > 0 ? <div className={styles.selectedFiles}>{files.map((file) => <span key={file}>✓ {file}</span>)}</div> : null}</article></section>
  </>;
}

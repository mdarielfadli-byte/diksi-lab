"use client";
import { useState } from "react";

const questions = [
  ["Kejelasan brand", "Apakah pelanggan baru dapat memahami apa yang Anda lakukan dan untuk siapa Anda hadir dalam beberapa detik?", ["Belum", "Sudah cukup, tetapi belum konsisten", "Ya, langsung jelas"]],
  ["Kejelasan brand", "Apakah brand Anda memiliki alasan yang berbeda untuk dipilih dibanding alternatif lain?", ["Kami terdengar serupa", "Kami punya arah", "Jelas berbeda"]],
  ["Kejelasan brand", "Apakah identitas visual dan gaya komunikasi Anda konsisten di seluruh kanal?", ["Sering tidak selaras", "Sebagian sudah konsisten", "Konsisten dan mudah dikenali"]],
  ["Pengalaman", "Apakah kanal digital utama Anda memiliki satu langkah berikutnya yang jelas bagi pengunjung?", ["Belum ada jalur jelas", "Terlalu banyak pilihan", "Satu jalur yang terarah"]],
  ["Pengalaman", "Apakah pengunjung dapat dengan cepat menemukan bukti bahwa penawaran Anda berhasil?", ["Sulit ditemukan", "Ada beberapa bukti", "Bukti terlihat sejak awal"]],
  ["Pengalaman", "Apakah website atau profil Anda mudah digunakan melalui ponsel?", ["Perlu diperbaiki", "Berfungsi, tetapi masih ada hambatan", "Dirancang mobile-first"]],
  ["Konten", "Apakah Anda mengetahui tema konten yang terhubung dengan kebutuhan nyata audiens?", ["Masih menebak", "Sudah ada sinyal awal", "Memakai sistem konten yang jelas"]],
  ["Konten", "Apakah kanal Anda menyampaikan pesan utama yang sama secara konsisten?", ["Pesan sering berubah", "Sebagian besar selaras", "Sangat selaras"]],
  ["Konten", "Apakah Anda memiliki proses berulang untuk mengubah keahlian menjadi konten?", ["Belum", "Sesekali", "Ya, secara rutin"]],
  ["Mesin pertumbuhan", "Apakah Anda dapat melihat asal lead berkualitas atau konversi?", ["Belum diukur", "Laporan dasar", "Atribusi jelas"]],
  ["Mesin pertumbuhan", "Apakah Anda rutin menguji dan memperbaiki kampanye atau jalur konversi?", ["Jarang", "Kadang-kadang", "Menjadi rutinitas"]],
  ["Mesin pertumbuhan", "Apakah tim brand, konten, dan performa bekerja dari satu tujuan bersama?", ["Masih terpisah", "Sebagian terhubung", "Satu sistem yang terhubung"]],
] as const;

export function Audit({ expanded = false }: { expanded?: boolean }) {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState<number[]>([]); const [done, setDone] = useState(false);
  const [category, question, choices] = questions[step];
  function pick(value: number) { const next = [...answers, value]; setAnswers(next); if (step === questions.length - 1) setDone(true); else setStep(step + 1); }
  function reset() { setStep(0); setAnswers([]); setDone(false); }
  if (done) { const score = Math.round((answers.reduce((a,b)=>a+b,0) / (questions.length * 2)) * 100); const totals = ["Kejelasan brand", "Pengalaman", "Konten", "Mesin pertumbuhan"].map(pillar => ({ pillar, value: answers.reduce((sum, answer, index) => questions[index][0] === pillar ? sum + answer : sum, 0) })); const focus = totals.sort((a,b) => a.value - b.value)[0].pillar; return <div className={`audit-card result ${expanded ? "audit-expanded-result" : ""}`}><p className="eyebrow">KESIAPAN PERTUMBUHAN ANDA</p><div className="result-score">{score}<small>/100</small></div><h3>{score > 72 ? "Anda memiliki bekal kuat untuk membangun momentum." : score > 48 ? "Fondasi Anda sudah ada. Fokus yang tepat akan menggerakkannya." : "Ada peluang jelas untuk membangun fondasi yang lebih kuat."}</h3><p>Prioritas pertama Anda adalah <b>{focus}</b>. Skor ini membantu memulai percakapan yang tepat; ini bukan audit teknis atau audit data platform.</p>{expanded && <div className="audit-pillars">{totals.map(({pillar,value}) => <div key={pillar}><span>{pillar}</span><i><b style={{width:`${Math.round(value / 6 * 100)}%`}}/></i></div>)}</div>}<div className="audit-result-actions"><a href="/consultation" className="button dark">Diskusikan hasil ini →</a><button onClick={reset} className="reset">Ulangi penilaian</button></div></div>; }
  return <div className={`audit-card ${expanded ? "audit-expanded" : ""}`}><div className="audit-progress"><span>{String(step + 1).padStart(2,"0")} / 12</span><i><b style={{width:`${((step + 1) / questions.length) * 100}%`}} /></i></div><div className="audit-question-top"><p className="audit-category">{category}</p>{expanded && <small>Jawab berdasarkan kondisi saat ini, bukan kondisi ideal.</small>}</div><h3>{question}</h3><div className="answers">{choices.map((answer,index) => <button key={answer} onClick={() => pick(index)}><b>0{index + 1}</b>{answer}<span>→</span></button>)}</div>{step > 0 && <button className="audit-back" onClick={() => { setStep(step - 1); setAnswers(answers.slice(0,-1)); }}>← Pertanyaan sebelumnya</button>}</div>;
}

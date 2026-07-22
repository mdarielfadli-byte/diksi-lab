"use client";
import { useState } from "react";

const questions = [
  { category: "Brand clarity", question: "Seberapa jelas alasan pelanggan memilih bisnis Anda?", answers: ["Masih sulit dijelaskan", "Sudah ada, tetapi belum konsisten", "Jelas dan terasa berbeda"] },
  { category: "Digital presence", question: "Seberapa baik kanal digital Anda mengubah pengunjung menjadi leads?", answers: ["Belum punya alur yang jelas", "Ada, tetapi belum optimal", "Sudah dirancang untuk konversi"] },
  { category: "Growth engine", question: "Seberapa terukur aktivitas marketing Anda saat ini?", answers: ["Belum rutin diukur", "Ada data dasar", "Keputusan dipandu data"] },
];

export function Audit() {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState<number[]>([]); const [done, setDone] = useState(false);
  const q = questions[step];
  function pick(value: number) { const next = [...answers, value]; setAnswers(next); if (step === questions.length - 1) setDone(true); else setStep(step + 1); }
  if (done) { const score = Math.round((answers.reduce((a,b)=>a+b,0) / 6) * 100); const focus = questions[answers.indexOf(Math.min(...answers))]?.category ?? "Growth engine"; return <div className="audit-card result"><p className="eyebrow">YOUR SIGNAL</p><div className="result-score">{score}<small>/100</small></div><h3>{score > 65 ? "Anda siap membangun momentum." : "Ada ruang besar untuk tumbuh."}</h3><p>Fokus terdekat yang kami sarankan: <b>{focus}</b>. Bawa hasil ini ke sesi konsultasi agar kita bisa menyusun langkah paling relevan.</p><a href="/consultation" className="button dark">Diskusikan hasilnya <span>→</span></a><button onClick={()=>{setStep(0);setAnswers([]);setDone(false)}} className="reset">Ulangi audit</button></div>; }
  return <div className="audit-card"><div className="audit-progress"><span>{String(step+1).padStart(2,"0")} / 03</span><i><b style={{width:`${((step+1)/3)*100}%`}} /></i></div><p className="audit-category">{q.category}</p><h3>{q.question}</h3><div className="answers">{q.answers.map((answer,index)=><button key={answer} onClick={()=>pick(index)}><b>0{index+1}</b>{answer}<span>→</span></button>)}</div></div>;
}

"use client";
import { useState } from "react";

const questions = [
  ["Brand clarity", "Can a new customer understand what you do and who it is for in a few seconds?", ["Not yet", "Mostly, but inconsistent", "Yes, immediately clear"]],
  ["Brand clarity", "Does your brand have a distinct reason to be chosen over alternatives?", ["We sound similar", "We have a direction", "Clearly differentiated"]],
  ["Brand clarity", "Are your visual identity and tone consistent across channels?", ["Often disconnected", "Partially consistent", "Consistently recognisable"]],
  ["Experience", "Does your main digital channel have one clear next action for visitors?", ["No clear path", "Several competing actions", "One intentional path"]],
  ["Experience", "Can visitors quickly find proof that your offer works?", ["Proof is hard to find", "Some proof exists", "Proof is visible early"]],
  ["Experience", "Is your website or profile easy to use on a mobile phone?", ["Needs work", "Works, with friction", "Designed mobile-first"]],
  ["Content", "Do you know which content themes connect to your audience's real needs?", ["We are guessing", "We have early signals", "We use a clear content system"]],
  ["Content", "Do your channels consistently communicate the same key message?", ["Messages change often", "Mostly aligned", "Strongly aligned"]],
  ["Content", "Do you have a repeatable process for turning expertise into content?", ["Not yet", "Occasionally", "Yes, regularly"]],
  ["Growth engine", "Can you see where qualified leads or conversions are coming from?", ["Not measured", "Basic reporting", "Clear attribution"]],
  ["Growth engine", "Do you routinely test and improve your campaigns or conversion paths?", ["Rarely", "Sometimes", "Built into the routine"]],
  ["Growth engine", "Do brand, content, and performance teams work from one shared goal?", ["Working in silos", "Partly connected", "One connected system"]],
] as const;

export function Audit({ expanded=false }: { expanded?: boolean }) {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState<number[]>([]); const [done, setDone] = useState(false);
  const [category, question, choices] = questions[step];
  function pick(value: number) { const next = [...answers, value]; setAnswers(next); if (step === questions.length - 1) setDone(true); else setStep(step + 1); }
  function reset(){setStep(0);setAnswers([]);setDone(false)}
  if (done) { const score = Math.round((answers.reduce((a,b)=>a+b,0) / (questions.length*2)) * 100); const totals = ["Brand clarity","Experience","Content","Growth engine"].map(pillar=>({pillar,value:answers.reduce((sum,a,index)=>questions[index][0]===pillar?sum+a:sum,0)})); const focus=totals.sort((a,b)=>a.value-b.value)[0].pillar; return <div className={`audit-card result ${expanded?"audit-expanded-result":""}`}><p className="eyebrow">YOUR GROWTH READINESS</p><div className="result-score">{score}<small>/100</small></div><h3>{score > 72 ? "You have the ingredients for momentum." : score > 48 ? "Your foundation is in place. Focus will unlock it." : "There is a clear opportunity to build the foundation."}</h3><p>Your first priority is <b>{focus}</b>. This score helps start the right conversation; it is not a technical or platform-data audit.</p>{expanded&&<div className="audit-pillars">{totals.map(({pillar,value})=><div key={pillar}><span>{pillar}</span><i><b style={{width:`${Math.round(value/6*100)}%`}}/></i></div>)}</div>}<div className="audit-result-actions"><a href="/consultation" className="button dark">Discuss this result -&gt;</a><button onClick={reset} className="reset">Restart assessment</button></div></div>; }
  return <div className={`audit-card ${expanded?"audit-expanded":""}`}><div className="audit-progress"><span>{String(step+1).padStart(2,"0")} / 12</span><i><b style={{width:`${((step+1)/questions.length)*100}%`}} /></i></div><div className="audit-question-top"><p className="audit-category">{category}</p>{expanded&&<small>Answer based on your current reality, not your ideal state.</small>}</div><h3>{question}</h3><div className="answers">{choices.map((answer,index)=><button key={answer} onClick={()=>pick(index)}><b>0{index+1}</b>{answer}<span>-&gt;</span></button>)}</div>{step>0&&<button className="audit-back" onClick={()=>{setStep(step-1);setAnswers(answers.slice(0,-1))}}>&lt;- Previous question</button>}</div>;
}

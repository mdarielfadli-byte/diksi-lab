import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
const works=[
  ["Alpha Trade","Mobile product design | 2024","A clearer mobile trading experience, designed to help users make confident decisions.","trade"],
  ["Alpha Fund","App and website design | 2023","A connected investment journey across a responsive website and mobile product.","fund"],
  ["Sesama.care","Health platform UI/UX | 2023","A warmer, more accessible health companion for everyday wellbeing.","care"],
  ["TPFX","Digital product design | 2024","A trading platform experience for fast discovery, action, and clarity.","tpf"],
  ["iSeller","E-commerce experience | 2022","A streamlined operating system for small businesses selling across channels.","seller"],
  ["BCA x WE+","Landing page and dashboard | 2022","A document workflow designed for visibility, speed, and collaboration.","bca"],
];
export default function Works(){return <SiteShell><section className="inner-hero compact"><div className="wrap"><p className="eyebrow">SELECTED WORK</p><h1>Good work should feel<br/>impossible to <i>ignore.</i></h1><p>A selection of product, brand, and digital experiences. Replace or expand each story with approved case-study details.</p></div></section><section className="wrap section"><div className="work-grid">{works.map(([title,meta,copy,theme])=><article className="work-card" key={title}><div className={`work-visual ${theme}`}><div className="work-screen"><span>{title}</span><b></b><i></i><em></em></div><div className="work-phone"><b></b><i></i><em></em></div></div><h2>{title}</h2><p className="work-meta">{meta}</p><p>{copy}</p><Link href="/consultation" className="text-link">Start a similar project -&gt;</Link></article>)}</div></section></SiteShell>}

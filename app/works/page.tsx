import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";

const works = [
  { title: "Alpha Trade", year: "2024", type: "Mobile Product", scope: "UI/UX Design", description: "A clearer mobile trading experience designed to help users make confident decisions.", image: "/works/Alpha-Trade.webp" },
  { title: "TPFX", year: "2024", type: "Trading Platform", scope: "UI/UX Design", description: "A trading platform experience for faster discovery, action, and clarity.", image: "/works/TPFX.webp" },
  { title: "Alpha Fund", year: "2023", type: "App + Website", scope: "Digital Product", description: "A connected investment journey across a responsive website and mobile product.", image: "/works/Alpha-Fund.webp" },
  { title: "Sesama.care", year: "2023", type: "Health Platform", scope: "UI/UX Design", description: "A warmer, more accessible health companion for everyday wellbeing.", image: "/works/Sesama-Care.webp" },
  { title: "iSeller", year: "2022", type: "E-commerce", scope: "Product Experience", description: "A streamlined operating system for small businesses selling across channels.", image: "/works/Iseller.webp" },
  { title: "BCA x WE+", year: "2022", type: "Dashboard", scope: "Landing Page + UI/UX", description: "A document workflow designed for visibility, speed, and collaboration.", image: "/works/BCA-Doc-System.webp" },
  { title: "CarNeeds", year: "2022", type: "Mobile Service", scope: "UI/UX Design", description: "A service-booking journey for more accessible everyday automotive care.", image: "/works/CarNeeds.webp" },
  { title: "WE+", year: "2022", type: "Insurance Tech", scope: "UI/UX Design", description: "A digital insurance experience that makes complex services feel more human.", image: "/works/WE+.webp" },
];

export default function Works() {
  return <SiteShell>
    <section className="inner-hero compact works-hero"><div className="wrap"><p className="eyebrow">SELECTED WORK</p><h1>Good work should feel<br/>impossible to <i>ignore.</i></h1><p>A curated selection of product, brand, and digital experiences across finance, health, retail, and technology.</p></div></section>
    <section className="wrap works-showcase"><div className="works-index"><span>SELECTED CLIENTS / PROJECTS</span><span>08 CASES</span></div><div className="works-grid-refined">{works.map((work, index) => <article className="work-card-refined" key={work.title}><div className="work-card-media"><Image src={work.image} alt={`${work.title} project preview`} fill sizes="(max-width: 800px) 100vw, 50vw" priority={index < 2}/><span>{String(index + 1).padStart(2, "0")}</span></div><div className="work-card-content"><div className="work-card-topline"><p>{work.type}</p><p>{work.year}</p></div><h2>{work.title}</h2><p className="work-scope">{work.scope}</p><p className="work-description">{work.description}</p><Link href="/consultation" className="text-link">Start a similar project <span>-&gt;</span></Link></div></article>)}</div></section>
  </SiteShell>;
}

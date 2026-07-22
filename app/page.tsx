import Link from "next/link";
import { Audit } from "./components/Audit";
import { SiteShell } from "./components/SiteShell";

const services = [
  ["01", "Brand Strategy", "Positioning, brand story, identity system, dan messaging yang membuat bisnis mudah diingat."],
  ["02", "Digital Experience", "Website, landing page, UI/UX, hingga aplikasi yang terasa baik sekaligus bekerja keras."],
  ["03", "Growth Engine", "SEO, paid ads, content, dan funnel yang mengubah perhatian menjadi pertumbuhan yang terukur."],
];

export default function Home() {
  return <SiteShell>
    <section className="hero">
      <div className="orb orb-one" /><div className="orb orb-two" />
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow light">STRATEGY × DIGITAL EXECUTION</p>
          <h1>Bangun brand.<br /><i>Gerakkan</i> bisnis.</h1>
          <p className="hero-copy">Kami menyatukan kejernihan strategi brand dengan eksekusi digital yang tajam—agar bisnis Anda bukan hanya hadir, tetapi bertumbuh.</p>
          <div className="button-row"><Link className="button gold" href="/consultation">Mulai percakapan <span>→</span></Link><a className="button ghost" href="#audit">Cek kesiapan bisnis</a></div>
          <div className="hero-notes"><span>Brand-led</span><span>Human-first</span><span>Result-minded</span></div>
        </div>
        <div className="signal-card">
          <div className="signal-top"><span>GROWTH SIGNAL</span><b>Live</b></div>
          <div className="signal-score"><strong>72</strong><small>readiness score</small></div>
          <div className="meter"><span>Brand clarity</span><i><b style={{width:"78%"}} /></i></div>
          <div className="meter"><span>Digital presence</span><i><b style={{width:"62%"}} /></i></div>
          <div className="meter"><span>Growth engine</span><i><b style={{width:"45%"}} /></i></div>
          <p>Mulai dari insight yang jelas, lalu tumbuh dengan langkah yang tepat.</p>
        </div>
      </div>
    </section>

    <section className="intro wrap section">
      <div><p className="eyebrow">THE COLLECTIVE</p><h2>Satu partner untuk fondasi yang kuat dan momentum yang nyata.</h2></div>
      <p className="large-copy">BangunBrandmu membawa perspektif brand yang lebih manusiawi. Dotte Digital menghadirkan tim spesialis untuk mewujudkannya di dunia digital. Bersama, kami merancang langkah yang relevan untuk tahap bisnis Anda.</p>
    </section>

    <section className="service-band"><div className="wrap"><p className="eyebrow light">WHAT WE BUILD</p><div className="service-grid">{services.map(([no,title,text])=><article className="service-tease" key={no}><small>{no}</small><h3>{title}</h3><p>{text}</p><Link href="/services">Explore <span>↗</span></Link></article>)}</div></div></section>

    <section id="audit" className="audit-section"><div className="wrap"><div className="audit-intro"><p className="eyebrow">INTERACTIVE AUDIT</p><h2>Sebelum melangkah lebih jauh, mari lihat posisi Anda hari ini.</h2><p>Audit singkat ini membantu memetakan kekuatan dan fokus paling bernilai untuk brand, digital presence, dan growth Anda.</p></div><Audit /></div></section>

    <section className="quote-section"><div className="wrap"><p className="eyebrow light">OUR BELIEF</p><blockquote>“Langkah kecil yang tepat bisa membawa bisnis menuju mimpi yang lebih besar.”</blockquote><Link href="/vision" className="text-link">Kenal cara kami berpikir <span>→</span></Link></div></section>
  </SiteShell>;
}

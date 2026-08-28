import Link from "next/link";
import "./story.css";

const pillars = [
  {
    label: "Promise",
    title: "Membangun budaya membaca yang terasa dekat.",
    body: "Ide yang baik menjadi berarti ketika hadir sebagai kebiasaan kecil yang bisa dilakukan di rumah, sekolah, dan komunitas.",
  },
  {
    label: "Perspective",
    title: "Melihat belajar sebagai ruang untuk bertumbuh.",
    body: "Dr Santi menghubungkan literasi, pengasuhan, kepemimpinan, dan pembelajaran sepanjang hayat melalui cerita yang berakar pada kehidupan nyata.",
  },
  {
    label: "Action",
    title: "Mengubah percakapan menjadi ritual.",
    body: "Mulai dari pilihan buku, pertanyaan yang lebih baik, hingga langkah praktis yang dapat dicoba setelah sesi selesai.",
  },
];

const packages = [
  ["Essential", "Titik mulai", "Untuk percakapan yang membuka pintu pada budaya membaca."],
  ["Signature", "Ritual yang lebih dalam", "Untuk sekolah dan komunitas yang ingin membangun sistem kebiasaan."],
  ["Premium", "Pengalaman yang dirancang", "Untuk kebutuhan khusus dengan konteks, pendampingan, dan tindak lanjut yang lebih personal."],
];

export default function DrSantiStoryPage() {
  return (
    <main className="santi-site">
      <header className="santi-nav">
        <Link href="/dr-santi-story" className="santi-wordmark">Dr Santi&apos;s <span>Story</span><b>✳</b></Link>
        <nav aria-label="Navigasi utama">
          <a href="#perspective">Perspective</a>
          <a href="#offers">Programs</a>
          <a href="#inquiry">Inquiry</a>
        </nav>
        <a className="santi-nav-cta" href="#inquiry">Invite Dr Santi <span>↗</span></a>
      </header>

      <section className="santi-hero">
        <div className="santi-hero-copy">
          <p className="santi-kicker">Reading · leadership · lifelong learning</p>
          <h1>A brand for <em>shared attention.</em></h1>
          <p className="santi-lede">Dr Santi&apos;s Story adalah ruang untuk membaca, belajar, dan bertumbuh bersama—dengan ide yang hangat, kredibel, dan dapat dipraktikkan.</p>
          <div className="santi-actions">
            <a className="santi-button primary" href="#inquiry">Invite Dr Santi <span>↗</span></a>
            <a className="santi-button text" href="#perspective">Explore the story <span>↓</span></a>
          </div>
        </div>
        <div className="reading-room" aria-label="Ilustrasi reading room">
          <div className="room-sun" />
          <div className="room-shelf"><i /><i /><i /><i /><i /></div>
          <div className="room-chair"><div className="chair-back" /><div className="chair-seat" /><div className="chair-leg left" /><div className="chair-leg right" /></div>
          <div className="room-book"><b>STORY</b><small>notes for<br />a life of<br />learning</small></div>
          <span className="room-star">✳</span>
          <p className="room-caption">A welcoming reading room<br />for better questions.</p>
        </div>
      </section>

      <section className="santi-intro" id="perspective">
        <div className="section-heading"><p className="santi-kicker">The starting point</p><h2>Belajar bukan hanya tentang isi buku. <em>Ia tentang apa yang berubah setelahnya.</em></h2></div>
        <div className="pillar-grid">
          {pillars.map((pillar, index) => <article className="pillar" key={pillar.label}><span className="pillar-number">0{index + 1}</span><p className="santi-kicker">{pillar.label}</p><h3>{pillar.title}</h3><p>{pillar.body}</p></article>)}
        </div>
      </section>

      <section className="santi-feature">
        <div><p className="santi-kicker light">A practical point of view</p><h2>Ide yang bisa dibawa pulang, bukan hanya <em>didengar.</em></h2></div>
        <div className="feature-note"><span>✳</span><p>“Kita tidak sedang mengejar lebih banyak informasi. Kita sedang menciptakan lebih banyak ruang untuk memperhatikan.”</p><small>— Dr Santi</small></div>
      </section>

      <section className="santi-programs" id="offers">
        <div className="section-heading split"><div><p className="santi-kicker">Programs & conversations</p><h2>Satu janji.<br /><em>Tiga kedalaman.</em></h2></div><p>Setiap pengalaman dirancang sesuai kebutuhan audiens—dari percakapan awal hingga ritual belajar yang berkelanjutan.</p></div>
        <div className="package-grid">
          {packages.map(([name, sub, body], index) => <article className={`package-card package-${index + 1}`} key={name}><div className="package-top"><span>0{index + 1}</span><span>{index === 1 ? "Recommended" : ""}</span></div><h3>{name}</h3><p className="package-sub">{sub}</p><p>{body}</p><a href="#inquiry">Find the fit <span>↗</span></a></article>)}
        </div>
      </section>

      <section className="santi-proof">
        <div className="proof-copy"><p className="santi-kicker">For schools, parents & communities</p><h2>Ruang yang membuat <em>rasa ingin tahu</em> terasa mungkin.</h2><p>Untuk seminar, workshop, percakapan orang tua, dan kolaborasi yang ingin meninggalkan sesuatu setelah lampu dimatikan.</p><a className="santi-button dark" href="#inquiry">Start a reading conversation <span>↗</span></a></div>
        <div className="proof-list"><div><span>01</span><p>Reading rituals<br /><small>15-minute practices for home</small></p></div><div><span>02</span><p>Parent confidence<br /><small>Make reading feel natural</small></p></div><div><span>03</span><p>Learning leadership<br /><small>Build cultures of curiosity</small></p></div></div>
      </section>

      <section className="santi-inquiry" id="inquiry">
        <div className="inquiry-copy"><p className="santi-kicker light">The next conversation</p><h2>Tell us what you are trying to <em>make possible.</em></h2><p>Bagikan konteks singkat. Kami akan membantu menemukan format percakapan yang paling tepat.</p></div>
        <form className="inquiry-form"><label>Nama / organisasi<input name="name" placeholder="Nama Anda" /></label><label>Email atau WhatsApp<input name="contact" placeholder="Cara terbaik untuk menghubungi" /></label><label>Yang ingin dibicarakan<textarea name="message" rows={4} placeholder="Seminar, workshop, kolaborasi, atau lainnya" /></label><button className="santi-button primary" type="submit">Send inquiry <span>↗</span></button><small>Form ini adalah tampilan awal. Integrasi email/CRM dapat ditambahkan setelah alur lead disepakati.</small></form>
      </section>

      <footer className="santi-footer"><Link href="/dr-santi-story" className="santi-wordmark">Dr Santi&apos;s <span>Story</span><b>✳</b></Link><p>Warm. Curious. Caring. Credible. Practical.</p><small>© 2026 Dr Santi&apos;s Story</small></footer>
    </main>
  );
}

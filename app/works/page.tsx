import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";

const works = [
  { title: "Alpha Trade", year: "2024", type: "Produk Mobile", scope: "Desain UI/UX", description: "Pengalaman trading mobile yang lebih jelas untuk membantu pengguna mengambil keputusan dengan percaya diri.", image: "/works/Alpha-Trade.webp" },
  { title: "TPFX", year: "2024", type: "Platform Trading", scope: "Desain UI/UX", description: "Pengalaman platform trading untuk penemuan informasi, aksi, dan kejelasan yang lebih cepat.", image: "/works/TPFX.webp" },
  { title: "Alpha Fund", year: "2023", type: "Aplikasi + Website", scope: "Produk Digital", description: "Perjalanan investasi yang terhubung melalui website responsif dan produk mobile.", image: "/works/Alpha-Fund.webp" },
  { title: "Sesama.care", year: "2023", type: "Platform Kesehatan", scope: "Desain UI/UX", description: "Pendamping kesehatan yang lebih hangat dan mudah diakses untuk keseharian pengguna.", image: "/works/Sesama-Care.webp" },
  { title: "iSeller", year: "2022", type: "E-commerce", scope: "Pengalaman Produk", description: "Sistem operasional ringkas untuk bisnis kecil yang berjualan di berbagai kanal.", image: "/works/Iseller.webp" },
  { title: "BCA x WE+", year: "2022", type: "Dasbor", scope: "Landing Page + UI/UX", description: "Alur kerja dokumen yang dirancang untuk visibilitas, kecepatan, dan kolaborasi.", image: "/works/BCA-Doc-System.webp" },
  { title: "CarNeeds", year: "2022", type: "Layanan Mobile", scope: "Desain UI/UX", description: "Perjalanan pemesanan layanan untuk perawatan otomotif sehari-hari yang lebih mudah diakses.", image: "/works/CarNeeds.webp" },
  { title: "WE+", year: "2022", type: "Teknologi Asuransi", scope: "Desain UI/UX", description: "Pengalaman asuransi digital yang membuat layanan kompleks terasa lebih manusiawi.", image: "/works/WE+.webp" },
];

export default function Works() {
  return <SiteShell>
    <section className="inner-hero compact works-hero"><div className="wrap"><p className="eyebrow">KARYA PILIHAN</p><h1>Karya yang baik harus<br/>sulit untuk <i>diabaikan.</i></h1><p>Pilihan karya produk, brand, dan pengalaman digital di sektor finansial, kesehatan, retail, dan teknologi.</p></div></section>
    <section className="wrap works-showcase"><div className="works-index"><span>KLIEN / PROYEK PILIHAN</span><span>08 KASUS</span></div><div className="works-grid-refined">{works.map((work, index) => <article className="work-card-refined" key={work.title}><div className="work-card-media"><Image src={work.image} alt={`Pratinjau proyek ${work.title}`} fill sizes="(max-width: 800px) 100vw, 50vw" priority={index < 2}/><span>{String(index + 1).padStart(2, "0")}</span></div><div className="work-card-content"><div className="work-card-topline"><p>{work.type}</p><p>{work.year}</p></div><h2>{work.title}</h2><p className="work-scope">{work.scope}</p><p className="work-description">{work.description}</p><Link href="/consultation" className="text-link">Mulai proyek serupa <span>→</span></Link></div></article>)}</div></section>
  </SiteShell>;
}

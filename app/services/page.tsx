"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteShell } from "../components/SiteShell";

type Plan = {
  name: string;
  title: string;
  summary: string;
  forWho: string;
  includes: string[];
};

type Service = {
  name: string;
  eyebrow: string;
  intro: string;
  description: string;
  bullets: string[];
  plans: Plan[];
};

const services: Service[] = [
  {
    name: "UI/UX & Web",
    eyebrow: "01 / PENGALAMAN DIGITAL",
    intro: "Website dan produk digital yang terasa jelas, cepat, dan meyakinkan.",
    description:
      "Kami menyatukan strategi, desain pengalaman pengguna, dan pengembangan website agar setiap kunjungan bergerak lebih dekat ke tujuan bisnis Anda—dari membangun kredibilitas hingga menghasilkan leads.",
    bullets: [
      "Riset UX, perjalanan pelanggan, wireframe, dan purwarupa interaktif",
      "Landing page, profil perusahaan, e-commerce, hingga website kustom",
      "Pengembangan responsif, CMS siap pakai, analitik, dan fondasi SEO",
      "Sistem desain yang membuat pengalaman digital konsisten saat bisnis bertumbuh",
    ],
    plans: [
      {
        name: "Dasar",
        title: "Fondasi Peluncuran",
        summary: "Fondasi digital yang rapi untuk memperkenalkan bisnis dan mengubah perhatian menjadi percakapan.",
        forWho: "Ideal untuk bisnis baru, kampanye, atau layanan dengan satu fokus utama.",
        includes: [
          "Arah visual, wireframe, dan UI dasar di Figma",
          "Landing page atau website profil perusahaan ringkas",
          "Pengembangan responsif dengan CMS yang mudah dikelola",
          "SEO on-page dasar, sitemap, dan pengaturan analitik",
          "Dua putaran revisi dan serah-terima yang jelas",
        ],
      },
      {
        name: "Menengah",
        title: "Website Bertumbuh",
        summary: "Website multi-halaman yang dibangun dari kebutuhan pengguna, pesan brand, dan target konversi.",
        forWho: "Ideal untuk bisnis yang siap menguatkan kredibilitas dan alur perolehan lead.",
        includes: [
          "Discovery UX, struktur situs, dan arah konten",
          "UI high-fidelity serta purwarupa untuk alur utama",
          "Website multi-halaman dengan sistem komponen",
          "Optimasi performa, Google Analytics, Search Console, dan SEO dasar",
          "Empat putaran revisi serta dokumentasi serah-terima",
        ],
      },
      {
        name: "Lanjutan",
        title: "Platform Digital",
        summary: "Pengalaman digital menyeluruh untuk platform, e-commerce, atau website custom yang kompleks.",
        forWho: "Ideal untuk bisnis dengan banyak layanan, user flow, atau kebutuhan integrasi khusus.",
        includes: [
          "Riset mendalam: persona, kompetitor, dan peta peluang",
          "UX/UI menyeluruh, purwarupa interaktif, dan masukan usability",
          "Website 13+ halaman, e-commerce, atau alur kerja kustom",
          "Fondasi SEO teknis, mobile, kecepatan, dan lokal",
          "Pelatihan CMS, dokumentasi, serta enam putaran revisi",
        ],
      },
    ],
  },
  {
    name: "Performance Marketing",
    eyebrow: "02 / PEMASARAN BERBASIS PERFORMA",
    intro: "Kampanye yang menyambungkan pesan, media, dan momentum pertumbuhan.",
    description:
      "Kami membantu bisnis menjangkau audiens yang tepat melalui strategi media yang terukur—bukan sekadar menyalakan iklan. Setiap campaign disusun untuk belajar, mengoptimalkan, dan meningkatkan kualitas hasilnya dari waktu ke waktu.",
    bullets: [
      "Strategi kampanye, funnel, riset audiens, dan perencanaan kanal",
      "Meta Ads, Google Ads, TikTok Ads, serta arah kreatif dan copy",
      "Perolehan lead, retargeting, remarketing, dan optimasi konversi",
      "Pemantauan transparan, eksperimen terstruktur, serta laporan berkala",
    ],
    plans: [
      {
        name: "Dasar",
        title: "Awal Kampanye",
        summary: "Memulai kampanye berbayar dengan fondasi targeting, pesan, dan pengukuran yang tepat.",
        forWho: "Ideal untuk validasi channel atau meluncurkan campaign pertama.",
        includes: [
          "Setup dan optimasi satu platform iklan",
          "Riset kata kunci atau audiens serta arah pesan kampanye",
          "Dua konsep iklan kreatif untuk pengujian awal",
          "Pelacakan dasar dan rekomendasi alokasi media",
          "Laporan performa bulanan dengan langkah berikutnya",
        ],
      },
      {
        name: "Menengah",
        title: "Kampanye Bertumbuh",
        summary: "Menghubungkan beberapa kanal dan pengujian kreatif untuk menemukan kombinasi paling efektif.",
        forWho: "Ideal untuk bisnis yang sudah memiliki offer dan ingin mengakselerasi leads atau penjualan.",
        includes: [
          "Setup hingga dua platform iklan yang relevan",
          "Riset audiens, funnel, dan eksperimen A/B testing",
          "Empat variasi iklan kreatif dan arah copy",
          "Retargeting serta rekomendasi anggaran berbasis performa",
          "Laporan mingguan yang ringkas dan dapat ditindaklanjuti",
        ],
      },
      {
        name: "Lanjutan",
        title: "Perluasan Skala",
        summary: "Mesin performance marketing lintas channel untuk menjaga pertumbuhan sambil meningkatkan efisiensi.",
        forWho: "Ideal untuk brand yang ingin memperluas jangkauan tanpa kehilangan kontrol atas kualitas lead.",
        includes: [
          "Orkestrasi hingga tiga platform iklan",
          "Strategi funnel, segmentasi audiens, dan rencana lokalisasi",
          "Enam variasi iklan kreatif dan kerangka iterasi",
          "Retargeting, tinjauan kualitas lead, dan rekomendasi skala",
          "Laporan mingguan serta sesi konsultasi strategi",
        ],
      },
    ],
  },
  {
    name: "SEO",
    eyebrow: "03 / PERTUMBUHAN ORGANIK",
    intro: "Visibilitas organik yang dibangun dari apa yang benar-benar dicari audiens Anda.",
    description:
      "SEO kami tidak berhenti pada ranking. Kami memetakan peluang pencarian, memperbaiki fondasi teknis, dan membangun konten yang membantu calon pelanggan menemukan alasan untuk memilih Anda.",
    bullets: [
      "Audit SEO: teknis, on-page, off-page, dan peluang konten",
      "Riset kata kunci, strategi konten, dan optimasi halaman prioritas",
      "SEO teknis, kecepatan halaman, schema markup, serta SEO lokal",
      "Produksi konten, penguatan otoritas, laporan, dan peta jalan optimasi",
    ],
    plans: [
      {
        name: "Dasar",
        title: "Fondasi SEO",
        summary: "Merapikan hal penting terlebih dahulu agar website punya pijakan kuat untuk bertumbuh di search.",
        forWho: "Ideal untuk website yang baru diluncurkan atau belum pernah diaudit secara menyeluruh.",
        includes: [
          "Audit dasar teknis, on-page, dan off-page",
          "Riset kata kunci serta peta prioritas konten",
          "Optimasi hingga lima halaman prioritas",
          "Pengaturan atau pengecekan Search Console dan Analytics",
          "Laporan bulanan serta rekomendasi prioritas berikutnya",
        ],
      },
      {
        name: "Menengah",
        title: "Momentum SEO",
        summary: "Program optimasi berkelanjutan untuk meningkatkan relevansi konten dan peluang traffic berkualitas.",
        forWho: "Ideal untuk bisnis yang ingin membangun discovery organik secara konsisten.",
        includes: [
          "Audit lengkap dan peta jalan SEO per kuartal",
          "Optimasi hingga 10 halaman dan Google Business Profile",
          "Brief konten atau dua artikel siap SEO per bulan",
          "Rencana penguatan otoritas dengan tinjauan kualitas link",
          "Tinjauan performa bulanan dan rekomendasi strategi",
        ],
      },
      {
        name: "Lanjutan",
        title: "Pertumbuhan Organik",
        summary: "SEO terintegrasi untuk website berskala besar yang perlu memimpin kategori dan menangkap permintaan.",
        forWho: "Ideal untuk bisnis dengan kategori kompetitif, banyak halaman, atau target ekspansi.",
        includes: [
          "Manajemen SEO menyeluruh dan klaster kata kunci lanjutan",
          "Optimasi SEO teknis, mobile, kecepatan, schema, dan lokal",
          "Optimasi halaman prioritas secara berkelanjutan",
          "Mesin konten hingga empat artikel siap SEO per bulan",
          "Laporan mingguan dan sesi konsultasi strategi",
        ],
      },
    ],
  },
  {
    name: "Brand & Rebranding",
    eyebrow: "04 / SISTEM BRAND",
    intro: "Identitas yang memberi bisnis Anda arah, pembeda, dan rasa percaya diri untuk tumbuh.",
    description:
      "Kami mengubah strategi brand menjadi sistem yang bisa dipakai—mulai dari positioning dan narasi hingga identitas visual yang konsisten di setiap titik interaksi. Bukan hanya terlihat bagus, tetapi lebih mudah dikenali dan dipilih.",
    bullets: [
      "Positioning brand, insight audiens, sudut pandang kompetitor, dan diferensiasi",
      "Suara brand, pesan utama, tagline, cerita, serta identitas verbal",
      "Logo, sistem visual, warna, tipografi, dan panduan brand praktis",
      "Aset sosial, materi pemasaran, arah website, dan peluncuran brand",
    ],
    plans: [
      {
        name: "Dasar",
        title: "Kejelasan Brand",
        summary: "Membuat identitas inti yang lebih rapi dan siap dipakai dengan cepat di kanal sehari-hari.",
        forWho: "Ideal untuk brand baru atau bisnis yang membutuhkan penyegaran identitas.",
        includes: [
          "Desain logo atau penyegaran logo",
          "Palet warna, tipografi, dan panduan brand dasar",
          "Aset stationery dan profil media sosial",
          "Arah visual untuk komunikasi awal",
          "Sesi konsultasi strategi branding",
        ],
      },
      {
        name: "Menengah",
        title: "Identitas Brand",
        summary: "Strategi dan identitas yang menyatukan cara brand berbicara, terlihat, dan muncul di pasar.",
        forWho: "Ideal untuk bisnis yang ingin memperjelas positioning sebelum memperluas komunikasinya.",
        includes: [
          "Positioning, USP, dan diferensiasi brand",
          "Nada komunikasi, pesan utama, tagline, misi, dan visi",
          "Identitas visual dan template media sosial",
          "Mini brand book serta paket aset yang siap digunakan",
          "Arah desain landing page atau profil perusahaan",
        ],
      },
      {
        name: "Lanjutan",
        title: "Transformasi Brand",
        summary: "Sistem brand komprehensif untuk menyatukan strategi bisnis, pengalaman digital, dan eksekusi tim.",
        forWho: "Ideal untuk rebranding menyeluruh, ekspansi, atau organisasi dengan banyak touchpoint.",
        includes: [
          "Persona pelanggan, riset kompetitor, dan strategi brand",
          "Cerita brand, narasi, strategi konten, dan kerangka komunikasi",
          "Brand book lengkap dengan sistem visual yang skalabel",
          "Materi pemasaran dan arah pembaruan website",
          "Pelatihan brand internal serta workshop bersama tim",
        ],
      },
    ],
  },
];

export default function Services() {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <SiteShell>
      <section className="inner-hero compact">
        <div className="wrap">
          <p className="eyebrow">LAYANAN</p>
          <h1>
            Satu partner untuk<br />
            <i>gambaran digital menyeluruh.</i>
          </h1>
          <p>Untuk UMKM dan startup, mulai dari satu kebutuhan paling mendesak atau rangkai beberapa disiplin menjadi sistem pertumbuhan yang saling menguatkan.</p>
        </div>
      </section>

      <section className="wrap section service-explorer" aria-labelledby="service-explorer-title">
        <div className="service-tabs" role="tablist" aria-label="Pilih layanan">
          {services.map((item, index) => (
            <button
              key={item.name}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
              role="tab"
              aria-selected={index === active}
              aria-controls={`service-panel-${index}`}
              id={`service-tab-${index}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="service-detail" id={`service-panel-${active}`} role="tabpanel" aria-labelledby={`service-tab-${active}`}>
          <div className="service-overview">
            <p className="eyebrow">{service.eyebrow}</p>
            <h2 id="service-explorer-title">{service.intro}</h2>
            <p className="service-description">{service.description}</p>
            <p className="service-scope-label">Yang kami bentuk</p>
            <ul>
              {service.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>

          <div className="package-grid" aria-label={`Pilihan paket ${service.name}`}>
            {service.plans.map((plan, index) => (
              <article key={plan.name} className={index === 1 ? "featured" : ""}>
                <p className="plan-name">{plan.name}</p>
                <h3>{plan.title}</h3>
                <span className="plan-summary">{plan.summary}</span>
                <p className="plan-fit">{plan.forWho}</p>
                <ul className="package-includes">
                  {plan.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={`/consultation?service=${encodeURIComponent(service.name)}&package=${plan.name}`}>
                  Diskusikan paket ini <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <p className="service-note">Setiap paket adalah titik awal. Lingkup akhir, jadwal, dan prioritas akan kami susun setelah memahami konteks bisnis, target, dan kesiapan aset Anda.</p>
      </section>

      <section className="wrap section engagement-section">
        <div className="engagement-heading">
          <p className="eyebrow">PAKET PENDAMPINGAN</p>
          <h2>Mulai sesuai fase bisnis, lalu bertumbuh dengan ritme yang tepat.</h2>
          <p>Foundation, Growth, dan Scale adalah cara kami menyusun kerja sama lintas layanan. Bukan harga baku, melainkan titik awal untuk memilih fokus dan tingkat keterlibatan yang paling relevan.</p>
        </div>
        <div className="engagement-grid">
          <article><p className="eyebrow">01 / FOUNDATION</p><h3>Rapikan fondasi.</h3><p>Untuk bisnis yang butuh kejelasan arah, pesan, dan aset inti sebelum melangkah lebih jauh.</p></article>
          <article><p className="eyebrow">02 / GROWTH</p><h3>Sambungkan mesin tumbuh.</h3><p>Untuk bisnis yang siap menyatukan website, SEO, dan performance marketing menjadi perjalanan yang lebih terukur.</p></article>
          <article><p className="eyebrow">03 / SCALE</p><h3>Perluas dengan terarah.</h3><p>Untuk brand yang ingin memperkuat sistem, eksperimen, dan eksekusi lintas kanal tanpa kehilangan fokus.</p></article>
        </div>
      </section>

      <section className="callout">
        <div className="wrap">
          <p className="eyebrow light">KHUSUS, BUKAN TEMPLATE</p>
          <h2>Butuh kombinasi layanan yang dibangun untuk target bisnis Anda?</h2>
          <Link href="/consultation" className="button gold">Rancang lingkup bersama →</Link>
        </div>
      </section>
    </SiteShell>
  );
}

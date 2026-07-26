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
    eyebrow: "01 / DIGITAL EXPERIENCE",
    intro: "Website dan produk digital yang terasa jelas, cepat, dan meyakinkan.",
    description:
      "Kami menyatukan strategi, desain pengalaman pengguna, dan pengembangan website agar setiap kunjungan bergerak lebih dekat ke tujuan bisnis Anda—dari membangun kredibilitas hingga menghasilkan leads.",
    bullets: [
      "UX research, customer journey, wireframe, dan prototype interaktif",
      "Landing page, company profile, e-commerce, hingga website custom",
      "Responsive development, CMS-ready build, analytics, dan fondasi SEO",
      "Design system yang membuat pengalaman digital konsisten saat bisnis bertumbuh",
    ],
    plans: [
      {
        name: "Basic",
        title: "Launch Essential",
        summary: "Fondasi digital yang rapi untuk memperkenalkan bisnis dan mengubah perhatian menjadi percakapan.",
        forWho: "Ideal untuk bisnis baru, campaign, atau layanan dengan satu fokus utama.",
        includes: [
          "Arah visual, wireframe, dan UI dasar di Figma",
          "Landing page atau website company profile ringkas",
          "Responsive build dengan CMS yang mudah dikelola",
          "Basic on-page SEO, sitemap, dan analytics setup",
          "Dua putaran revisi dan handover yang jelas",
        ],
      },
      {
        name: "Intermediate",
        title: "Growth Website",
        summary: "Website multi-halaman yang dibangun dari kebutuhan pengguna, pesan brand, dan target konversi.",
        forWho: "Ideal untuk bisnis yang siap menguatkan kredibilitas dan alur lead generation.",
        includes: [
          "UX discovery, site structure, dan content direction",
          "UI hi-fidelity serta prototype untuk alur utama",
          "Website multi-halaman dengan component system",
          "Optimasi performa, Google Analytics, Search Console, dan SEO dasar",
          "Empat putaran revisi serta dokumentasi handover",
        ],
      },
      {
        name: "Advanced",
        title: "Digital Platform",
        summary: "Pengalaman digital menyeluruh untuk platform, e-commerce, atau website custom yang kompleks.",
        forWho: "Ideal untuk bisnis dengan banyak layanan, user flow, atau kebutuhan integrasi khusus.",
        includes: [
          "Research mendalam: persona, kompetitor, dan opportunity map",
          "UX/UI end-to-end, prototype interaktif, dan usability feedback",
          "Website 13+ halaman, e-commerce, atau custom workflow",
          "Technical, mobile, speed, dan local SEO foundation",
          "Training CMS, dokumentasi, serta enam putaran revisi",
        ],
      },
    ],
  },
  {
    name: "Digital Marketing",
    eyebrow: "02 / PERFORMANCE MARKETING",
    intro: "Kampanye yang menyambungkan pesan, media, dan momentum pertumbuhan.",
    description:
      "Kami membantu bisnis menjangkau audiens yang tepat melalui strategi media yang terukur—bukan sekadar menyalakan iklan. Setiap campaign disusun untuk belajar, mengoptimalkan, dan meningkatkan kualitas hasilnya dari waktu ke waktu.",
    bullets: [
      "Strategi campaign, funnel, audience research, dan channel planning",
      "Meta Ads, Google Ads, TikTok Ads, serta creative and copy direction",
      "Lead generation, retargeting, remarketing, dan conversion optimisation",
      "Monitoring transparan, eksperimen terstruktur, serta reporting berkala",
    ],
    plans: [
      {
        name: "Basic",
        title: "Campaign Starter",
        summary: "Memulai paid campaign dengan fondasi targeting, pesan, dan pengukuran yang benar.",
        forWho: "Ideal untuk validasi channel atau meluncurkan campaign pertama.",
        includes: [
          "Setup dan optimasi satu platform iklan",
          "Riset keyword atau audience serta arah pesan campaign",
          "Dua konsep creative ads untuk pengujian awal",
          "Tracking dasar dan rekomendasi alokasi media",
          "Laporan performa bulanan dengan next steps",
        ],
      },
      {
        name: "Intermediate",
        title: "Growth Campaign",
        summary: "Menghubungkan beberapa channel dan creative testing untuk menemukan kombinasi yang paling efektif.",
        forWho: "Ideal untuk bisnis yang sudah memiliki offer dan ingin mengakselerasi leads atau penjualan.",
        includes: [
          "Setup hingga dua platform iklan yang relevan",
          "Riset audience, funnel, dan eksperimen A/B testing",
          "Empat variasi creative ads dan copy direction",
          "Retargeting serta rekomendasi budget berbasis performa",
          "Laporan mingguan yang ringkas dan actionable",
        ],
      },
      {
        name: "Advanced",
        title: "Scale Up",
        summary: "Mesin performance marketing lintas channel untuk menjaga pertumbuhan sambil meningkatkan efisiensi.",
        forWho: "Ideal untuk brand yang ingin memperluas jangkauan tanpa kehilangan kontrol atas kualitas lead.",
        includes: [
          "Orkestrasi hingga tiga platform iklan",
          "Funnel strategy, audience segmentation, dan localisation plan",
          "Enam variasi creative ads dan iteration framework",
          "Retargeting, lead quality review, dan scale recommendation",
          "Weekly reporting plus sesi konsultasi strategi",
        ],
      },
    ],
  },
  {
    name: "SEO",
    eyebrow: "03 / ORGANIC GROWTH",
    intro: "Visibilitas organik yang dibangun dari apa yang benar-benar dicari audiens Anda.",
    description:
      "SEO kami tidak berhenti pada ranking. Kami memetakan peluang pencarian, memperbaiki fondasi teknis, dan membangun konten yang membantu calon pelanggan menemukan alasan untuk memilih Anda.",
    bullets: [
      "SEO audit: technical, on-page, off-page, dan content opportunity",
      "Keyword research, content strategy, dan optimasi halaman prioritas",
      "Technical SEO, page speed, schema markup, serta local SEO",
      "Content production, authority building, reporting, dan optimisation roadmap",
    ],
    plans: [
      {
        name: "Basic",
        title: "SEO Foundation",
        summary: "Merapikan hal penting terlebih dahulu agar website punya pijakan kuat untuk bertumbuh di search.",
        forWho: "Ideal untuk website yang baru diluncurkan atau belum pernah diaudit secara menyeluruh.",
        includes: [
          "Audit dasar technical, on-page, dan off-page",
          "Keyword research serta content priority map",
          "Optimasi hingga lima halaman prioritas",
          "Setup atau pengecekan Search Console dan Analytics",
          "Laporan bulanan serta rekomendasi prioritas berikutnya",
        ],
      },
      {
        name: "Intermediate",
        title: "SEO Momentum",
        summary: "Program optimasi berkelanjutan untuk meningkatkan relevansi konten dan peluang traffic berkualitas.",
        forWho: "Ideal untuk bisnis yang ingin membangun discovery organik secara konsisten.",
        includes: [
          "Audit lengkap dan roadmap SEO per kuartal",
          "Optimasi hingga 10 halaman dan Google Business Profile",
          "Content brief atau dua artikel SEO-ready per bulan",
          "Authority-building plan dengan link quality review",
          "Monthly performance review dan rekomendasi strategi",
        ],
      },
      {
        name: "Advanced",
        title: "Organic Growth",
        summary: "SEO terintegrasi untuk website berskala besar yang perlu memimpin category dan meningkatkan demand capture.",
        forWho: "Ideal untuk bisnis dengan kategori kompetitif, banyak halaman, atau target ekspansi.",
        includes: [
          "Full SEO management dan advanced keyword clusters",
          "Technical, mobile, speed, schema, dan local SEO optimisation",
          "Optimasi halaman prioritas secara berkelanjutan",
          "Content engine hingga empat artikel SEO-ready per bulan",
          "Weekly reporting dan sesi konsultasi strategi",
        ],
      },
    ],
  },
  {
    name: "Brand & Rebranding",
    eyebrow: "04 / BRAND SYSTEM",
    intro: "Identitas yang memberi bisnis Anda arah, pembeda, dan rasa percaya diri untuk tumbuh.",
    description:
      "Kami mengubah strategi brand menjadi sistem yang bisa dipakai—mulai dari positioning dan narasi hingga visual identity yang konsisten di setiap titik interaksi. Bukan hanya terlihat bagus, tetapi lebih mudah dikenali dan dipilih.",
    bullets: [
      "Brand positioning, audience insight, competitor lens, dan differentiation",
      "Brand voice, messaging, tagline, story, serta verbal identity",
      "Logo, visual system, colour, typography, and practical brand guidelines",
      "Social assets, marketing collateral, website direction, dan brand rollout",
    ],
    plans: [
      {
        name: "Basic",
        title: "Brand Clarity",
        summary: "Membuat identitas inti yang lebih rapi dan siap dipakai dengan cepat di kanal sehari-hari.",
        forWho: "Ideal untuk brand baru atau bisnis yang membutuhkan penyegaran identitas.",
        includes: [
          "Logo design atau logo refresh",
          "Colour palette, typography, dan basic brand guideline",
          "Aset stationery dan social media profile",
          "Arah visual untuk komunikasi awal",
          "Sesi konsultasi strategi branding",
        ],
      },
      {
        name: "Intermediate",
        title: "Brand Identity",
        summary: "Strategi dan identitas yang menyatukan cara brand berbicara, terlihat, dan muncul di pasar.",
        forWho: "Ideal untuk bisnis yang ingin memperjelas positioning sebelum memperluas komunikasinya.",
        includes: [
          "Positioning, USP, dan brand differentiation",
          "Tone of voice, key messaging, tagline, mission, dan vision",
          "Visual identity dan template social media",
          "Mini brand book serta asset pack yang siap digunakan",
          "Arah desain landing page atau company profile",
        ],
      },
      {
        name: "Advanced",
        title: "Brand Transformation",
        summary: "Sistem brand komprehensif untuk menyatukan strategi bisnis, pengalaman digital, dan eksekusi tim.",
        forWho: "Ideal untuk rebranding menyeluruh, ekspansi, atau organisasi dengan banyak touchpoint.",
        includes: [
          "Customer persona, competitor research, dan brand strategy",
          "Brand story, narrative, content strategy, dan communication framework",
          "Full brand book dengan visual system yang scalable",
          "Marketing collateral dan website revamp direction",
          "Internal brand training serta workshop bersama tim",
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
          <p className="eyebrow">SERVICES</p>
          <h1>
            One partner for the<br />
            <i>whole digital picture.</i>
          </h1>
          <p>Mulai dari satu kebutuhan paling mendesak atau rangkai beberapa disiplin menjadi sistem pertumbuhan yang saling menguatkan.</p>
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
            <p className="service-scope-label">What we shape</p>
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

        <p className="service-note">Setiap paket adalah titik awal. Scope final, timeline, dan prioritas akan kami susun setelah memahami konteks bisnis, target, dan kesiapan aset Anda.</p>
      </section>

      <section className="callout">
        <div className="wrap">
          <p className="eyebrow light">CUSTOM, NOT COOKIE-CUTTER</p>
          <h2>Butuh kombinasi layanan yang dibangun untuk target bisnis Anda?</h2>
          <Link href="/consultation" className="button gold">Rancang scope bersama →</Link>
        </div>
      </section>
    </SiteShell>
  );
}

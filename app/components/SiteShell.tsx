import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return <>
    <header className="nav">
      <Link href="/" className="logo logo-image" aria-label="Beranda Diksilab"><Image src="/logo-diksilab.png" alt="Diksilab" width={160} height={42} priority /></Link>
      <nav><Link href="/vision">Visi</Link><Link href="/services">Layanan</Link><Link href="/works">Karya</Link><Link href="/articles">Artikel</Link><Link href="/channel-audit">Audit Kanal</Link></nav>
      <Link href="/consultation" className="nav-cta">Ngobrol yuk <span>→</span></Link>
    </header>
    <main>{children}</main>
    <footer className="site-footer">
      <div className="wrap footer-contact"><div><p className="eyebrow light">YUK, MULAI DARI SINI</p><h2>Punya langkah besar berikutnya?</h2></div><Link href="/consultation" className="button gold">Ngobrol soal proyek →</Link></div>
      <div className="wrap footer-grid-proper">
        <div className="footer-brand"><Link href="/" className="logo logo-image" aria-label="Beranda Diksilab"><Image src="/logo-diksilab.png" alt="Diksilab" width={160} height={42} /></Link><p>Diksilab menyatukan strategi brand dan eksekusi digital untuk bisnis yang siap tumbuh.</p><p className="footer-location">Jakarta, Indonesia<br />Bekerja bersama tim di mana pun.</p></div>
        <div><p className="footer-label">JELAJAHI</p><Link href="/vision">Visi Kami</Link><Link href="/services">Layanan</Link><Link href="/works">Karya</Link><Link href="/articles">Artikel</Link></div>
        <div><p className="footer-label">ALAT</p><Link href="/audit">Audit Interaktif</Link><Link href="/channel-audit">Audit Kanal</Link><Link href="/faq">FAQ</Link><Link href="/consultation">Ngobrol Yuk</Link></div>
        <div><p className="footer-label">TERHUBUNG</p><Link href="/consultation">Ceritakan proyek Anda</Link><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.behance.net/" target="_blank" rel="noreferrer">Behance</a></div>
      </div>
      <div className="wrap footer-bottom-proper"><span>Hak cipta 2026 Diksilab</span><span>Dibangun untuk arah yang jelas dan momentum digital.</span></div>
    </footer>
  </>;
}

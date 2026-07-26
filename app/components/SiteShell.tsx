import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return <>
    <header className="nav">
      <Link href="/" className="logo logo-image" aria-label="Diksilab home"><Image src="/logo-diksilab.png" alt="Diksilab" width={160} height={42} priority /></Link>
      <nav>
        <Link href="/vision">Vision</Link><Link href="/services">Services</Link><Link href="/works">Works</Link><Link href="/articles">Insights</Link><Link href="/channel-audit">Channel Audit</Link>
      </nav>
      <Link href="/consultation" className="nav-cta">Work together <span>-&gt;</span></Link>
    </header>
    <main>{children}</main>
    <footer className="site-footer">
      <div className="wrap footer-contact"><div><p className="eyebrow light">LET&apos;S BUILD MOMENTUM</p><h2>Make your next move count.</h2></div><Link href="/consultation" className="button gold">Start a project -&gt;</Link></div>
      <div className="wrap footer-grid-proper">
        <div className="footer-brand"><Link href="/" className="logo logo-image" aria-label="Diksilab home"><Image src="/logo-diksilab.png" alt="Diksilab" width={160} height={42} /></Link><p>Diksilab brings together brand strategy and digital execution for businesses ready to grow.</p><p className="footer-location">Jakarta, Indonesia<br />Working with teams everywhere.</p></div>
        <div><p className="footer-label">EXPLORE</p><Link href="/vision">Our Vision</Link><Link href="/services">Services</Link><Link href="/works">Works</Link><Link href="/articles">Articles</Link></div>
        <div><p className="footer-label">TOOLS</p><Link href="/audit">Interactive Audit</Link><Link href="/channel-audit">Channel Audit</Link><Link href="/faq">FAQ</Link><Link href="/consultation">Work Together</Link></div>
        <div><p className="footer-label">CONNECT</p><Link href="/consultation">Project enquiry</Link><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.behance.net/" target="_blank" rel="noreferrer">Behance</a></div>
      </div>
      <div className="wrap footer-bottom-proper"><span>Copyright 2026 Diksilab</span><span>Built for clear direction and digital momentum.</span></div>
    </footer>
  </>;
}

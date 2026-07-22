import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return <><header className="nav"><Link href="/" className="logo">b<span>+</span>d</Link><nav><Link href="/vision">Vision</Link><Link href="/services">Services</Link><Link href="/works">Works</Link><Link href="/articles">Insights</Link><Link href="/audit">Audit</Link></nav><Link href="/consultation" className="nav-cta">Work together <span>-&gt;</span></Link></header><main>{children}</main><footer><div className="wrap footer-grid"><div><Link href="/" className="logo">b<span>+</span>d</Link><p>Brand strategy meets digital momentum.</p></div><div><p>Explore the next move.</p><Link href="/faq" className="text-link">Frequently asked questions <span>-&gt;</span></Link></div><div><p>Ready when you are.</p><Link href="/consultation" className="text-link">Let&apos;s work together <span>-&gt;</span></Link></div></div><div className="wrap footer-bottom">Copyright 2026 BangunBrandmu x Dotte Digital</div></footer></>;
}

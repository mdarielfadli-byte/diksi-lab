import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return <><header className="nav"><Link href="/" className="logo">b<span>+</span>d</Link><nav><Link href="/vision">Our Vision</Link><Link href="/services">Services</Link><Link href="/works">Works</Link></nav><Link href="/consultation" className="nav-cta">Work together <span>↗</span></Link></header><main>{children}</main><footer><div className="wrap footer-grid"><div><Link href="/" className="logo">b<span>+</span>d</Link><p>Brand strategy meets digital momentum.</p></div><div><p>Ready when you are.</p><Link href="/consultation" className="text-link">Let&apos;s work together <span>→</span></Link></div></div><div className="wrap footer-bottom">© 2026 BangunBrandmu × Dotte Digital</div></footer></>;
}

import type { Metadata } from "next";
import "./globals.css";
import "./aurora.css";
import "./expansion.css";
import "./audit-power.css";
import "./channel-audit.css";
import "./content-polish.css";
import "./preview-polish.css";
import "./works-refinement.css";
import "./services-polish.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://diksi-lab.vercel.app"),
  title: "Diksilab | Bangun brand, gerakkan bisnis",
  description: "Strategi brand dan eksekusi digital untuk bisnis yang siap tumbuh.",
  openGraph: { title: "Diksilab | Bangun brand, gerakkan bisnis", description: "Strategi brand dan eksekusi digital untuk bisnis yang siap tumbuh.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Diksilab | Bangun brand, gerakkan bisnis", images: ["/og.png"] },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}

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
  metadataBase: new URL("https://diksilab.com"),
  title: "Diksilab | Arah yang jelas, bisnis yang bergerak",
  description: "Partner strategi brand, pengalaman digital, dan performance marketing untuk UMKM dan startup yang ingin tumbuh lebih terarah.",
  openGraph: { title: "Diksilab | Arah yang jelas, bisnis yang bergerak", description: "Partner strategi brand, pengalaman digital, dan performance marketing untuk UMKM dan startup yang ingin tumbuh lebih terarah.", images: ["/og.png?v=3"] },
  twitter: { card: "summary_large_image", title: "Diksilab | Arah yang jelas, bisnis yang bergerak", description: "Partner strategi brand, pengalaman digital, dan performance marketing untuk UMKM dan startup yang ingin tumbuh lebih terarah.", images: ["/og.png?v=3"] },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}

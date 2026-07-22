import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BangunBrandmu × Dotte Digital",
  description: "Brand strategy and digital execution for businesses ready to grow.",
  openGraph: { title: "Bangun brand. Gerakkan bisnis.", description: "BangunBrandmu × Dotte Digital", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Bangun brand. Gerakkan bisnis.", images: ["/og.png"] },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}

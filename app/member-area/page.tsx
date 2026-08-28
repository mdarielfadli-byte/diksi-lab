import type { Metadata } from "next";
import { MemberPortal } from "./MemberPortal";

export const metadata: Metadata = {
  title: "Ruang Klien | Diksilab",
  description: "Pantau progres, aktivitas, dan dokumen proyek Anda bersama Diksilab.",
  robots: { index: false, follow: false },
};

export default function MemberArea() {
  return <MemberPortal />;
}

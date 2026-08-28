import type { Metadata } from "next";
import { PublicMemberDashboard } from "./PublicMemberDashboard";

export const metadata: Metadata = {
  title: "Ruang Klien | Diksilab",
  description: "Pantau progres, aktivitas, dan dokumen proyek Anda bersama Diksilab.",
  robots: { index: false, follow: false },
};

export default function MemberArea() {
  return <PublicMemberDashboard />;
}

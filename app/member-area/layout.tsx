import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MemberAreaShell } from "./MemberAreaShell";

export const metadata: Metadata = {
  title: "Member Area | Diksilab",
  description: "Pantau progress, aktivitas, kalender, dan file project Anda bersama Diksilab.",
  robots: { index: false, follow: false },
};

export default function MemberAreaLayout({ children }: { children: ReactNode }) {
  return <MemberAreaShell>{children}</MemberAreaShell>;
}

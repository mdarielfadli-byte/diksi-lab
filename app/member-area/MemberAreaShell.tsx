"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MemberPortal, type ClientAreaPage } from "./MemberPortal";

const sectionPages = new Set<ClientAreaPage>([
  "project",
  "calendar",
  "documents",
  "launchpad",
  "collaboration",
]);

export function MemberAreaShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const section = pathname.split("/").filter(Boolean).at(1);
  const page: ClientAreaPage = section && sectionPages.has(section as ClientAreaPage)
    ? section as ClientAreaPage
    : "overview";

  return (
    <>
      <MemberPortal initialPage={page} />
      {children}
    </>
  );
}

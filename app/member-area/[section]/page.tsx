import { notFound } from "next/navigation";
import type { ClientAreaPage } from "../MemberPortal";

const pageSections: ClientAreaPage[] = [
  "project",
  "calendar",
  "documents",
  "launchpad",
  "collaboration",
];

export function generateStaticParams() {
  return pageSections.map((section) => ({ section }));
}

export default async function MemberAreaSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!pageSections.includes(section as ClientAreaPage)) notFound();
  return null;
}

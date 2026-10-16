import { notFound } from "next/navigation";
import { MemberPortal, type ClientAreaPage } from "../MemberPortal";

const pageSections = new Set<ClientAreaPage>([
  "project",
  "calendar",
  "documents",
  "launchpad",
  "collaboration",
]);

export default async function MemberAreaSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!pageSections.has(section as ClientAreaPage)) notFound();
  return <MemberPortal initialPage={section as ClientAreaPage} />;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MEMBER_AREA_HOST = "client.diksilab.com";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (hostname === MEMBER_AREA_HOST && request.nextUrl.pathname === "/") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/member-area";
    return NextResponse.rewrite(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSiteShutdown, SHUTDOWN_PATH } from "@/lib/site-shutdown";

export async function middleware(request: NextRequest) {
  if (isSiteShutdown()) {
    const { pathname } = request.nextUrl;

    if (pathname === SHUTDOWN_PATH) {
      return NextResponse.next({ request });
    }

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "This site is temporarily unavailable." },
        { status: 503 },
      );
    }

    const url = request.nextUrl.clone();
    url.pathname = SHUTDOWN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

function redirectProtectedRoute(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/signin";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPartnerSignup = pathname === "/partner/signup";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/partner") && !isPartnerSignup);

  const supabaseEnv = getSupabaseEnv();
  if (!supabaseEnv) {
    if (isProtectedRoute) {
      return redirectProtectedRoute(request, pathname);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      supabaseEnv.url,
      supabaseEnv.anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedRoute) {
      return redirectProtectedRoute(request, pathname);
    }

    if (user && pathname.startsWith("/admin")) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = user.email?.toLowerCase();
      if (!userEmail || !adminEmails.includes(userEmail)) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  } catch {
    if (isProtectedRoute) {
      return redirectProtectedRoute(request, pathname);
    }
  }

  return supabaseResponse;
}

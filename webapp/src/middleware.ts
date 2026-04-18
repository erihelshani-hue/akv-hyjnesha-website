import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/auth/callback", "/offline"];

function isPublicPath(pathname: string): boolean {
  for (const locale of routing.locales) {
    for (const publicPath of PUBLIC_PATHS) {
      if (pathname === `/${locale}${publicPath}` || pathname.startsWith(`/${locale}${publicPath}/`)) {
        return true;
      }
    }
  }
  return pathname.startsWith("/auth/") || pathname === "/offline";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Run intl middleware first to handle locale detection/redirect
  const intlResponse = intlMiddleware(request);

  // Handle auth for non-public routes
  if (!isPublicPath(pathname)) {
    const { response, user } = await updateSession(request);

    if (!user) {
      // Detect locale from pathname or default
      const locale =
        routing.locales.find((l) => pathname.startsWith(`/${l}`)) ??
        routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // If authenticated user hits login, redirect to dashboard
  if (PUBLIC_PATHS.some((p) => pathname.includes(p) && p === "/login")) {
    const { user } = await updateSession(request);
    if (user) {
      const locale =
        routing.locales.find((l) => pathname.startsWith(`/${l}`)) ??
        routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-*.js).*)",
  ],
};

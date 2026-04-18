import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/offline"];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/auth/")) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next internals, static files, and the auth callback route
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/auth/")
  ) {
    return NextResponse.next();
  }

  // Public pages: only redirect authed users away from /login
  if (isPublicPath(pathname)) {
    if (pathname === "/login") {
      const { user } = await updateSession(request);
      if (user) return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected pages: require session
  const { response, user } = await updateSession(request);
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-*.js).*)",
  ],
};

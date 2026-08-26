import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast, cookie-presence-only check (no DB round-trip) so unauthenticated
// visitors get redirected before a protected page even starts rendering.
// This is a UX optimization, NOT the real authorization boundary — every
// protected page/route also independently verifies the session
// server-side (see app/dashboard/layout.tsx), because a cookie's mere
// presence proves nothing on its own (it could be expired, forged, or
// revoked) and middleware must never be the only gate on real data.
const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );
  if (!isProtected) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NOXTURN_AUTH_COOKIE, NOXTURN_AUTH_VALUE } from "@/lib/auth-cookie";

/** Public routes (no session cookie yet). */
const PUBLIC_PATHS = new Set<string>(["/", "/auth/callback"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(NOXTURN_AUTH_COOKIE)?.value;
  const authed = token === NOXTURN_AUTH_VALUE;

  if (PUBLIC_PATHS.has(pathname)) {
    if (authed) {
      return NextResponse.redirect(new URL("/today", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const login = new URL("/", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

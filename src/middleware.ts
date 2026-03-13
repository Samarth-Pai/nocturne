import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    isStaticAsset ||
    pathname.startsWith("/avatars")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("levelup_token")?.value;
  const isPublicPath = PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath));

  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (token && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

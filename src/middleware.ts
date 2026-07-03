import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAMES } from "@/constants/auth";
import {
  PROTECTED_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
  ROUTES,
} from "@/constants/routes";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (pathname === ROUTES.home) {
    const destination = accessToken ? ROUTES.dashboard : ROUTES.login;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isProtectedPath(pathname) && !accessToken) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicAuthPath(pathname) && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};

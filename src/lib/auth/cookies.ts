import type { NextResponse } from "next/server";

import { AUTH_COOKIE_NAMES } from "@/constants/auth";
import { serverEnv } from "@/config/env";

const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function applyAuthCookies(
  response: NextResponse,
  tokens: { access_token: string; refresh_token: string; expires_in: number },
): NextResponse {
  const secure = serverEnv.COOKIE_SECURE;

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, tokens.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });

  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE_NAMES.accessToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.refreshToken);
  return response;
}

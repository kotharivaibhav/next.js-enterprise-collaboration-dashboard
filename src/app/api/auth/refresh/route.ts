import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/constants/auth";
import { backendFetch } from "@/lib/auth/backend";
import { applyAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import type { TokenResponse } from "@/types/auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { detail: "No refresh token available" },
      { status: 401 },
    );
    return clearAuthCookies(response);
  }

  try {
    const tokens = await backendFetch<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    const response = NextResponse.json(tokens);
    return applyAuthCookies(response, tokens);
  } catch {
    const response = NextResponse.json(
      { detail: "Session expired" },
      { status: 401 },
    );
    return clearAuthCookies(response);
  }
}

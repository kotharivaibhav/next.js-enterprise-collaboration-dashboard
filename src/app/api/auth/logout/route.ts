import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/constants/auth";
import { backendFetch } from "@/lib/auth/backend";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  try {
    if (accessToken) {
      await backendFetch<void>("/auth/logout", {
        method: "POST",
        accessToken,
        body: refreshToken ? { refresh_token: refreshToken } : {},
      });
    }
  } catch {
    // Clear cookies even if backend logout fails
  }

  const response = NextResponse.json({ success: true });
  return clearAuthCookies(response);
}

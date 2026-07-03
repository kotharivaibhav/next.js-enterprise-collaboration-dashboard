import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/constants/auth";

/**
 * Returns the access token from HttpOnly cookies for WebSocket authentication.
 * Used only when establishing a WS connection to the FastAPI backend.
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ token: accessToken });
}

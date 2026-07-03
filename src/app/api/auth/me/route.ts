import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/constants/auth";
import { backendFetch } from "@/lib/auth/backend";
import type { User } from "@/types/auth";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await backendFetch<User>("/auth/me", {
      method: "GET",
      accessToken,
    });
    return NextResponse.json(user);
  } catch (error) {
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 401;
    return NextResponse.json(
      { detail: "Unable to fetch user profile" },
      { status },
    );
  }
}

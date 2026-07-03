import { NextResponse } from "next/server";

import { backendFetch, BackendRequestError } from "@/lib/auth/backend";
import { applyAuthCookies } from "@/lib/auth/cookies";
import type { LoginRequest, TokenResponse } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest;
    const tokens = await backendFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body,
    });

    const response = NextResponse.json(tokens);
    return applyAuthCookies(response, tokens);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return NextResponse.json({ detail: "Unable to sign in" }, { status: 500 });
  }
}

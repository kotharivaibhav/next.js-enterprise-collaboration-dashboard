import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/auth/backend";
import { applyAuthCookies } from "@/lib/auth/cookies";
import type { AuthResponse, RegisterRequest } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequest;
    const result = await backendFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body,
    });

    const response = NextResponse.json(result, { status: 201 });
    return applyAuthCookies(response, result.tokens);
  } catch (error) {
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 500;
    const message =
      error instanceof Error ? error.message : "Unable to create account";
    return NextResponse.json({ detail: message }, { status });
  }
}

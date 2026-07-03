import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "collabforge-frontend",
    timestamp: new Date().toISOString(),
  });
}

import { z } from "zod";

const serverEnvSchema = z.object({
  BACKEND_API_URL: z.string().url().default("http://localhost:8000"),
  BACKEND_API_V1_PREFIX: z.string().default("/api/v1"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_WS_URL: z.string().default("ws://localhost:8000/ws"),
});

function getServerEnv() {
  return serverEnvSchema.parse({
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    BACKEND_API_V1_PREFIX: process.env.BACKEND_API_V1_PREFIX,
    COOKIE_SECURE: process.env.COOKIE_SECURE,
  });
}

function getClientEnv() {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  });
}

export const serverEnv = getServerEnv();
export const clientEnv = getClientEnv();

export function getBackendApiUrl(path = ""): string {
  const base = `${serverEnv.BACKEND_API_URL}${serverEnv.BACKEND_API_V1_PREFIX}`;
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}

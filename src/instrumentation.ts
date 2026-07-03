import { isOtelEnabled } from "@/config/monitoring";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (isOtelEnabled()) {
      await import("./instrumentation.node");
    }

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await import("../sentry.server.config");
    }
  }

  if (
    process.env.NEXT_RUNTIME === "edge" &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    await import("../sentry.edge.config");
  }
}

export async function onRequestError(
  error: Error,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string },
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(error, {
    extra: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
    },
  });
}

import type { BrowserOptions } from "@sentry/nextjs";

export function getSentryConfig(): BrowserOptions & { enabled: boolean } {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  return {
    enabled: Boolean(dsn),
    dsn,
    environment:
      process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    sendDefaultPii: false,
  };
}

export function isOtelEnabled(): boolean {
  return (
    process.env.OTEL_ENABLED === "true" &&
    Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
  );
}

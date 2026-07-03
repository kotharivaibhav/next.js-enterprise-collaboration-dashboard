import { describe, expect, it } from "vitest";

import { getSentryConfig, isOtelEnabled } from "@/config/monitoring";

describe("monitoring config", () => {
  it("disables Sentry when DSN is unset", () => {
    const original = process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    expect(getSentryConfig().enabled).toBe(false);

    process.env.NEXT_PUBLIC_SENTRY_DSN = original;
  });

  it("enables OTel only when flag and endpoint are set", () => {
    const enabled = process.env.OTEL_ENABLED;
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    delete process.env.OTEL_ENABLED;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    expect(isOtelEnabled()).toBe(false);

    process.env.OTEL_ENABLED = "true";
    expect(isOtelEnabled()).toBe(false);

    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318/v1/traces";
    expect(isOtelEnabled()).toBe(true);

    process.env.OTEL_ENABLED = enabled;
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = endpoint;
  });
});

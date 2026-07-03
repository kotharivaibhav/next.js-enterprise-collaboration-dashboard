import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "@/config/monitoring";

const config = getSentryConfig();

if (config.enabled) {
  Sentry.init({
    ...config,
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
  });
}

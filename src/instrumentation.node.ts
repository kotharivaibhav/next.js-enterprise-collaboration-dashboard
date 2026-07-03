import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (!endpoint) {
  throw new Error(
    "OTEL_EXPORTER_OTLP_ENDPOINT is required when OTEL_ENABLED=true",
  );
}

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": process.env.OTEL_SERVICE_NAME ?? "collabforge-frontend",
    "deployment.environment":
      process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development",
  }),
  traceExporter: new OTLPTraceExporter({ url: endpoint }),
  instrumentations: [new HttpInstrumentation()],
});

sdk.start();

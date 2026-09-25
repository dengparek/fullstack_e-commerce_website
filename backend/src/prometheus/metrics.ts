import {
  collectDefaultMetrics,
  Registry,
  Counter,
  Histogram,
} from "@prometheus-io/client";

export const metricsRegistry = new Registry();

// Node.js/process metrics:
// CPU, memory, event loop, GC, Node.js version, etc.
collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "ecommerce_",
});

// Total HTTP requests
export const httpRequestsTotal = new Counter({
  name: "ecommerce_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry],
});

// HTTP request duration
export const httpRequestDuration = new Histogram({
  name: "ecommerce_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

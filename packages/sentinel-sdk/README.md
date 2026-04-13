# @sentinel/sdk

Lightweight SDK to send production error logs to the **Sentinel** AI-powered observability platform. Zero runtime dependencies — uses native `fetch`.

## Installation

```bash
npm install @sentinel/sdk
```

## Quick Start

```typescript
import { Sentinel } from "@sentinel/sdk";

const sentinel = new Sentinel({
  endpoint: "https://your-sentinel-host.com",
  apiKey: "your-project-api-key",
  source: "payment-service",
});

// Capture an error manually
try {
  await chargeUser(userId, amount);
} catch (error) {
  sentinel.captureException(error, { severity: "critical" });
}

// Capture a custom message
sentinel.captureMessage("User checkout started", {
  severity: "low",
  metadata: { userId, cartTotal },
});
```

## Auto-Capture

Automatically capture all uncaught exceptions and unhandled promise rejections:

```typescript
sentinel.enableAutoCapture();
// That's it — crashes are now reported to Sentinel
```

## Express Middleware

Drop-in Express error handler that captures errors with request context:

```typescript
import express from "express";
import { Sentinel } from "@sentinel/sdk";

const app = express();
const sentinel = new Sentinel({
  endpoint: "https://sentinel.yourcompany.com",
  apiKey: "sk-your-key",
  source: "api-server",
});

// Your routes...
app.get("/api/data", (req, res) => { /* ... */ });

// Add Sentinel error handler LAST (after all routes)
app.use(sentinel.expressErrorHandler());

// Graceful shutdown
process.on("SIGTERM", async () => {
  await sentinel.close();
  process.exit(0);
});
```

The middleware automatically captures:
- Error name, message, and stack trace
- HTTP method, URL, IP, and User-Agent
- `X-Trace-Id` header (if present) for distributed tracing

## Configuration

```typescript
const sentinel = new Sentinel({
  endpoint: "https://sentinel.yourcompany.com",  // Required
  apiKey: "sk-your-key",                          // Required
  source: "my-service",                           // Required
  batchInterval: 5000,     // Flush every 5s (default)
  maxBatchSize: 10,        // Flush after 10 logs (default)
  defaultSeverity: "high", // Default severity for captureException (default)
});
```

## API Reference

### `sentinel.captureException(error, meta?)`
Captures an `Error` object with optional severity, traceId, and metadata.

### `sentinel.captureMessage(message, meta?)`
Captures a custom log message.

### `sentinel.enableAutoCapture()`
Hooks into `process.on('uncaughtException')` and `process.on('unhandledRejection')`.

### `sentinel.expressErrorHandler()`
Returns an Express error-handling middleware `(err, req, res, next)`.

### `sentinel.flush()`
Force-sends all buffered logs immediately. Returns a `Promise`.

### `sentinel.close()`
Flushes pending logs and stops the batcher timer. Call during graceful shutdown.

### `sentinel.pendingLogs`
Number of logs currently waiting in the buffer.

## How It Works

1. **Capture** — `captureException` / `captureMessage` / auto-capture collects the error
2. **Buffer** — Logs are batched in memory (configurable interval + max size)
3. **Send** — Batched logs are POSTed to `POST /firewall/api/ingest` with `X-API-Key` auth
4. **Sanitize** — Sentinel's firewall strips sensitive data (emails, IPs, tokens, API keys)
5. **Analyze** — Gemini AI analyzes the sanitized log and returns root cause + resolution
6. **Dashboard** — View incidents, AI analysis, and alerts on the Sentinel dashboard

## License

ISC

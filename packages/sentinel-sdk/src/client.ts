import { SentinelOptions, SentinelLog, SeverityLevel } from "./types";
import { LogBatcher } from "./batch";

export class Sentinel {
  private readonly options: Required<SentinelOptions>;
  private readonly batcher: LogBatcher;
  private autoCapturing = false;

  constructor(options: SentinelOptions) {
    if (!options.endpoint) throw new Error("Sentinel: endpoint is required");
    if (!options.apiKey) throw new Error("Sentinel: apiKey is required");
    if (!options.source) throw new Error("Sentinel: source is required");

    this.options = {
      endpoint: options.endpoint.replace(/\/$/, ""), // strip trailing slash
      apiKey: options.apiKey,
      source: options.source,
      batchInterval: options.batchInterval || 5000,
      maxBatchSize: options.maxBatchSize || 10,
      defaultSeverity: options.defaultSeverity || "high",
    };

    this.batcher = new LogBatcher(this.options.endpoint, this.options.apiKey, {
      batchInterval: this.options.batchInterval,
      maxBatchSize: this.options.maxBatchSize,
    });
  }

  /**
   * Capture an exception and send it to Sentinel.
   */
  captureException(
    error: Error,
    meta?: { severity?: SeverityLevel; traceId?: string; metadata?: Record<string, any> }
  ): void {
    const log: SentinelLog = {
      source: this.options.source,
      severity: meta?.severity || this.options.defaultSeverity,
      message: `${error.name}: ${error.message}\n${error.stack || ""}`,
      traceId: meta?.traceId,
      metadata: {
        ...meta?.metadata,
        errorName: error.name,
      },
      timestamp: new Date().toISOString(),
    };

    this.batcher.add(log);
  }

  /**
   * Capture a custom log message.
   */
  captureMessage(
    message: string,
    meta?: { severity?: SeverityLevel; traceId?: string; metadata?: Record<string, any> }
  ): void {
    const log: SentinelLog = {
      source: this.options.source,
      severity: meta?.severity || "medium",
      message,
      traceId: meta?.traceId,
      metadata: meta?.metadata,
      timestamp: new Date().toISOString(),
    };

    this.batcher.add(log);
  }

  /**
   * Enable automatic capture of uncaught exceptions and unhandled rejections.
   */
  enableAutoCapture(): void {
    if (this.autoCapturing) return;
    this.autoCapturing = true;

    process.on("uncaughtException", (error) => {
      this.captureException(error, { severity: "critical" });
      // Flush immediately on crash — don't rely on timer
      this.flush().finally(() => {
        process.exit(1);
      });
    });

    process.on("unhandledRejection", (reason) => {
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      this.captureException(error, { severity: "high" });
    });

    console.log("[Sentinel] Auto-capture enabled for uncaught exceptions");
  }

  /**
   * Returns an Express error-handling middleware.
   *
   * Usage: app.use(sentinel.expressErrorHandler())
   */
  expressErrorHandler() {
    return (err: Error, req: any, res: any, next: any) => {
      this.captureException(err, {
        severity: "high",
        traceId: req.headers?.["x-trace-id"] as string,
        metadata: {
          method: req.method,
          url: req.originalUrl || req.url,
          ip: req.ip,
          userAgent: req.headers?.["user-agent"],
        },
      });
      next(err);
    };
  }

  /**
   * Force-flush all buffered logs immediately.
   */
  async flush(): Promise<void> {
    await this.batcher.flush();
  }

  /**
   * Flush pending logs and stop the batcher.
   * Call this during graceful shutdown.
   */
  async close(): Promise<void> {
    await this.batcher.flush();
    this.batcher.stop();
  }

  /**
   * Number of logs waiting to be sent.
   */
  get pendingLogs(): number {
    return this.batcher.pending;
  }
}

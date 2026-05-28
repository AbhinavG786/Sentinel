export interface SentinelOptions {
  /** Your Sentinel server endpoint (e.g., "https://sentinel.yourcompany.com") */
  endpoint: string;
  /** Project-level API key for authentication */
  apiKey: string;
  /** Name of the service sending logs (e.g., "payment-service") */
  source: string;
  /** How often to flush batched logs in ms (default: 5000) */
  batchInterval?: number;
  /** Max number of logs to buffer before auto-flush (default: 10) */
  maxBatchSize?: number;
  /** Default severity for captured errors (default: "high") */
  defaultSeverity?: SeverityLevel;
}

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface SentinelLog {
  source: string;
  severity: SeverityLevel;
  message: string;
  traceId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface IngestResponse {
  message: string;
}

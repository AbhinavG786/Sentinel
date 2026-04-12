import { SentinelLog } from "./types";

export class LogBatcher {
  private buffer: SentinelLog[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly batchInterval: number;
  private readonly maxBatchSize: number;

  constructor(
    endpoint: string,
    apiKey: string,
    options: { batchInterval?: number; maxBatchSize?: number } = {}
  ) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.batchInterval = options.batchInterval || 5000;
    this.maxBatchSize = options.maxBatchSize || 10;

    this.startTimer();
  }

  add(log: SentinelLog): void {
    this.buffer.push(log);

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    // Take current buffer and reset
    const batch = [...this.buffer];
    this.buffer = [];

    // Send each log individually (ingest endpoint expects single log)
    const promises = batch.map((log) =>
      this.sendLog(log).catch((err) => {
        console.error("[Sentinel SDK] Failed to send log:", err.message);
        // Re-add to buffer for retry on next flush
        this.buffer.push(log);
      })
    );

    await Promise.allSettled(promises);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  get pending(): number {
    return this.buffer.length;
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.batchInterval);

    // Don't let the timer keep the process alive
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  private async sendLog(log: SentinelLog): Promise<void> {
    const response = await fetch(`${this.endpoint}/firewall/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify({ logs: log }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      throw new Error(`Sentinel ingest failed (${response.status}): ${text}`);
    }
  }
}

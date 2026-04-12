export interface IncidentCreatedEvent {
  tempId: string;
  traceId: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  sanitizedSnippet: string;
  sanitizedPayloadRef?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IncidentStoredEvent {
  incidentId: string;
  tempId: string;
  traceId: string;
  source: string;
  severity: string;
  storedAt: string;
  sanitizedSnippet: string;
}

export interface IncidentAnalyzedEvent {
  incidentId: string;
  traceId: string;
  summary: string;
  root_cause: string;
  resolution: string;
  confidence: number;
  analyzedAt: string;
}

export interface PolicyViolationEvent {
  tempId: string;
  traceId: string;
  violations: Array<{
    policy: any;
    keyword: string;
    action: string;
  }>;
  timestamp: string;
}

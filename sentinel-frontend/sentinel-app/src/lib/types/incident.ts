export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "in_progress" | "resolved" | "closed";

export interface AiSummary {
  summary: string;
  root_cause: string;
  resolution: string;
  confidence: number;
  analyzedAt?: string;
  model?: string;
}

export interface Incident {
  id: string;
  tempId?: string;
  traceId?: string;
  title: string;
  source: string;
  severity: Severity;
  status: IncidentStatus;
  ai_summary?: AiSummary | null;
  sanitized_log?: string | null;
  team?: string;
  assigned_to?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentListResponse {
  data: Incident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateIncidentDto {
  title: string;
  source: string;
  severity: Severity;
  sanitized_log?: string;
  team?: string;
}

export interface UpdateIncidentDto {
  status?: IncidentStatus;
  title?: string;
  assigned_to?: string;
  team?: string;
}

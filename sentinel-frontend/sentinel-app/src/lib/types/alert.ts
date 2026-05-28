import type { Severity } from "./incident";

export interface Alert {
  id: string;
  incident_id: string;
  traceId?: string;
  severity: Severity;
  message: string;
  acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertListResponse {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

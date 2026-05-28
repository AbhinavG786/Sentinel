export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id?: string;
  user?: { id: string; name: string; email: string };
  details?: Record<string, unknown>;
  created_at: string;
}

export interface PolicyLog {
  id: string;
  incident_id?: string;
  traceId?: string;
  tempId?: string;
  violations: PolicyViolation[];
  timestamp: string;
  created_at: string;
}

export interface PolicyViolation {
  policy_id: string;
  policy_name: string;
  violation_text: string;
  matched_keyword?: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PolicyLogListResponse {
  data: PolicyLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface Stats {
  incidents: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  ai: {
    analyzedCount: number;
    avgConfidence: number;
  };
  alerts: {
    total: number;
    unacknowledged: number;
  };
  policyViolations: number;
  recentTrend: TrendPoint[];
}

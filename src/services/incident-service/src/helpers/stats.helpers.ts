import { db } from "@shared/utils";

class StatsService {
  getDashboardStats = async () => {
    const [incidentCounts] = await db("incidents")
      .select(
        db.raw("COUNT(*) as total"),
        db.raw("COUNT(*) FILTER (WHERE status = 'open') as open_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'closed') as closed_count"),
        db.raw("COUNT(*) FILTER (WHERE severity = 'critical') as critical_count"),
        db.raw("COUNT(*) FILTER (WHERE severity = 'high') as high_count"),
        db.raw("COUNT(*) FILTER (WHERE severity = 'medium') as medium_count"),
        db.raw("COUNT(*) FILTER (WHERE severity = 'low') as low_count")
      );

    const [aiStats] = await db("incidents")
      .whereNotNull("ai_summary")
      .select(
        db.raw("COUNT(*) as analyzed_count"),
        db.raw("AVG((ai_summary->>'confidence')::float) as avg_confidence")
      );

    const [alertCounts] = await db("alerts")
      .select(
        db.raw("COUNT(*) as total_alerts"),
        db.raw("COUNT(*) FILTER (WHERE acknowledged = false) as unacknowledged_alerts")
      );

    const [policyViolationCount] = await db("policy_logs")
      .select(db.raw("COUNT(*) as total_policy_violations"));

    // Last 7 days trend
    const recentTrend = await db("incidents")
      .select(
        db.raw("DATE(created_at) as date"),
        db.raw("COUNT(*) as count")
      )
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '7 days'"))
      .groupByRaw("DATE(created_at)")
      .orderBy("date", "asc");

    return {
      incidents: {
        total: Number(incidentCounts.total),
        open: Number(incidentCounts.open_count),
        inProgress: Number(incidentCounts.in_progress_count),
        resolved: Number(incidentCounts.resolved_count),
        closed: Number(incidentCounts.closed_count),
      },
      severity: {
        critical: Number(incidentCounts.critical_count),
        high: Number(incidentCounts.high_count),
        medium: Number(incidentCounts.medium_count),
        low: Number(incidentCounts.low_count),
      },
      ai: {
        analyzedCount: Number(aiStats.analyzed_count),
        avgConfidence: aiStats.avg_confidence ? parseFloat(Number(aiStats.avg_confidence).toFixed(3)) : null,
      },
      alerts: {
        total: Number(alertCounts.total_alerts),
        unacknowledged: Number(alertCounts.unacknowledged_alerts),
      },
      policyViolations: Number(policyViolationCount.total_policy_violations),
      recentTrend: recentTrend.map((r: any) => ({
        date: r.date,
        count: Number(r.count),
      })),
    };
  };
}

export default new StatsService();

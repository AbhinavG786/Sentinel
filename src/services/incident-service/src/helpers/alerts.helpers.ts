import { db } from "@shared/utils";

class AlertService {
  getAlerts = async (filters: {
    severity?: string;
    acknowledged?: string;
    page?: number;
    limit?: number;
  }) => {
    const { severity, acknowledged, page = 1, limit = 10 } = filters;
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.max(1, Math.floor(Number(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    let query = db("alerts")
      .leftJoin("incidents", "alerts.incident_id", "incidents.id")
      .select(
        "alerts.*",
        "incidents.source as incident_source",
        "incidents.title as incident_title",
        "incidents.status as incident_status"
      )
      .orderBy("alerts.created_at", "desc");

    if (severity) {
      query = query.where("alerts.severity", severity);
    }
    if (acknowledged !== undefined) {
      query = query.where("alerts.acknowledged", acknowledged === "true");
    }

    const totalQuery = query.clone().clearSelect().clearOrder().count("* as total").first();
    const rowsQuery = query.offset(offset).limit(safeLimit);

    const [totalResult, alerts] = await Promise.all([totalQuery, rowsQuery]);
    const total = Number(totalResult?.total || 0);

    return {
      data: alerts,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  };

  getAlertById = async (id: string) => {
    return db("alerts")
      .leftJoin("incidents", "alerts.incident_id", "incidents.id")
      .select(
        "alerts.*",
        "incidents.source as incident_source",
        "incidents.title as incident_title",
        "incidents.severity as incident_severity",
        "incidents.status as incident_status",
        "incidents.ai_summary"
      )
      .where("alerts.id", id)
      .first();
  };

  acknowledgeAlert = async (id: string) => {
    const [updated] = await db("alerts")
      .where({ id })
      .update({ acknowledged: true })
      .returning("*");
    return updated;
  };
}

export default new AlertService();

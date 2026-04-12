import { db } from "@shared/utils";

class AuditService {
  getAuditLogs = async (filters: {
    entity_type?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) => {
    const { entity_type, action, page = 1, limit = 10 } = filters;
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.max(1, Math.floor(Number(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    let query = db("audit_logs").orderBy("created_at", "desc");

    if (entity_type) {
      query = query.where("entity_type", entity_type);
    }
    if (action) {
      query = query.where("action", action);
    }

    const totalQuery = query.clone().clearSelect().clearOrder().count("* as total").first();
    const rowsQuery = query.offset(offset).limit(safeLimit).select("*");

    const [totalResult, logs] = await Promise.all([totalQuery, rowsQuery]);
    const total = Number(totalResult?.total || 0);

    return {
      data: logs,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  };

  getAuditLogsByEntity = async (entityId: string) => {
    return db("audit_logs")
      .where("entity_id", entityId)
      .orderBy("created_at", "asc")
      .select("*");
  };
}

export default new AuditService();

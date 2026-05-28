import { db } from "@shared/utils";

class PolicyLogsService {
  getPolicyLogs = async (filters: {
    policy_id?: string;
    action_taken?: string;
    page?: number;
    limit?: number;
  }) => {
    const { policy_id, action_taken, page = 1, limit = 10 } = filters;
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.max(1, Math.floor(Number(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    let query = db("policy_logs")
      .leftJoin("knowledge_policies", "policy_logs.policy_id", "knowledge_policies.id")
      .select(
        "policy_logs.*",
        "knowledge_policies.name as policy_name",
        "knowledge_policies.description as policy_description"
      )
      .orderBy("policy_logs.created_at", "desc");

    if (policy_id) {
      query = query.where("policy_logs.policy_id", policy_id);
    }
    if (action_taken) {
      query = query.where("policy_logs.action_taken", action_taken);
    }

    const totalQuery = query.clone().clearSelect().clearOrder().count("* as total").first();
    const rowsQuery = query.offset(offset).limit(safeLimit);

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
}

export default new PolicyLogsService();

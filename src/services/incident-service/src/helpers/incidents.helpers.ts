import { db } from "../db/knex";

export interface Incident {
  id?: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reported_by?: string;
  assigned_to?: string;
  team_id?: string;
  ai_summary?: any;
  status: "open" | "in_progress" | "resolved";
  created_at?: Date;
  updated_at?: Date;
}

class IncidentService {
  createIncident = async (incident: Incident) => {
    const [newIncident] = await db("incidents").insert(incident).returning("*");
    return newIncident;
  };

  fetchAllIncidents = async () => {
    const incidents = await db("incidents")
      .select("*")
      .orderBy("created_at", "desc");
    return incidents;
  };

  getIncidentById = async (id: string) => {
    const incident = await db("incidents").select("*").where({ id }).first();
    return incident;
  };

  updateIncident = async (id: string, updates: Partial<Incident>) => {
    const [updatedIncident] = await db("incidents")
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning("*");
    return updatedIncident;
  };

  deleteIncident = async (id: string) => {
    return await db("incidents").where({ id }).del();
  };

  getFilteredIncidents = async (filters: {
    status?: string;
    severity?: string;
    reported_by?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const {
      status,
      severity,
      reported_by,
      search,
      page = 1,
      limit = 10,
    } = filters;
    try {
      const safePage = Math.max(1, Math.floor(Number(page) || 1));
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 10));
      const offset = (safePage - 1) * safeLimit;
      let query = db("incidents").orderBy("created_at", "desc");
      if (status) {
        query = query.andWhere("status", status);
      }
      if (severity) {
        query = query.andWhere("severity", severity);
      }
      if (reported_by) {
        query = query.andWhere("reported_by", reported_by);
      }
      if (search) {
        query = query.andWhere((qb) => {
          qb.whereILike("title", `%${search}%`).orWhereILike(
            "description",
            `%${search}%`
          );
        });
      }

      const totalQuery = query.clone().count("* as total").first();
      const rowsQuery = query.offset(offset).limit(safeLimit).select("*");

      const [totalResult, incidents] = await Promise.all([
        totalQuery,
        rowsQuery,
      ]);
      const total = Number(totalResult?.total || 0);
      return {
        data: incidents,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching filtered incidents:", error);
      throw new Error("Failed to fetch filtered incidents");
    }
  };
}
export default new IncidentService();

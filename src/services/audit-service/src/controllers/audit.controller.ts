import { Request, Response } from "express";
import auditService from "../helpers/audit.helpers";

class AuditController {
  getAuditLogs = async (req: Request, res: Response) => {
    const { entity_type, action, page, limit } = req.query;
    try {
      const result = await auditService.getAuditLogs({
        entity_type: entity_type as string,
        action: action as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  };

  getAuditLogsByEntity = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const logs = await auditService.getAuditLogsByEntity(id);
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Error fetching entity audit trail:", error);
      return res.status(500).json({ error: "Failed to fetch entity audit trail" });
    }
  };
}

export default new AuditController();

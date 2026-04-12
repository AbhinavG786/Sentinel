import { Request, Response } from "express";
import alertService from "../helpers/alerts.helpers";

class AlertsController {
  getAlerts = async (req: Request, res: Response) => {
    const { severity, acknowledged, page, limit } = req.query;
    try {
      const result = await alertService.getAlerts({
        severity: severity as string,
        acknowledged: acknowledged as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return res.status(500).json({ error: "Failed to fetch alerts" });
    }
  };

  getAlertById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const alert = await alertService.getAlertById(id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      return res.status(200).json(alert);
    } catch (error) {
      console.error("Error fetching alert:", error);
      return res.status(500).json({ error: "Failed to fetch alert" });
    }
  };

  acknowledgeAlert = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const updated = await alertService.acknowledgeAlert(id);
      if (!updated) {
        return res.status(404).json({ error: "Alert not found" });
      }
      return res.status(200).json({ message: "Alert acknowledged", alert: updated });
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      return res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  };
}

export default new AlertsController();

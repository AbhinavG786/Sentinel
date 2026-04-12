import { Request, Response } from "express";
import statsService from "../helpers/stats.helpers";

class StatsController {
  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const stats = await statsService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  };
}

export default new StatsController();

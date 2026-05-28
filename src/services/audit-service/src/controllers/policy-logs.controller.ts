import { Request, Response } from "express";
import policyLogsService from "../helpers/policy-logs.helpers";

class PolicyLogsController {
  getPolicyLogs = async (req: Request, res: Response) => {
    const { policy_id, action_taken, page, limit } = req.query;
    try {
      const result = await policyLogsService.getPolicyLogs({
        policy_id: policy_id as string,
        action_taken: action_taken as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching policy logs:", error);
      return res.status(500).json({ error: "Failed to fetch policy logs" });
    }
  };
}

export default new PolicyLogsController();

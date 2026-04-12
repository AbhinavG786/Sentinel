import { Request, Response } from "express";
import policyService from "../helpers/policies.helpers";

class PoliciesController {
  getAllPolicies = async (req: Request, res: Response) => {
    try {
      const policies = await policyService.getAllPolicies();
      return res.status(200).json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      return res.status(500).json({ error: "Failed to fetch policies" });
    }
  };

  getPolicyById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const policy = await policyService.getPolicyById(id);
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      return res.status(200).json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      return res.status(500).json({ error: "Failed to fetch policy" });
    }
  };

  createPolicy = async (req: Request, res: Response) => {
    const { name, description, blocked_keywords, allowed_domains, created_by } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Policy name is required" });
    }
    try {
      const policy = await policyService.createPolicy({
        name,
        description,
        blocked_keywords,
        allowed_domains,
        created_by,
      });
      return res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating policy:", error);
      return res.status(500).json({ error: "Failed to create policy" });
    }
  };

  updatePolicy = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updated = await policyService.updatePolicy(id, updates);
      if (!updated) {
        return res.status(404).json({ error: "Policy not found" });
      }
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating policy:", error);
      return res.status(500).json({ error: "Failed to update policy" });
    }
  };

  deletePolicy = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deleted = await policyService.deletePolicy(id);
      if (!deleted) {
        return res.status(404).json({ error: "Policy not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting policy:", error);
      return res.status(500).json({ error: "Failed to delete policy" });
    }
  };
}

export default new PoliciesController();

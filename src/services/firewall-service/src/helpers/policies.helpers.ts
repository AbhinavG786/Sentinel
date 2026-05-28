import { db } from "@shared/utils";

class PolicyService {
  getAllPolicies = async () => {
    return db("knowledge_policies")
      .select("*")
      .orderBy("created_at", "desc");
  };

  getPolicyById = async (id: string) => {
    return db("knowledge_policies").where({ id }).first();
  };

  createPolicy = async (policy: {
    name: string;
    description?: string;
    blocked_keywords?: string[];
    allowed_domains?: string[];
    created_by?: string;
  }) => {
    const [newPolicy] = await db("knowledge_policies")
      .insert({
        name: policy.name,
        description: policy.description || null,
        blocked_keywords: policy.blocked_keywords || [],
        allowed_domains: policy.allowed_domains || [],
        created_by: policy.created_by || null,
      })
      .returning("*");
    return newPolicy;
  };

  updatePolicy = async (
    id: string,
    updates: {
      name?: string;
      description?: string;
      blocked_keywords?: string[];
      allowed_domains?: string[];
    }
  ) => {
    const [updated] = await db("knowledge_policies")
      .where({ id })
      .update(updates)
      .returning("*");
    return updated;
  };

  deletePolicy = async (id: string) => {
    return db("knowledge_policies").where({ id }).del();
  };
}

export default new PolicyService();

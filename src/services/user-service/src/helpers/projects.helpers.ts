import { db } from "@shared/utils";
import crypto from "crypto";

class ProjectsService {
  generateApiKey = () => {
    return `sk_live_${crypto.randomBytes(24).toString("hex")}`;
  };

  createProject = async (name: string, userId: string) => {
    const apiKey = this.generateApiKey();
    const [project] = await db("projects")
      .insert({
        name,
        user_id: userId,
        api_key: apiKey,
      })
      .returning("*");
    return project;
  };

  getUserProjects = async (userId: string) => {
    return db("projects").where({ user_id: userId }).orderBy("created_at", "desc");
  };

  getProjectById = async (id: string, userId: string) => {
    return db("projects").where({ id, user_id: userId }).first();
  };

  revokeApiKey = async (id: string, userId: string) => {
    const newApiKey = this.generateApiKey();
    const [project] = await db("projects")
      .where({ id, user_id: userId })
      .update({ api_key: newApiKey, updated_at: new Date() })
      .returning("*");
    return project;
  };

  deleteProject = async (id: string, userId: string) => {
    return db("projects").where({ id, user_id: userId }).del();
  };
}

export default new ProjectsService();

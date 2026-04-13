import { Request, Response } from "express";
import projectsService from "../helpers/projects.helpers";

class ProjectsController {
  createProject = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const userId = (req as any).user?.id; // Assuming auth middleware attaches user

      if (!name) {
        return res.status(400).json({ error: "Project name is required" });
      }

      const project = await projectsService.createProject(name, userId);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  };

  getUserProjects = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const projects = await projectsService.getUserProjects(userId);
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  };

  getProjectById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const project = await projectsService.getProjectById(id, userId);

      if (!project) return res.status(404).json({ error: "Project not found" });
      res.status(200).json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  };

  revokeApiKey = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const project = await projectsService.revokeApiKey(id, userId);

      if (!project) return res.status(404).json({ error: "Project not found" });
      res.status(200).json(project);
    } catch (error) {
      console.error("Error revoking API key:", error);
      res.status(500).json({ error: "Failed to revoke API key" });
    }
  };

  deleteProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const deletedCount = await projectsService.deleteProject(id, userId);

      if (!deletedCount) return res.status(404).json({ error: "Project not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  };
}

export default new ProjectsController();

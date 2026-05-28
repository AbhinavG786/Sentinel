import { Router } from "express";
import projectsController from "../controllers/projects.controller";
import { authenticate } from "@shared/utils";

const router = Router();

// Secure all project endpoints with user authentication
router.use(authenticate);

router.post("/", projectsController.createProject);
router.get("/", projectsController.getUserProjects);
router.get("/:id", projectsController.getProjectById);
router.post("/:id/revoke", projectsController.revokeApiKey);
router.delete("/:id", projectsController.deleteProject);

export default router;

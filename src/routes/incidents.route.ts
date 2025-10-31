import incidentsController from "../controllers/incidents.controller";
import { rateLimiter } from "../middlewares/rateLimiter";
import { authenticate,authorize } from "../middlewares/authMiddleware";
import { Router } from "express";

const router = Router();
router.post("/",authenticate,authorize("admin","user"), incidentsController.createIncident);
router.get("/", rateLimiter({ windowInSeconds: 60, maxRequests: 10 }),authenticate, incidentsController.getAllIncidents);
router.get("/:id", incidentsController.getIncidentById);
router.put("/:id", incidentsController.updateIncident);
router.delete("/:id", incidentsController.deleteIncident);
export default router;
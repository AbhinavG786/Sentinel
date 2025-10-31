import incidentsController from "../controllers/incidents.controller";
import { Router } from "express";
const router = Router();
router.post("/", incidentsController.createIncident);
router.get("/", incidentsController.getAllIncidents);
router.get("/:id", incidentsController.getIncidentById);
router.put("/:id", incidentsController.updateIncident);
router.delete("/:id", incidentsController.deleteIncident);
export default router;
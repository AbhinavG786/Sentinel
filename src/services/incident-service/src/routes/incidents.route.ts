import incidentsController from "../controllers/incidents.controller";
import { Router } from "express";

const incidentsRouter = Router();
incidentsRouter.post("/", incidentsController.createIncident);
incidentsRouter.get("/", incidentsController.getAllIncidents);
incidentsRouter.get("/:id", incidentsController.getIncidentById);
incidentsRouter.patch("/:id", incidentsController.updateIncident);
incidentsRouter.delete("/:id", incidentsController.deleteIncident);
export default incidentsRouter;

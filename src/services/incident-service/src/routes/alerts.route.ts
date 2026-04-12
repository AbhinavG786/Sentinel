import { Router } from "express";
import alertsController from "../controllers/alerts.controller";

const alertsRouter = Router();
alertsRouter.get("/", alertsController.getAlerts);
alertsRouter.get("/:id", alertsController.getAlertById);
alertsRouter.patch("/:id/ack", alertsController.acknowledgeAlert);

export default alertsRouter;

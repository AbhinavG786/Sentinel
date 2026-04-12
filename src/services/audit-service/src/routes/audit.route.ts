import { Router } from "express";
import auditController from "../controllers/audit.controller";

const auditRouter = Router();
auditRouter.get("/", auditController.getAuditLogs);
auditRouter.get("/entity/:id", auditController.getAuditLogsByEntity);

export default auditRouter;

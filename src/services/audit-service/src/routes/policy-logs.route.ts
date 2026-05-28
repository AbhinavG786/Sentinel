import { Router } from "express";
import policyLogsController from "../controllers/policy-logs.controller";

const policyLogsRouter = Router();
policyLogsRouter.get("/", policyLogsController.getPolicyLogs);

export default policyLogsRouter;

import { Router } from "express";
import statsController from "../controllers/stats.controller";

const statsRouter = Router();
statsRouter.get("/", statsController.getDashboardStats);

export default statsRouter;

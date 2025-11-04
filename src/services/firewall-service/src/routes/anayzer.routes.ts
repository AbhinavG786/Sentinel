import {Router} from "express";
import { analyzeIncident } from "../ai/analyzer";

const router = Router();
router.post("/analyze", analyzeIncident);

export default router;
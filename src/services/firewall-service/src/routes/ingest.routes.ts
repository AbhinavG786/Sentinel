import { Router } from "express";
import { ingestLogs } from "../controllers/ingestLogs";
const router = Router();

router.post("/ingest", ingestLogs);

export default router;

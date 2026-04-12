import { Router } from "express";
import { ingestLogs } from "../controllers/ingestLogs";
import { validateApiKey } from "../middlewares/apiKeyAuth";

const router = Router();

router.post("/ingest", validateApiKey, ingestLogs);

export default router;

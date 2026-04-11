import { Router } from "express";
import { analyzeIncident } from "../ai/analyzer";

const router = Router();
router.post("/analyze", async (req, res) => {
  try {
    const result = await analyzeIncident(req.body.incident);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;
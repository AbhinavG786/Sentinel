import { Request, Response, Router } from "express";
import axios from "axios";
import { authenticate } from "@shared/utils";
import { SERVICES } from "../utils/serviceRegistry";

const router = Router();

// All alerts routes require auth
router.use(authenticate);

// List alerts
router.get("/", async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.get(`${SERVICES.incidents}/alerts`, {
      headers: cleanHeaders,
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch alerts" });
  }
});

// Get alert by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.get(`${SERVICES.incidents}/alerts/${req.params.id}`, {
      headers: cleanHeaders,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch alert" });
  }
});

// Acknowledge alert
router.patch("/:id/ack", async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.patch(
      `${SERVICES.incidents}/alerts/${req.params.id}/ack`,
      req.body,
      { headers: cleanHeaders }
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to acknowledge alert" });
  }
});

export default router;

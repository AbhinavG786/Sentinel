import { Request, Response, Router } from "express";
import axios from "axios";
import { rateLimiter } from "../middlewares/rateLimiter";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";
import { authenticate, authorize } from "@shared/utils";
import { SERVICES } from "../utils/serviceRegistry";

const router = Router();

// === Incidents CRUD ===

router.get("/", rateLimiter({ windowInSeconds: 60, maxRequests: 10 }), authenticate, authorize("admin", "user"), cacheMiddleware(30), async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.get(`${SERVICES.incidents}/incidents`, {
      headers: cleanHeaders,
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch incidents" });
  }
});

router.post("/", authenticate, authorize("admin", "user"), async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.post(`${SERVICES.incidents}/incidents`, req.body, {
      headers: cleanHeaders,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to create incident" });
  }
});

router.get("/:id", cacheMiddleware(15), async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.get(`${SERVICES.incidents}/incidents/${req.params.id}`, {
      headers: cleanHeaders,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch incident" });
  }
});

router.patch("/:id", authenticate, authorize("admin", "user"), async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.patch(`${SERVICES.incidents}/incidents/${req.params.id}`, req.body, {
      headers: cleanHeaders,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to update incident" });
  }
});

router.delete("/:id", authenticate, authorize("admin", "user"), async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.delete(`${SERVICES.incidents}/incidents/${req.params.id}`, {
      headers: cleanHeaders,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to delete incident" });
  }
});

export default router;

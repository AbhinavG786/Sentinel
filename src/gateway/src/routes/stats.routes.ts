import { Request, Response, Router } from "express";
import axios from "axios";
import { authenticate, authorize } from "@shared/utils";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";
import { SERVICES } from "../utils/serviceRegistry";

const router = Router();

// Stats (public — no auth for dashboard overview)
router.get("/", cacheMiddleware(10), async (req: Request, res: Response) => {
  try {
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios.get(`${SERVICES.incidents}/stats`, {
      headers: cleanHeaders,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch stats" });
  }
});

export default router;

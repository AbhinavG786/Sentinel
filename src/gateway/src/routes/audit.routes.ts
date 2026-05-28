import { Request, Response, Router } from "express";
import axios from "axios";
import { authenticate } from "@shared/utils";
import { SERVICES } from "../utils/serviceRegistry";

const router = Router();

// Proxy all audit-related requests to the audit service
router.use(authenticate, async (req: Request, res: Response) => {
  try {
    const target = `${SERVICES.audit}${req.originalUrl}`;
    const { host, "content-length": _, ...cleanHeaders } = req.headers;
    const response = await axios({
      method: req.method as any,
      url: target,
      data: req.body,
      headers: { ...cleanHeaders },
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error("Audit proxy error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Error forwarding request to audit service",
    });
  }
});

export default router;

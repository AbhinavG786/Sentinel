import { Request, Response, Router } from "express";
import axios from "axios";
import { SERVICES } from "../utils/serviceRegistry";
import { rateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.use(rateLimiter({ windowInSeconds: 60, maxRequests: 10 }));

router.use(async (req: Request, res: Response) => {
  try {
    const target = `${SERVICES.firewall}${req.originalUrl}`;
    const response = await axios({
      method: req.method as any,
      url: target,
      data: req.body,
      headers: { ...req.headers },
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error("Firewall proxy error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Error forwarding request to firewall service",
    });
  }
});

export default router;

import { Request, Response, Router, RequestHandler } from "express";
import axios from "axios";
import { rateLimiter } from "../middlewares/rateLimiter";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";
import { authenticate,authorize } from "../middlewares/authMiddleware";
import { SERVICES } from "../utils/serviceRegistry";

const router = Router();


router.get("/", rateLimiter({windowInSeconds: 60,maxRequests: 10}),authenticate, authorize("admin", "user"), cacheMiddleware(30), async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${SERVICES.incidents}/incidents`, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch incidents" });
  }
});

router.post("/", authenticate, authorize("admin", "user"), async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${SERVICES.incidents}/incidents`, req.body, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to create incident" });
  }
});

router.get("/:id", cacheMiddleware(15) , async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${SERVICES.incidents}/incidents/${req.params.id}`, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to fetch incident" });
  }
});

router.patch("/:id", authenticate,
  authorize("admin", "user"), async (req: Request, res: Response) => {
  try {
    const response = await axios.patch(`${SERVICES.incidents}/incidents/${req.params.id}`, req.body, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to update incident" });
  }
});

router.delete("/:id", authenticate,
  authorize("admin", "user"), async (req: Request, res: Response) => {
  try {
    const response = await axios.delete(`${SERVICES.incidents}/incidents/${req.params.id}`, {
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: "Failed to delete incident" });
  }
});



// // Apply global rate limit for all routes
// router.use(rateLimiter({ windowInSeconds: 60, maxRequests: 30 }));

// // Selective caching for GETs
// router.get("/incidents", cacheMiddleware(30) as unknown as RequestHandler, async (req, res) => {
//   try {
//     const target = `${SERVICES.incidents}${req.originalUrl}`;
//     const response = await axios.get(target, { headers: req.headers });
//     res.status(response.status).json(response.data);
//   } catch (error: any) {
//     res.status(error.response?.status || 500).json({ error: "Failed to fetch incidents" });
//   }
// });

// // Protected route - auth required
// router.post("/incidents", authenticate, async (req: Request, res: Response) => {
//   try {
//     const target = `${SERVICES.incidents}${req.originalUrl}`;
//     const response = await axios.post(target, req.body, { headers: req.headers });
//     res.status(response.status).json(response.data);
//   } catch (error: any) {
//     res.status(error.response?.status || 500).json({ error: "Error creating incident" });
//   }
// });

// // Default fallback (forwards other methods automatically)
// router.use(async (req: Request, res: Response) => {
//   try {
//     const target = `${SERVICES.incidents}${req.originalUrl}`;
//     const response = await axios({
//       method: req.method as any,
//       url: target,
//       data: req.body,
//       headers: req.headers,
//     });
//     res.status(response.status).json(response.data);
//   } catch (error: any) {
//     res.status(error.response?.status || 500).json({
//       error: "Incident proxy error",
//     });
//   }
// });

export default router;

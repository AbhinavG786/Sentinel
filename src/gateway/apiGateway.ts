import express, { Request, Response } from "express";
import { rateLimiter } from "../middlewares/rateLimiter";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";
import axios from "axios";

const router = express.Router();

// Example service registry (could later come from env or service discovery)
const SERVICES = {
  incidents: process.env.INCIDENT_SERVICE_URL || "http://localhost:5001",
  users: process.env.USER_SERVICE_URL || "http://localhost:5002",
  ai: process.env.AI_SERVICE_URL || "http://localhost:5003",
};

// Logging middleware (optional)
router.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// Global rate limit
router.use(rateLimiter({ windowInSeconds: 60, maxRequests: 30 }));

// ---------------------------
// 🚨 INCIDENTS SERVICE ROUTES
// ---------------------------
(async function registerIncidentsRoutes() {
  try {
    const mw = await cacheMiddleware(30); // Cache GETs for 30 sec
    router.use(
      "/incidents",
      mw,
      async (req: Request, res: Response) => {
        try {
          const target = `${SERVICES.incidents}${req.originalUrl}`;
          const response = await axios({
            method: req.method as any,
            url: target,
            data: req.body,
            headers: { ...req.headers },
          });
          res.status(response.status).json(response.data);
        } catch (error: any) {
          console.error(error.message);
          res.status(error.response?.status || 500).json({
            error: "Error forwarding request to incident service",
          });
        }
      }
    );
  } catch (err) {
    console.error("Failed to initialize incidents routes cache middleware:", err);
  }
})();

// ---------------------------
// 👤 USERS SERVICE ROUTES
// ---------------------------
router.use("/users", async (req: Request, res: Response) => {
  try {
    const target = `${SERVICES.users}${req.originalUrl}`;
    const response = await axios({
      method: req.method as any,
      url: target,
      data: req.body,
      headers: { ...req.headers },
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: "Error forwarding request to user service",
    });
  }
});

export default router;

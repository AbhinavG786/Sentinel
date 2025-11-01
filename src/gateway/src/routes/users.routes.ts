import { Request, Response, Router } from "express";
import axios from "axios";
import { rateLimiter } from "../middlewares/rateLimiter";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { SERVICES } from "../utils/serviceRegistry";

const router = Router();

router.post(
  "/register",
  rateLimiter({ windowInSeconds: 60, maxRequests: 5 }),
  async (req: Request, res: Response) => {
    try {
      const response = await axios.post(
        `${SERVICES.users}/users/register`,
        req.body,
        {
          headers: req.headers,
        }
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      res
        .status(error.response?.status || 500)
        .json({ error: "Failed to register user" });
    }
  }
);

router.post(
  "/login",
  rateLimiter({ windowInSeconds: 60, maxRequests: 5 }),
  async (req: Request, res: Response) => {
    try {
      const response = await axios.post(
        `${SERVICES.users}/users/login`,
        req.body,
        {
          headers: req.headers,
        }
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      res
        .status(error.response?.status || 500)
        .json({ error: "Failed to login" });
    }
  }
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      const response = await axios.get(`${SERVICES.users}/users`, {
        headers: req.headers,
      });
      res.status(response.status).json(response.data);
    } catch (error: any) {
      res
        .status(error.response?.status || 500)
        .json({ error: "Failed to fetch users" });
    }
  }
);
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      `${SERVICES.users}/users/${req.params.id}`,
      {
        headers: req.headers,
      }
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res
      .status(error.response?.status || 500)
      .json({ error: "Failed to fetch user" });
  }
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const response = await axios.patch(
      `${SERVICES.users}/users/${req.params.id}`,
      req.body,
      {
        headers: req.headers,
      }
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res
      .status(error.response?.status || 500)
      .json({ error: "Failed to update user" });
  }
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const response = await axios.delete(
      `${SERVICES.users}/users/${req.params.id}`,
      {
        headers: req.headers,
      }
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res
      .status(error.response?.status || 500)
      .json({ error: "Failed to delete user" });
  }
});

// router.use(rateLimiter({ windowInSeconds: 60, maxRequests: 50 }));

// router.use(async (req: Request, res: Response) => {
//   try {
//     const target = `${SERVICES.users}${req.originalUrl}`;
//     const response = await axios({
//       method: req.method as any,
//       url: target,
//       data: req.body,
//       headers: { ...req.headers },
//     });

//     res.status(response.status).json(response.data);
//   } catch (error: any) {
//     res.status(error.response?.status || 500).json({
//       error: "Error forwarding request to user service",
//     });
//   }
// });

export default router;

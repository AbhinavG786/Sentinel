import usersController from "../controllers/users.controller";
import { Router } from "express";
const router = Router();
router.get("/", usersController.getAllUsers);
export default router;
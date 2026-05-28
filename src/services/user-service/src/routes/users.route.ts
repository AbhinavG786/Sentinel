import usersController from "../controllers/users.controller";
import { Router } from "express";
const router = Router();
router.post("/register",usersController.register)
router.post("/login",usersController.login)
router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);
export default router;
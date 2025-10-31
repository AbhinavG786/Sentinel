import userRoutes from  "./users.route"
import incidentRoutes from "./incidents.route"
import { Router } from "express"
const router=Router();

router.use("/user",userRoutes);
router.use("/incident",incidentRoutes);

export default router
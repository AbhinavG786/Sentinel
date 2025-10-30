import userRoutes from  "./users.route"
import { Router } from "express"
const router=Router();

router.use("/user",userRoutes);

export default router
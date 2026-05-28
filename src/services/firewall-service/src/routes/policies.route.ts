import { Router } from "express";
import policiesController from "../controllers/policies.controller";

const policiesRouter = Router();
policiesRouter.get("/", policiesController.getAllPolicies);
policiesRouter.get("/:id", policiesController.getPolicyById);
policiesRouter.post("/", policiesController.createPolicy);
policiesRouter.patch("/:id", policiesController.updatePolicy);
policiesRouter.delete("/:id", policiesController.deletePolicy);

export default policiesRouter;

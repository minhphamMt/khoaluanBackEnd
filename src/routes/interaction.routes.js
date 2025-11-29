import { Router } from "express";
import interactionController from "../controllers/interaction.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/listen", authMiddleware, interactionController.listen);
router.post("/like", authMiddleware, interactionController.like);
router.post("/skip", authMiddleware, interactionController.skip);
router.get("/history", authMiddleware, interactionController.history);

export default router;

import { Router } from "express";
import recommendationController from "../controllers/recommendation.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/content-based/:songId", recommendationController.contentBased);
router.get("/user-based", authMiddleware, recommendationController.userBased);
router.get("/trending", recommendationController.trending);
router.get("/weekly", recommendationController.weekly);

export default router;

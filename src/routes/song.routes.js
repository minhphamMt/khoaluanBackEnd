import { Router } from "express";
import songController from "../controllers/song.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", songController.list);
router.get("/:id", songController.get);
router.post("/saveFromSpotify", authMiddleware, songController.saveFromSpotify);

export default router;

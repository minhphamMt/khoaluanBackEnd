import { Router } from "express";
import audioController from "../controllers/audio.controller.js";

const router = Router();

router.get("/:songId", audioController.getAudio);

export default router;

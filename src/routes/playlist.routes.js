import { Router } from "express";
import playlistController from "../controllers/playlist.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, playlistController.create);
router.get("/mine", authMiddleware, playlistController.mine);
router.get("/:id", authMiddleware, playlistController.getById);
router.post("/:id/add", authMiddleware, playlistController.addSong);
router.delete("/:id/remove", authMiddleware, playlistController.removeSong);
router.delete("/:id", authMiddleware, playlistController.deletePlaylist);

export default router;

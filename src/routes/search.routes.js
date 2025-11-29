import { Router } from "express";
import searchController from "../controllers/search.controller.js";

const router = Router();

router.get("/spotify", searchController.spotify);
router.get("/local", searchController.local);

export default router;

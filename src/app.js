import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";
import searchRoutes from "./routes/search.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import interactionRoutes from "./routes/interaction.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import audioRoutes from "./routes/audio.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/auth", authRoutes);
app.use("/songs", songRoutes);
app.use("/search", searchRoutes);
app.use("/playlists", playlistRoutes);
app.use("/interactions", interactionRoutes);
app.use("/recommend", recommendationRoutes);
app.use("/audio", audioRoutes);

// test API
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

export default app;

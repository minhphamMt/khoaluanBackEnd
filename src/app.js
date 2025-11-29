import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/auth", authRoutes);

// test API
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

export default app;

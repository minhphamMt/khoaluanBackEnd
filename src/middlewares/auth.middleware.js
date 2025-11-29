import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";
import userRepository from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) return errorResponse(res, "Authorization token missing", 401);
    if (!JWT_SECRET)
      return errorResponse(res, "JWT secret not configured", 500);

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userRepository.findById(decoded.id);
    if (!user) return errorResponse(res, "User not found", 401);

    req.user = { id: user.id, email: user.email };
    return next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Token expired" : "Unauthorized";
    return errorResponse(res, message, 401);
  }
};

export default authMiddleware;

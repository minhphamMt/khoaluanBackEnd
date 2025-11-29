import authService from "../services/auth.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const authController = {
  register: async (req, res) => {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, "Registration successful", result, 201);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Registration failed",
        error.status || 400
      );
    }
  },

  login: async (req, res) => {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, "Login successful", result);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Login failed",
        error.status || 400
      );
    }
  },

  me: async (req, res) => {
    try {
      const user = await authService.me(req.user.id);
      return successResponse(res, "User profile", user);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Unable to fetch profile",
        error.status || 400
      );
    }
  },
};

export default authController;

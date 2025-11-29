import recommendationService from "../services/recommendation.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const recommendationController = {
  contentBased: async (req, res) => {
    try {
      const data = await recommendationService.contentBased(req.params.songId);
      return successResponse(res, "Content-based recommendations", data);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch recommendations",
        error.status || 400
      );
    }
  },

  userBased: async (req, res) => {
    try {
      const data = await recommendationService.userBased(req.user.id);
      return successResponse(res, "User-based recommendations", data);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch recommendations",
        error.status || 400
      );
    }
  },

  trending: async (req, res) => {
    try {
      const data = await recommendationService.trending();
      return successResponse(res, "Trending songs", data);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch trending songs",
        error.status || 400
      );
    }
  },

  weekly: async (req, res) => {
    try {
      const data = await recommendationService.weekly();
      return successResponse(res, "Weekly highlights", data);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch weekly recommendations",
        error.status || 400
      );
    }
  },
};

export default recommendationController;

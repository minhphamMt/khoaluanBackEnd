import interactionService from "../services/interaction.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const interactionController = {
  listen: async (req, res) => {
    try {
      const interaction = await interactionService.recordInteraction(
        req.user.id,
        {
          songId: req.body.songId,
          action: "listen",
        }
      );
      return successResponse(res, "Listen recorded", interaction, 201);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to record listen",
        error.status || 400
      );
    }
  },

  like: async (req, res) => {
    try {
      const interaction = await interactionService.recordInteraction(
        req.user.id,
        {
          songId: req.body.songId,
          action: "like",
        }
      );
      return successResponse(res, "Like recorded", interaction, 201);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to record like",
        error.status || 400
      );
    }
  },

  skip: async (req, res) => {
    try {
      const interaction = await interactionService.recordInteraction(
        req.user.id,
        {
          songId: req.body.songId,
          action: "skip",
        }
      );
      return successResponse(res, "Skip recorded", interaction, 201);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to record skip",
        error.status || 400
      );
    }
  },

  history: async (req, res) => {
    try {
      const history = await interactionService.getHistory(req.user.id);
      return successResponse(res, "Interaction history", history);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch history",
        error.status || 400
      );
    }
  },
};

export default interactionController;

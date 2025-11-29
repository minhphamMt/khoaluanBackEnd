import audioService from "../services/audio.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const audioController = {
  getAudio: async (req, res) => {
    try {
      const audio = await audioService.getAudio(req.params.songId);
      return successResponse(res, "Audio link", audio);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch audio",
        error.status || 400
      );
    }
  },
};

export default audioController;

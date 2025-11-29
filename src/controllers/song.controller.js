import songService from "../services/song.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const songController = {
  list: async (req, res) => {
    try {
      const songs = await songService.listSongs();
      return successResponse(res, "Songs fetched", songs);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch songs",
        error.status || 400
      );
    }
  },

  get: async (req, res) => {
    try {
      const song = await songService.getSong(req.params.id);
      return successResponse(res, "Song fetched", song);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch song",
        error.status || 400
      );
    }
  },

  saveFromSpotify: async (req, res) => {
    try {
      const song = await songService.saveFromSpotify(req.body);
      return successResponse(res, "Song saved", song, 201);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to save song",
        error.status || 400
      );
    }
  },
};

export default songController;

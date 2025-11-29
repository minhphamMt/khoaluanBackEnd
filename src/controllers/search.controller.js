import searchService from "../services/search.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const searchController = {
  spotify: async (req, res) => {
    try {
      const results = await searchService.searchSpotify(req.query.q);
      return successResponse(res, "Spotify search results", results);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Spotify search failed",
        error.status || 400
      );
    }
  },

  local: async (req, res) => {
    try {
      const results = await searchService.searchLocal(req.query.q);
      return successResponse(res, "Local search results", results);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Local search failed",
        error.status || 400
      );
    }
  },
};

export default searchController;

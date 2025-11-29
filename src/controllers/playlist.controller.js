import playlistService from "../services/playlist.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const playlistController = {
  create: async (req, res) => {
    try {
      const playlist = await playlistService.create(req.user.id, req.body);
      return successResponse(res, "Playlist created", playlist, 201);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to create playlist",
        error.status || 400
      );
    }
  },

  mine: async (req, res) => {
    try {
      const playlists = await playlistService.getMine(req.user.id);
      return successResponse(res, "Your playlists", playlists);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch playlists",
        error.status || 400
      );
    }
  },

  getById: async (req, res) => {
    try {
      const playlist = await playlistService.getById(
        parseInt(req.params.id, 10)
      );
      return successResponse(res, "Playlist fetched", playlist);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to fetch playlist",
        error.status || 400
      );
    }
  },

  addSong: async (req, res) => {
    try {
      const playlist = await playlistService.addSong(
        parseInt(req.params.id, 10),
        req.user.id,
        req.body.songId
      );
      return successResponse(res, "Song added to playlist", playlist);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to add song",
        error.status || 400
      );
    }
  },

  removeSong: async (req, res) => {
    try {
      const playlist = await playlistService.removeSong(
        parseInt(req.params.id, 10),
        req.user.id,
        req.body.songId
      );
      return successResponse(res, "Song removed from playlist", playlist);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to remove song",
        error.status || 400
      );
    }
  },

  deletePlaylist: async (req, res) => {
    try {
      const playlist = await playlistService.deletePlaylist(
        parseInt(req.params.id, 10),
        req.user.id
      );
      return successResponse(res, "Playlist deleted", playlist);
    } catch (error) {
      return errorResponse(
        res,
        error.message || "Failed to delete playlist",
        error.status || 400
      );
    }
  },
};

export default playlistController;

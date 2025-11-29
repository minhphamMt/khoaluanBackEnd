import playlistRepository from "../repositories/playlist.repository.js";
import songRepository from "../repositories/song.repository.js";

const playlistService = {
  create: async (userId, { name, imageUrl }) => {
    if (!name) throw new Error("Playlist name is required");
    return playlistRepository.create({ userId, name, imageUrl });
  },

  getMine: (userId) => playlistRepository.findByUser(userId),

  getById: async (id) => {
    const playlist = await playlistRepository.findById(id);
    if (!playlist) {
      const error = new Error("Playlist not found");
      error.status = 404;
      throw error;
    }
    return playlist;
  },

  addSong: async (playlistId, userId, songId) => {
    const playlist = await playlistRepository.findByIdAndUser(
      playlistId,
      userId
    );
    if (!playlist) {
      const error = new Error("Playlist not found or not owned by user");
      error.status = 404;
      throw error;
    }
    const song = await songRepository.getById(songId);
    if (!song) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }
    await playlistRepository.addSong(playlistId, songId);
    return playlistRepository.findById(playlistId);
  },

  removeSong: async (playlistId, userId, songId) => {
    const playlist = await playlistRepository.findByIdAndUser(
      playlistId,
      userId
    );
    if (!playlist) {
      const error = new Error("Playlist not found or not owned by user");
      error.status = 404;
      throw error;
    }
    await playlistRepository.removeSong(playlistId, songId);
    return playlistRepository.findById(playlistId);
  },

  deletePlaylist: async (playlistId, userId) => {
    const playlist = await playlistRepository.findByIdAndUser(
      playlistId,
      userId
    );
    if (!playlist) {
      const error = new Error("Playlist not found or not owned by user");
      error.status = 404;
      throw error;
    }
    await playlistRepository.deletePlaylist(playlistId);
    return playlist;
  },
};

export default playlistService;

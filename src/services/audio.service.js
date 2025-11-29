import songRepository from "../repositories/song.repository.js";

const audioService = {
  getAudio: async (songId) => {
    const song = await songRepository.getById(songId);
    if (!song) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }
    return { audioUrl: song.audioUrl, previewUrl: song.previewUrl };
  },
};

export default audioService;

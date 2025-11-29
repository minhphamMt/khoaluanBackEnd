import interactionRepository from "../repositories/interaction.repository.js";
import songRepository from "../repositories/song.repository.js";

const actionWeights = {
  listen: 1,
  like: 2,
  skip: -1,
};

const interactionService = {
  recordInteraction: async (userId, { songId, action }) => {
    if (!songId || !action) throw new Error("songId and action are required");
    const song = await songRepository.getById(songId);
    if (!song) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }
    const weight = actionWeights[action] ?? 1;
    return interactionRepository.create({ userId, songId, action, weight });
  },

  getHistory: (userId) => interactionRepository.getUserHistory(userId),
};

export default interactionService;

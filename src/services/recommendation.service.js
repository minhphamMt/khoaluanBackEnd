import interactionRepository from "../repositories/interaction.repository.js";
import songRepository from "../repositories/song.repository.js";

const featureKeys = [
  "danceability",
  "energy",
  "valence",
  "tempo",
  "acousticness",
  "instrumentalness",
  "liveness",
  "speechiness",
];

const calculateDistance = (a, b) => {
  let sum = 0;
  featureKeys.forEach((key) => {
    const diff = (a?.[key] || 0) - (b?.[key] || 0);
    sum += diff * diff;
  });
  return Math.sqrt(sum);
};

const recommendationService = {
  contentBased: async (songId) => {
    const target = await songRepository.getById(songId);
    if (!target) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }

    if (!target.audioFeatures) {
      const artistIds = target.artists.map((a) => a.artistId);
      const fallback = await songRepository.getSongsByArtistIds(artistIds);
      return fallback.filter((s) => s.id !== songId).slice(0, 20);
    }

    const candidates = await songRepository.getSongsWithAudioFeatures();
    const scored = candidates
      .filter((song) => song.id !== songId)
      .map((song) => ({
        song,
        distance: calculateDistance(target.audioFeatures, song.audioFeatures),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20)
      .map((item) => item.song);

    return scored;
  },

  userBased: async (userId) => {
    const interactions = await interactionRepository.getUserInteractions(
      userId
    );
    if (!interactions.length) return recommendationService.trending();

    const interactedSongIds = new Set(interactions.map((i) => i.songId));
    const artistIds = new Set();
    interactions.forEach((interaction) => {
      interaction.song.artists.forEach((sa) => artistIds.add(sa.artistId));
    });

    const candidates = await songRepository.getSongsByArtistIds(
      Array.from(artistIds)
    );
    const filtered = candidates.filter(
      (song) => !interactedSongIds.has(song.id)
    );
    if (filtered.length) return filtered.slice(0, 20);

    return recommendationService.trending();
  },

  trending: async () => {
    const grouped = await interactionRepository.getTrending(20);
    const songs = await songRepository.getSongsByIds(
      grouped.map((g) => g.songId)
    );
    const songMap = new Map(songs.map((s) => [s.id, s]));
    return grouped.map((g) => songMap.get(g.songId)).filter(Boolean);
  },

  weekly: async () => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const grouped = await interactionRepository.getTrending(20, since);
    const songs = await songRepository.getSongsByIds(
      grouped.map((g) => g.songId)
    );
    const songMap = new Map(songs.map((s) => [s.id, s]));
    return grouped.map((g) => songMap.get(g.songId)).filter(Boolean);
  },
};

export default recommendationService;

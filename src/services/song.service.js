import artistRepository from "../repositories/artist.repository.js";
import songRepository from "../repositories/song.repository.js";
import spotifyService from "./spotify.service.js";

const songService = {
  listSongs: async () => {
    return songRepository.getAll();
  },

  getSong: async (id) => {
    const song = await songRepository.getById(id);
    if (!song) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }
    return song;
  },

  saveFromSpotify: async ({ trackId, audioUrl }) => {
    if (!trackId) {
      throw new Error("trackId is required");
    }

    const track = await spotifyService.getTrack(trackId);
    const audioFeatures = await spotifyService.getAudioFeatures(trackId);

    const songData = {
      id: track.id,
      title: track.name,
      previewUrl: track.preview_url,
      audioUrl: audioUrl || null,
      imageUrl: track.album?.images?.[0]?.url,
      durationMs: track.duration_ms,
      popularity: track.popularity,
      albumId: track.album?.id,
    };

    const artistData = track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url,
    }));

    await artistRepository.upsertMany(artistData);
    await songRepository.upsertSong(songData);
    await songRepository.addSongArtists(
      track.id,
      artistData.map((a) => a.id)
    );

    const audioFeatureData = {
      danceability: audioFeatures.danceability,
      energy: audioFeatures.energy,
      valence: audioFeatures.valence,
      tempo: audioFeatures.tempo,
      acousticness: audioFeatures.acousticness,
      instrumentalness: audioFeatures.instrumentalness,
      liveness: audioFeatures.liveness,
      speechiness: audioFeatures.speechiness,
    };
    await songRepository.upsertAudioFeatures(track.id, audioFeatureData);

    return songRepository.getById(track.id);
  },
};

export default songService;

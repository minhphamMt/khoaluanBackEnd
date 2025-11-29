import songRepository from "../repositories/song.repository.js";
import spotifyService from "./spotify.service.js";

const searchService = {
  searchSpotify: async (query) => {
    if (!query) throw new Error("Query is required");
    return spotifyService.searchTracks(query);
  },

  searchLocal: async (query) => {
    if (!query) throw new Error("Query is required");
    return songRepository.search(query);
  },
};

export default searchService;

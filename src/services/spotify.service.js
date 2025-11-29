import axios from "axios";

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token",
} = process.env;

class SpotifyService {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = null;
  }

  async getAccessToken() {
    const now = Date.now();
    if (
      this.token &&
      this.tokenExpiresAt &&
      now < this.tokenExpiresAt - 60000
    ) {
      return this.token;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error("Spotify credentials are not configured");
    }

    const credentials = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const response = await axios.post(SPOTIFY_TOKEN_URL, params.toString(), {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    this.token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
    return this.token;
  }

  async getHeaders() {
    const accessToken = await this.getAccessToken();
    return { Authorization: `Bearer ${accessToken}` };
  }

  async searchTracks(query) {
    const headers = await this.getHeaders();
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers,
      params: { q: query, type: "track", limit: 20 },
    });
    return response.data.tracks.items;
  }

  async getTrack(id) {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers,
      }
    );
    return response.data;
  }

  async getAudioFeatures(id) {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `https://api.spotify.com/v1/audio-features/${id}`,
      {
        headers,
      }
    );
    return response.data;
  }
}

const spotifyService = new SpotifyService();
export default spotifyService;

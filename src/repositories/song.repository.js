import { prisma } from "../prisma/prisma.js";

const songInclude = {
  artists: { include: { artist: true } },
  audioFeatures: true,
};

const songRepository = {
  getAll: () =>
    prisma.song.findMany({
      include: songInclude,
      orderBy: { createdAt: "desc" },
    }),

  getById: (id) =>
    prisma.song.findUnique({
      where: { id },
      include: songInclude,
    }),

  search: (query) =>
    prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          {
            artists: {
              some: {
                artist: { name: { contains: query, mode: "insensitive" } },
              },
            },
          },
        ],
      },
      include: songInclude,
      orderBy: { createdAt: "desc" },
    }),

  upsertSong: (song) =>
    prisma.song.upsert({
      where: { id: song.id },
      create: song,
      update: song,
    }),

  addSongArtists: (songId, artistIds) =>
    prisma.songArtist.createMany({
      data: artistIds.map((artistId) => ({ songId, artistId })),
      skipDuplicates: true,
    }),

  upsertAudioFeatures: (songId, features) =>
    prisma.audioFeature.upsert({
      where: { songId },
      create: { songId, ...features },
      update: features,
    }),

  getSongsByArtistIds: (artistIds) =>
    prisma.song.findMany({
      where: { artists: { some: { artistId: { in: artistIds } } } },
      include: songInclude,
    }),

  getSongsWithAudioFeatures: () =>
    prisma.song.findMany({
      where: { audioFeatures: { isNot: null } },
      include: songInclude,
    }),

  getSongsByIds: (songIds) =>
    prisma.song.findMany({
      where: { id: { in: songIds } },
      include: songInclude,
    }),
};

export { songInclude };
export default songRepository;

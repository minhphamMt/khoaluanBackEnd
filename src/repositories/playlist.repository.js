import { prisma } from "../prisma/prisma.js";
import { songInclude } from "./song.repository.js";

const playlistInclude = {
  songs: {
    include: {
      song: { include: songInclude },
    },
    orderBy: { position: "asc" },
  },
};

const playlistRepository = {
  create: (data) => prisma.playlist.create({ data }),

  findById: (id) =>
    prisma.playlist.findUnique({
      where: { id },
      include: playlistInclude,
    }),

  findByIdAndUser: (id, userId) =>
    prisma.playlist.findFirst({
      where: { id, userId },
      include: playlistInclude,
    }),

  findByUser: (userId) =>
    prisma.playlist.findMany({
      where: { userId },
      include: playlistInclude,
      orderBy: { createdAt: "desc" },
    }),

  addSong: async (playlistId, songId) => {
    const position = await prisma.playlistSong.count({ where: { playlistId } });
    return prisma.playlistSong.upsert({
      where: { playlistId_songId: { playlistId, songId } },
      create: { playlistId, songId, position },
      update: {},
    });
  },

  removeSong: (playlistId, songId) =>
    prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId, songId } },
    }),

  deletePlaylist: async (id) => {
    await prisma.playlistSong.deleteMany({ where: { playlistId: id } });
    return prisma.playlist.delete({ where: { id } });
  },
};

export default playlistRepository;

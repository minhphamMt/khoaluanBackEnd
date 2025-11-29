import { prisma } from "../prisma/prisma.js";
import { songInclude } from "./song.repository.js";

const interactionRepository = {
  create: (data) => prisma.interaction.create({ data }),

  getUserHistory: (userId) =>
    prisma.interaction.findMany({
      where: { userId },
      include: { song: { include: songInclude } },
      orderBy: { createdAt: "desc" },
    }),

  getUserInteractions: (userId) =>
    prisma.interaction.findMany({
      where: { userId },
      include: { song: { include: songInclude } },
    }),

  getTrending: async (limit = 20, since = null) => {
    const where = since ? { createdAt: { gte: since } } : {};
    const grouped = await prisma.interaction.groupBy({
      by: ["songId"],
      _count: { songId: true },
      where,
      orderBy: { _count: { songId: "desc" } },
      take: limit,
    });
    return grouped;
  },
};

export default interactionRepository;

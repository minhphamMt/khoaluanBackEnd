import { prisma } from "../prisma/prisma.js";

const artistRepository = {
  upsertMany: (artists) =>
    prisma.$transaction(
      artists.map((artist) =>
        prisma.artist.upsert({
          where: { id: artist.id },
          create: artist,
          update: { name: artist.name, imageUrl: artist.imageUrl ?? null },
        })
      )
    ),
};

export default artistRepository;

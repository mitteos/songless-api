import prisma from "../prisma";
import { Genre } from "@prisma/client";

export async function createGenre(name: string): Promise<Genre> {
  return prisma.genre.create({
    data: { name },
  });
}

export async function getAllGenres(): Promise<Genre[]> {
  return prisma.genre.findMany();
}

export async function getGenreById(id: number): Promise<Genre | null> {
  return prisma.genre.findUnique({
    where: { id },
  });
}

export async function updateGenre(
  id: number,
  data: Partial<Genre>
): Promise<Genre> {
  return prisma.genre.update({
    where: { id },
    data,
  });
}

export async function deleteGenre(id: number): Promise<Genre> {
  return prisma.genre.delete({
    where: { id },
  });
}

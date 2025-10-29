import prisma from "../prisma";
import { Music, Prisma } from "@prisma/client";

// Создание музыки
export async function createMusic({
  name,
  author,
  genreId,
  audio_url,
  yearId,
  playlistIds,
}: {
  name: string;
  author: string;
  genreId: number;
  yearId: number;
  audio_url: string;
  playlistIds?: number[];
}): Promise<Music> {
  const connectPlaylists =
    Array.isArray(playlistIds) && playlistIds.length
      ? { playlists: { connect: playlistIds.map((id) => ({ id })) } }
      : {};

  return prisma.music.create({
    data: { name, author, genreId, yearId, audio_url, ...connectPlaylists },
  });
}

// Получение всех треков
// Получение всех треков с опциональной фильтрацией по массивам жанров и годов
export async function getAllMusic(params?: {
  genreIds?: number[];
  yearIds?: number[];
}): Promise<Music[]> {
  const where: Prisma.MusicWhereInput = {};

  // Фильтрация по массиву жанров
  if (params?.genreIds && params.genreIds.length > 0) {
    where.genreId = { in: params.genreIds };
  }

  // Фильтрация по массиву годов
  if (params?.yearIds && params.yearIds.length > 0) {
    where.yearId = { in: params.yearIds };
  }

  return prisma.music.findMany({ where });
}

// Получение трека по ID
export async function getMusicById(id: number): Promise<Music | null> {
  return prisma.music.findUnique({
    where: { id },
  });
}

// Обновление трека
export async function updateMusic(
  id: number,
  data: Partial<Music>
): Promise<Music> {
  return prisma.music.update({
    where: { id },
    data,
  });
}

// Удаление трека
export async function deleteMusic(id: number): Promise<Music> {
  return prisma.music.delete({
    where: { id },
  });
}

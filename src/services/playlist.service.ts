import prisma from "../prisma";
import { Playlist } from "@prisma/client";

export async function createPlaylist(
  name: string,
  image_url: string,
  musics?: number[] | string
): Promise<Playlist> {
  // Поддерживаем и массив чисел, и JSON-строку с массивом
  let parsedIds: number[] = [];
  if (Array.isArray(musics)) {
    parsedIds = musics.map((n) => Number(n)).filter((n) => Number.isFinite(n));
  } else if (typeof musics === "string" && musics.trim().length > 0) {
    try {
      const arr = JSON.parse(musics);
      if (Array.isArray(arr)) {
        parsedIds = arr.map((n) => Number(n)).filter((n) => Number.isFinite(n));
      }
    } catch (_) {
      parsedIds = [];
    }
  }

  const connect = parsedIds.length
    ? { musics: { connect: parsedIds.map((id) => ({ id })) } }
    : {};

  return prisma.playlist.create({
    data: { name, image_url, ...connect },
  });
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  return prisma.playlist.findMany({
    include: { musics: true },
  });
}

export async function getPlaylistById(id: number): Promise<Playlist | null> {
  return prisma.playlist.findUnique({
    where: { id },
    include: { musics: true },
  });
}

export async function updatePlaylist(
  id: number,
  data: Partial<Playlist>
): Promise<Playlist> {
  return prisma.playlist.update({
    where: { id },
    data,
  });
}

export async function deletePlaylist(id: number): Promise<Playlist> {
  return prisma.playlist.delete({
    where: { id },
  });
}

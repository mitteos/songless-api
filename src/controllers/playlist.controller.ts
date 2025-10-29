import { Request, Response } from "express";
import * as playlistService from "../services/playlist.service";
import * as musicService from "../services/music.service";
import { supabase } from "../supabaseClient";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { extractSupabasePath } from "../helpers/extractPath";

export async function create(req: Request, res: Response) {
  try {
    const { name, musics } = req.body;

    // Файл изображения приходит полем "image" (upload.single("image"))
    const file = req.file as Express.Multer.File | undefined;
    if (!name || !file) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля" });
    }

    const inputPath = path.resolve(file.path);
    const buffer = fs.readFileSync(inputPath);

    const ext = path.extname(file.originalname) || ".jpg";
    const supabaseFilePath = `playlist/${uuidv4()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(supabaseFilePath, buffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(supabaseFilePath);

    const image_url = data.publicUrl;

    const playlist = await playlistService.createPlaylist(
      name,
      image_url,
      musics
    );

    // Чистим временный файл
    fs.unlinkSync(inputPath);

    res.status(201).json(playlist);
  } catch (e: any) {
    return res.status(500).json({ error: "Ошибка при загрузке изображения" });
  }
}

export async function getAll(req: Request, res: Response) {
  const list = await playlistService.getAllPlaylists();
  res.json(list);
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const playlist = await playlistService.getPlaylistById(id);
  if (!playlist) return res.status(404).json({ error: "playlist not found" });
  res.json(playlist);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;
  const playlist = await playlistService.updatePlaylist(id, data);
  res.json(playlist);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);

  const item = await playlistService.getPlaylistById(id);

  const path = extractSupabasePath(item?.image_url || "");
  const { data, error } = await supabase.storage
    .from("images") // имя вашего bucket
    .remove([path]); // путь к файлу внутри бакета

  await playlistService.deletePlaylist(id);
  res.status(204).send();
}

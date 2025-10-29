import { Request, Response } from "express";
import * as musicService from "../services/music.service";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { parseFile } from "music-metadata";
import { supabase } from "../supabaseClient";
import { extractSupabasePath } from "../helpers/extractPath";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export const createMusic = async (req: Request, res: Response) => {
  try {
    // Поддержка upload.single(...) и upload.array(...)
    const singleFile = req.file as Express.Multer.File | undefined;
    const files = req.files as Express.Multer.File[] | undefined;
    const file = singleFile ?? files?.[0];
    const { name, author, genreId, yearId, playlistIds } = req.body;

    if (!file) {
      return res.status(400).json({ error: "Файл не найден" });
    }

    if (!name || !author || !genreId || !yearId) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля" });
    }

    const inputPath = path.resolve(file.path);
    const trimmedPath = path.resolve("uploads", `trimmed-${file.filename}`);

    // 1️⃣ Обрезаем первые 20 секунд
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(0)
        .setDuration(20)
        .output(trimmedPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    // 2️⃣ Читаем файл как Buffer
    const buffer = fs.readFileSync(trimmedPath);

    // 3️⃣ Загружаем в Supabase Storage
    const ext = path.extname(file.originalname) || ".mp3";
    const supabaseFilePath = `song/${uuidv4()}${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("song")
      .upload(supabaseFilePath, buffer, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 4️⃣ Получаем публичную ссылку
    const { data } = supabase.storage
      .from("song")
      .getPublicUrl(supabaseFilePath);

    const audio_url = data.publicUrl;

    // 5️⃣ Сохраняем запись в БД
    const newMusic = await musicService.createMusic({
      name,
      author,
      audio_url,
      genreId: Number(genreId),
      yearId: Number(yearId),
      playlistIds:
        typeof playlistIds === "string"
          ? playlistIds
              .split(",")
              .map((s: string) => Number(s.trim()))
              .filter((n: number) => Number.isFinite(n))
          : Array.isArray(playlistIds)
          ? (playlistIds as any[])
              .flatMap((v) => String(v).split(","))
              .map((s) => Number(s.trim()))
              .filter((n) => Number.isFinite(n))
          : undefined,
    });

    // 6️⃣ Удаляем временные файлы
    fs.unlinkSync(inputPath);
    fs.unlinkSync(trimmedPath);

    return res.status(201).json(newMusic);
  } catch (err: any) {
    console.error("Ошибка при добавлении музыки:", err);
    return res.status(500).json({ error: "Ошибка при обработке файла" });
  }
};

export const createManyMusic = async (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const { genreId, yearId, playlistIds } = req.body;

    if (!files.length) {
      return res.status(400).json({ error: "Файлы не найдены" });
    }

    if (!genreId || !yearId) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля" });
    }

    const results = [] as any[];

    for (const f of files) {
      const inputPath = path.resolve(f.path);
      const trimmedPath = path.resolve("uploads", `trimmed-${f.filename}`);

      // Извлекаем метаданные трека (title/artist)
      const meta = await parseFile(inputPath).catch(() => null);
      const metaTitle = meta?.common.title?.trim();
      const metaArtist = meta?.common.artist?.trim();

      const name = metaTitle || f.originalname.replace(/\.[^/.]+$/, "");
      const author = metaArtist || "Unknown";

      // Обрезка до 20 сек
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(0)
          .setDuration(20)
          .output(trimmedPath)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
      });

      // Загрузка в Supabase
      const buffer = fs.readFileSync(trimmedPath);
      const ext = path.extname(f.originalname) || ".mp3";
      const supabaseFilePath = `song/${uuidv4()}${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("song")
        .upload(supabaseFilePath, buffer, {
          contentType: "audio/mpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("song")
        .getPublicUrl(supabaseFilePath);

      const audio_url = data.publicUrl;

      const created = await musicService.createMusic({
        name,
        author,
        audio_url,
        genreId: Number(genreId),
        yearId: Number(yearId),
        // Парсим playlistIds из строки "1,2,3" или массива/комбинаций
        playlistIds:
          typeof playlistIds === "string"
            ? playlistIds
                .split(",")
                .map((s: string) => Number(s.trim()))
                .filter((n: number) => Number.isFinite(n))
            : Array.isArray(playlistIds)
            ? (playlistIds as any[])
                .flatMap((v) => String(v).split(","))
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n))
            : undefined,
      });

      // Удаляем временные файлы
      fs.unlinkSync(inputPath);
      fs.unlinkSync(trimmedPath);

      results.push(created);
    }

    return res.status(201).json({ items: results });
  } catch (err: any) {
    console.error("Ошибка при массовом добавлении музыки:", err);
    return res.status(500).json({ error: "Ошибка при обработке файлов" });
  }
};

export async function getAll(req: Request, res: Response) {
  // Поддерживаем genreId и yearId как массивы: ?genreId=1&genreId=2 или ?genreId=1,2
  const parseIds = (v: unknown): number[] => {
    if (v == null) return [];
    if (Array.isArray(v)) {
      return v
        .flatMap((item) => String(item).split(","))
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
    }
    return String(v)
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
  };

  const genreIds = parseIds(req.query.genreId);
  const yearIds = parseIds(req.query.yearId);

  const list = await musicService.getAllMusic({ genreIds, yearIds });
  res.json(list);
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const music = await musicService.getMusicById(id);
  if (!music) return res.status(404).json({ error: "Music not found" });
  res.json(music);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;
  const music = await musicService.updateMusic(id, data);
  res.json(music);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const item = await musicService.getMusicById(id);

  const path = extractSupabasePath(item?.audio_url || "");
  const { data, error } = await supabase.storage
    .from("song") // имя вашего bucket
    .remove([path]); // путь к файлу внутри бакета

  if (error) {
    console.error("Ошибка при удалении:", error.message);
    throw error;
  }

  await musicService.deleteMusic(id);
  res.status(204).send();
}

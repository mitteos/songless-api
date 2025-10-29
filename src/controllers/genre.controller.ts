import { Request, Response } from "express";
import * as genreService from "../services/genre.service";

export async function create(req: Request, res: Response) {
  const { name } = req.body;
  const genre = await genreService.createGenre(name);
  res.json(genre);
}

export async function getAll(req: Request, res: Response) {
  const list = await genreService.getAllGenres();
  res.json(list);
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const genre = await genreService.getGenreById(id);
  if (!genre) return res.status(404).json({ error: "genre not found" });
  res.json(genre);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;
  const genre = await genreService.updateGenre(id, data);
  res.json(genre);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await genreService.deleteGenre(id);
  res.status(204).send();
}

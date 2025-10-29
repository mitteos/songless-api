import { Request, Response } from "express";
import * as yearService from "../services/year.service";

export async function create(req: Request, res: Response) {
  const { name } = req.body;
  const year = await yearService.createYear(name);
  res.json(year);
}

export async function getAll(req: Request, res: Response) {
  const list = await yearService.getAllYears();
  res.json(list);
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const year = await yearService.getYearById(id);
  if (!year) return res.status(404).json({ error: "year not found" });
  res.json(year);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;
  const year = await yearService.updateYear(id, data);
  res.json(year);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await yearService.deleteYear(id);
  res.status(204).send();
}

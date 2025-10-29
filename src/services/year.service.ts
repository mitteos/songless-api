import prisma from "../prisma";
import { Year } from "@prisma/client";

export async function createYear(name: string): Promise<Year> {
  return prisma.year.create({
    data: { name },
  });
}

export async function getAllYears(): Promise<Year[]> {
  return prisma.year.findMany();
}

export async function getYearById(id: number): Promise<Year | null> {
  return prisma.year.findUnique({
    where: { id },
  });
}

export async function updateYear(
  id: number,
  data: Partial<Year>
): Promise<Year> {
  return prisma.year.update({
    where: { id },
    data,
  });
}

export async function deleteYear(id: number): Promise<Year> {
  return prisma.year.delete({
    where: { id },
  });
}

/*
  Warnings:

  - Added the required column `audio_url` to the `Music` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Music" ADD COLUMN     "audio_url" TEXT NOT NULL;

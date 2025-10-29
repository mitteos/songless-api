/*
  Warnings:

  - You are about to drop the column `email` on the `Music` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Music` table. All the data in the column will be lost.
  - Added the required column `artist` to the `Music` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Music` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Music_email_key";

-- AlterTable
ALTER TABLE "Music" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "artist" TEXT NOT NULL,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

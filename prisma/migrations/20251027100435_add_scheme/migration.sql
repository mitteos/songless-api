/*
  Warnings:

  - You are about to drop the column `artist` on the `Music` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Music` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Music` table. All the data in the column will be lost.
  - Added the required column `author` to the `Music` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genreId` to the `Music` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Music` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearId` to the `Music` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Music" DROP COLUMN "artist",
DROP COLUMN "genre",
DROP COLUMN "title",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "genreId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "yearId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Year" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MusicToPlaylist" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MusicToPlaylist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MusicToPlaylist_B_index" ON "_MusicToPlaylist"("B");

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MusicToPlaylist" ADD CONSTRAINT "_MusicToPlaylist_A_fkey" FOREIGN KEY ("A") REFERENCES "Music"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MusicToPlaylist" ADD CONSTRAINT "_MusicToPlaylist_B_fkey" FOREIGN KEY ("B") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebook_id]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[twitter_id]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "auth_provider" TEXT NOT NULL DEFAULT 'email',
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "profile_picture" TEXT,
ADD COLUMN     "twitter_id" TEXT,
ALTER COLUMN "contrasena" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_google_id_key" ON "Usuario"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_facebook_id_key" ON "Usuario"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_twitter_id_key" ON "Usuario"("twitter_id");

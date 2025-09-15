/*
  Warnings:

  - You are about to drop the column `num_me_gusta` on the `ForoCategoria` table. All the data in the column will be lost.
  - Added the required column `id_foro_categoria` to the `PedidoDonacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_usuario` to the `Ranking` table without a default value. This is not possible if the table is not empty.
  - Made the column `nombre` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `apellido` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Categoria" ALTER COLUMN "etiqueta" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Donacion" ALTER COLUMN "tipo_donacion" SET DATA TYPE TEXT,
ALTER COLUMN "descripcion" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Foro" ALTER COLUMN "titulo" SET DATA TYPE TEXT,
ALTER COLUMN "descripcion" SET DATA TYPE TEXT,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ForoCategoria" DROP COLUMN "num_me_gusta";

-- AlterTable
ALTER TABLE "PedidoDonacion" ADD COLUMN     "id_foro_categoria" INTEGER NOT NULL,
ALTER COLUMN "descripcion" SET DATA TYPE TEXT,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Ranking" ADD COLUMN     "id_usuario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RespuestaForo" ALTER COLUMN "mensaje" SET DATA TYPE TEXT,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TipoRanking" ALTER COLUMN "tipo_ranking" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TipoUsuario" ALTER COLUMN "nombre_tipo_usuario" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "usuario" SET DATA TYPE TEXT,
ALTER COLUMN "correo" SET DATA TYPE TEXT,
ALTER COLUMN "contrasena" SET DATA TYPE TEXT,
ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "apellido" SET NOT NULL,
ALTER COLUMN "apellido" SET DATA TYPE TEXT,
ALTER COLUMN "ubicacion" SET DATA TYPE TEXT,
ALTER COLUMN "reset_token" SET DATA TYPE TEXT,
ALTER COLUMN "verification_token" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "TipoONG" (
    "ID_tipo" SERIAL NOT NULL,
    "grupo_social" TEXT,
    "necesidad" TEXT,
    "usuarioId" INTEGER,

    CONSTRAINT "TipoONG_pkey" PRIMARY KEY ("ID_tipo")
);

-- AddForeignKey
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_foro" FOREIGN KEY ("id_foro") REFERENCES "Foro"("id_foro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_foroCategoria" FOREIGN KEY ("id_foro_categoria") REFERENCES "ForoCategoria"("id_foro_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoONG" ADD CONSTRAINT "TipoONG_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

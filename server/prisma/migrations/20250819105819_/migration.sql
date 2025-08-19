/*
  Warnings:

  - Added the required column `tipo_usuario` to the `RegistroPendiente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegistroPendiente" ADD COLUMN     "tipo_usuario" INTEGER NOT NULL;

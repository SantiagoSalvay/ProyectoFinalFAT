-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RegistroPendiente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "ubicacion" TEXT,
    "verification_token" TEXT NOT NULL,
    "token_expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroPendiente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPendiente_correo_key" ON "RegistroPendiente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPendiente_verification_token_key" ON "RegistroPendiente"("verification_token");

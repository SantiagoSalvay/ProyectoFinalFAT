-- CreateTable
CREATE TABLE "RegistroPendiente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "ubicacion" TEXT,
    "tipo_usuario" INTEGER NOT NULL,
    "verification_token" TEXT NOT NULL,
    "token_expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroPendiente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPendiente_correo_key" ON "RegistroPendiente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPendiente_verification_token_key" ON "RegistroPendiente"("verification_token");

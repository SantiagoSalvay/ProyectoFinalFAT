-- CreateTable
CREATE TABLE IF NOT EXISTS "CalificacionONG" (
    "id_calificacion" SERIAL NOT NULL,
    "id_ong" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalificacionONG_pkey" PRIMARY KEY ("id_calificacion")
);

-- AddForeignKey
ALTER TABLE "CalificacionONG" ADD CONSTRAINT "CalificacionONG_id_ong_fkey" FOREIGN KEY ("id_ong") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionONG" ADD CONSTRAINT "CalificacionONG_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionONG_id_ong_id_usuario_key" ON "CalificacionONG"("id_ong", "id_usuario");


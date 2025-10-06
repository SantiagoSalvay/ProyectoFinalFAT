-- CreateTable
CREATE TABLE "PublicacionLike" (
    "id_like" SERIAL NOT NULL,
    "id_publicacion" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_like" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicacionLike_pkey" PRIMARY KEY ("id_like")
);

-- CreateIndex
CREATE INDEX "PublicacionLike_id_publicacion_idx" ON "PublicacionLike"("id_publicacion");

-- CreateIndex
CREATE INDEX "PublicacionLike_id_usuario_idx" ON "PublicacionLike"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "PublicacionLike_id_publicacion_id_usuario_key" ON "PublicacionLike"("id_publicacion", "id_usuario");

-- AddForeignKey
ALTER TABLE "PublicacionLike" ADD CONSTRAINT "PublicacionLike_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionLike" ADD CONSTRAINT "PublicacionLike_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;


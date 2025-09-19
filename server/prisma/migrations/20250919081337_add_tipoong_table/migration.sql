-- CreateTable
CREATE TABLE "TipoONG" (
    "ID_tipo" SERIAL NOT NULL,
    "grupo_social" TEXT,
    "necesidad" TEXT,
    "usuarioId" INTEGER,

    CONSTRAINT "TipoONG_pkey" PRIMARY KEY ("ID_tipo")
);

-- AddForeignKey
ALTER TABLE "TipoONG" ADD CONSTRAINT "TipoONG_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TipoUsuario" (
    "tipo_usuario" SERIAL NOT NULL,
    "nombre_tipo_usuario" VARCHAR(255) NOT NULL,

    CONSTRAINT "TipoUsuario_pkey" PRIMARY KEY ("tipo_usuario")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "usuario" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(255) NOT NULL,
    "correo" VARCHAR(255) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "tipo_usuario" INTEGER NOT NULL,
    "nombre" VARCHAR(255),
    "apellido" VARCHAR(255),
    "ubicacion" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Foro" (
    "id_foro" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "fecha" DATE NOT NULL,

    CONSTRAINT "Foro_pkey" PRIMARY KEY ("id_foro")
);

-- CreateTable
CREATE TABLE "RespuestaForo" (
    "id_respuesta" SERIAL NOT NULL,
    "id_foro" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "mensaje" VARCHAR(255) NOT NULL,
    "fecha" DATE NOT NULL,

    CONSTRAINT "RespuestaForo_pkey" PRIMARY KEY ("id_respuesta")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id_categoria" SERIAL NOT NULL,
    "etiqueta" VARCHAR(255) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "ForoCategoria" (
    "id_foro_categoria" SERIAL NOT NULL,
    "id_foro" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "num_me_gusta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ForoCategoria_pkey" PRIMARY KEY ("id_foro_categoria")
);

-- CreateTable
CREATE TABLE "Donacion" (
    "id_donacion" SERIAL NOT NULL,
    "tipo_donacion" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "puntos" INTEGER NOT NULL,

    CONSTRAINT "Donacion_pkey" PRIMARY KEY ("id_donacion")
);

-- CreateTable
CREATE TABLE "PedidoDonacion" (
    "id_pedido" SERIAL NOT NULL,
    "id_foro" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_donacion" INTEGER NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,

    CONSTRAINT "PedidoDonacion_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "TipoRanking" (
    "id_tipo_ranking" SERIAL NOT NULL,
    "tipo_ranking" VARCHAR(255) NOT NULL,

    CONSTRAINT "TipoRanking_pkey" PRIMARY KEY ("id_tipo_ranking")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id_ranking" SERIAL NOT NULL,
    "id_tipo_ranking" INTEGER NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "puesto" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id_ranking")
);

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_tipo_usuario_fkey" FOREIGN KEY ("tipo_usuario") REFERENCES "TipoUsuario"("tipo_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foro" ADD CONSTRAINT "Foro_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaForo" ADD CONSTRAINT "RespuestaForo_id_foro_fkey" FOREIGN KEY ("id_foro") REFERENCES "Foro"("id_foro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaForo" ADD CONSTRAINT "RespuestaForo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForoCategoria" ADD CONSTRAINT "ForoCategoria_id_foro_fkey" FOREIGN KEY ("id_foro") REFERENCES "Foro"("id_foro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForoCategoria" ADD CONSTRAINT "ForoCategoria_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "Categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_id_donacion_fkey" FOREIGN KEY ("id_donacion") REFERENCES "Donacion"("id_donacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_id_tipo_ranking_fkey" FOREIGN KEY ("id_tipo_ranking") REFERENCES "TipoRanking"("id_tipo_ranking") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "PedidoDonacion"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- MIGRACIÓN COMPLETA: RESET Y SEED DE BASE DE DATOS
-- =====================================================

-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- (En orden inverso para respetar las foreign keys)

DROP TABLE IF EXISTS "Ranking" CASCADE;
DROP TABLE IF EXISTS "RespuestaPublicacion" CASCADE;
DROP TABLE IF EXISTS "PedidoDonacion" CASCADE;
DROP TABLE IF EXISTS "PublicacionEtiqueta" CASCADE;
DROP TABLE IF EXISTS "CalificacionONG" CASCADE;
DROP TABLE IF EXISTS "Infracciones" CASCADE;
DROP TABLE IF EXISTS "TipoInfraccion" CASCADE;
DROP TABLE IF EXISTS "TipoONG" CASCADE;
DROP TABLE IF EXISTS "Publicacion" CASCADE;
DROP TABLE IF EXISTS "Etiqueta" CASCADE;
DROP TABLE IF EXISTS "TipoDonacion" CASCADE;
DROP TABLE IF EXISTS "DetalleUsuario" CASCADE;
DROP TABLE IF EXISTS "Usuario" CASCADE;
DROP TABLE IF EXISTS "TipoUsuario" CASCADE;
DROP TABLE IF EXISTS "TipoRanking" CASCADE;
DROP TABLE IF EXISTS "RegistroPendiente" CASCADE;

-- PASO 2: CREAR TODAS LAS TABLAS NUEVAS

-- Tabla TipoUsuario
CREATE TABLE "TipoUsuario" (
    "id_tipo_usuario" SERIAL NOT NULL,
    "tipo_usuario" TEXT NOT NULL,

    CONSTRAINT "TipoUsuario_pkey" PRIMARY KEY ("id_tipo_usuario")
);

-- Tabla TipoRanking
CREATE TABLE "TipoRanking" (
    "id_tipo_ranking" SERIAL NOT NULL,
    "tipo_ranking" TEXT NOT NULL,

    CONSTRAINT "TipoRanking_pkey" PRIMARY KEY ("id_tipo_ranking")
);

-- Tabla Usuario
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "biografia" TEXT,
    "email" TEXT NOT NULL,
    "contrasena" TEXT,
    "id_tipo_usuario" INTEGER NOT NULL,
    "ubicacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- Tabla DetalleUsuario
CREATE TABLE "DetalleUsuario" (
    "id_detalle_usuario" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "auth_provider" TEXT NOT NULL DEFAULT 'email',
    "facebook_id" TEXT,
    "google_id" TEXT,
    "profile_picture" TEXT,
    "twitter_id" TEXT,
    "puntosActuales" INTEGER NOT NULL DEFAULT 0,
    "ultima_fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetalleUsuario_pkey" PRIMARY KEY ("id_detalle_usuario")
);

-- Tabla Publicacion
CREATE TABLE "Publicacion" (
    "id_publicacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion_publicacion" TEXT NOT NULL,
    "num_megusta" INTEGER NOT NULL DEFAULT 0,
    "fecha_publicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ubicacion" TEXT,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id_publicacion")
);

-- Tabla Etiqueta
CREATE TABLE "Etiqueta" (
    "id_etiqueta" SERIAL NOT NULL,
    "etiqueta" TEXT NOT NULL,

    CONSTRAINT "Etiqueta_pkey" PRIMARY KEY ("id_etiqueta")
);

-- Tabla PublicacionEtiqueta
CREATE TABLE "PublicacionEtiqueta" (
    "id_publicacion_etiqueta" SERIAL NOT NULL,
    "id_publicacion" INTEGER NOT NULL,
    "id_etiqueta" INTEGER NOT NULL,

    CONSTRAINT "PublicacionEtiqueta_pkey" PRIMARY KEY ("id_publicacion_etiqueta")
);

-- Tabla TipoDonacion
CREATE TABLE "TipoDonacion" (
    "id_tipo_donacion" SERIAL NOT NULL,
    "tipo_donacion" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,

    CONSTRAINT "TipoDonacion_pkey" PRIMARY KEY ("id_tipo_donacion")
);

-- Tabla PedidoDonacion
CREATE TABLE "PedidoDonacion" (
    "id_pedido" SERIAL NOT NULL,
    "id_publicacion_etiqueta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tipo_donacion" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha_donacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_ong_evaluadora" INTEGER,
    "descripcion_voluntariado" TEXT,
    "horas_donadas" INTEGER,
    "estado_evaluacion" TEXT NOT NULL DEFAULT 'pendiente',
    "puntos_otorgados" INTEGER,
    "fecha_evaluacion" TIMESTAMP(3),

    CONSTRAINT "PedidoDonacion_pkey" PRIMARY KEY ("id_pedido")
);

-- Tabla CalificacionONG
CREATE TABLE "CalificacionONG" (
    "id_calificacion" SERIAL NOT NULL,
    "id_ong" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "puntuacion" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "fecha_calificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalificacionONG_pkey" PRIMARY KEY ("id_calificacion")
);

-- Tabla TipoInfraccion
CREATE TABLE "TipoInfraccion" (
    "id_tipo_infraccion" SERIAL NOT NULL,
    "tipo_infraccion" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,

    CONSTRAINT "TipoInfraccion_pkey" PRIMARY KEY ("id_tipo_infraccion")
);

-- Tabla Infracciones
CREATE TABLE "Infracciones" (
    "id_infraccion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "id_tipo_infraccion" INTEGER NOT NULL,
    "fecha_infraccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3),

    CONSTRAINT "Infracciones_pkey" PRIMARY KEY ("id_infraccion")
);

-- Tabla TipoONG
CREATE TABLE "TipoONG" (
    "id_tipo_ong" SERIAL NOT NULL,
    "grupo_social" TEXT NOT NULL,
    "necesidad" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "TipoONG_pkey" PRIMARY KEY ("id_tipo_ong")
);

-- Tabla RespuestaPublicacion
CREATE TABLE "RespuestaPublicacion" (
    "id_respuesta" SERIAL NOT NULL,
    "id_respuesta_padre" INTEGER,
    "id_publicacion" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_respuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderated_at" TIMESTAMP(3),
    "moderation_status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,

    CONSTRAINT "RespuestaPublicacion_pkey" PRIMARY KEY ("id_respuesta")
);

-- Tabla Ranking
CREATE TABLE "Ranking" (
    "id_ranking" SERIAL NOT NULL,
    "id_tipo_ranking" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "puesto" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id_ranking")
);

-- Tabla RegistroPendiente
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
    "tipo_usuario" INTEGER NOT NULL,

    CONSTRAINT "RegistroPendiente_pkey" PRIMARY KEY ("id")
);

-- PASO 3: CREAR TODAS LAS FOREIGN KEYS

-- Foreign Keys para Usuario
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_tipo_usuario_fkey" FOREIGN KEY ("id_tipo_usuario") REFERENCES "TipoUsuario"("id_tipo_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys para DetalleUsuario
ALTER TABLE "DetalleUsuario" ADD CONSTRAINT "DetalleUsuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys para Publicacion
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys para PublicacionEtiqueta
ALTER TABLE "PublicacionEtiqueta" ADD CONSTRAINT "PublicacionEtiqueta_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicacionEtiqueta" ADD CONSTRAINT "PublicacionEtiqueta_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "Etiqueta"("id_etiqueta") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys para PedidoDonacion
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_id_publicacion_etiqueta_fkey" FOREIGN KEY ("id_publicacion_etiqueta") REFERENCES "PublicacionEtiqueta"("id_publicacion_etiqueta") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_id_tipo_donacion_fkey" FOREIGN KEY ("id_tipo_donacion") REFERENCES "TipoDonacion"("id_tipo_donacion") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PedidoDonacion" ADD CONSTRAINT "PedidoDonacion_id_ong_evaluadora_fkey" FOREIGN KEY ("id_ong_evaluadora") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys para CalificacionONG
ALTER TABLE "CalificacionONG" ADD CONSTRAINT "CalificacionONG_id_ong_fkey" FOREIGN KEY ("id_ong") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalificacionONG" ADD CONSTRAINT "CalificacionONG_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys para Infracciones
ALTER TABLE "Infracciones" ADD CONSTRAINT "Infracciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Infracciones" ADD CONSTRAINT "Infracciones_id_tipo_infraccion_fkey" FOREIGN KEY ("id_tipo_infraccion") REFERENCES "TipoInfraccion"("id_tipo_infraccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys para TipoONG
ALTER TABLE "TipoONG" ADD CONSTRAINT "TipoONG_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys para RespuestaPublicacion
ALTER TABLE "RespuestaPublicacion" ADD CONSTRAINT "RespuestaPublicacion_id_respuesta_padre_fkey" FOREIGN KEY ("id_respuesta_padre") REFERENCES "RespuestaPublicacion"("id_respuesta") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RespuestaPublicacion" ADD CONSTRAINT "RespuestaPublicacion_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RespuestaPublicacion" ADD CONSTRAINT "RespuestaPublicacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys para Ranking
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_id_tipo_ranking_fkey" FOREIGN KEY ("id_tipo_ranking") REFERENCES "TipoRanking"("id_tipo_ranking") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PASO 4: CREAR ÍNDICES ÚNICOS

CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "DetalleUsuario_id_usuario_key" ON "DetalleUsuario"("id_usuario");
CREATE UNIQUE INDEX "DetalleUsuario_facebook_id_key" ON "DetalleUsuario"("facebook_id");
CREATE UNIQUE INDEX "DetalleUsuario_google_id_key" ON "DetalleUsuario"("google_id");
CREATE UNIQUE INDEX "DetalleUsuario_twitter_id_key" ON "DetalleUsuario"("twitter_id");
CREATE UNIQUE INDEX "CalificacionONG_id_ong_id_usuario_key" ON "CalificacionONG"("id_ong", "id_usuario");
CREATE UNIQUE INDEX "RegistroPendiente_correo_key" ON "RegistroPendiente"("correo");
CREATE UNIQUE INDEX "RegistroPendiente_verification_token_key" ON "RegistroPendiente"("verification_token");

-- PASO 5: INSERTAR DATOS INICIALES

-- Insertar tipos de usuario
INSERT INTO "TipoUsuario" ("tipo_usuario") VALUES
('Persona'),
('ONG'),
('Admin');

-- Insertar tipos de ranking
INSERT INTO "TipoRanking" ("tipo_ranking") VALUES
('Ranking ONG'),
('Ranking Usuarios');

-- Insertar tipos de infracción
INSERT INTO "TipoInfraccion" ("tipo_infraccion", "severidad") VALUES
('Contenido inapropiado', 'Media'),
('Spam', 'Baja'),
('Lenguaje ofensivo', 'Alta'),
('Información falsa', 'Alta'),
('Contenido ilegal', 'Crítica'),
('Acoso', 'Crítica'),
('Discriminación', 'Crítica');

-- Insertar etiquetas para publicaciones
INSERT INTO "Etiqueta" ("etiqueta") VALUES
('Alimentos'),
('Ropa'),
('Medicamentos'),
('Juguetes'),
('Libros'),
('Electrodomésticos'),
('Muebles'),
('Herramientas'),
('Material escolar'),
('Productos de higiene'),
('Calzado'),
('Accesorios'),
('Deportes'),
('Tecnología'),
('Hogar'),
('Jardín'),
('Mascotas'),
('Bebés'),
('Adultos mayores'),
('Emergencias');

-- Insertar tipos de donación
INSERT INTO "TipoDonacion" ("tipo_donacion", "descripcion", "puntos") VALUES
('Alimentos', 'Donación de productos alimenticios', 10),
('Ropa', 'Donación de prendas de vestir', 5),
('Medicamentos', 'Donación de medicamentos', 15),
('Juguetes', 'Donación de juguetes para niños', 8),
('Libros', 'Donación de libros y material educativo', 6),
('Electrodomésticos', 'Donación de aparatos eléctricos', 20),
('Muebles', 'Donación de muebles y decoración', 12),
('Herramientas', 'Donación de herramientas y equipos', 15),
('Material escolar', 'Donación de útiles escolares', 7),
('Productos de higiene', 'Donación de productos de cuidado personal', 5),
('Voluntariado', 'Donación de tiempo y trabajo voluntario', 0);

-- =====================================================
-- MIGRACIÓN COMPLETADA EXITOSAMENTE
-- =====================================================

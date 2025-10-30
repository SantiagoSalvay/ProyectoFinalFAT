-- Esquema de la base de datos generado según schema.prisma (actualizado)

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
    "coordenadas" TEXT,
    "redes_sociales" TEXT,
    "telefono" TEXT,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario"),
    CONSTRAINT "Usuario_id_tipo_usuario_fkey" FOREIGN KEY ("id_tipo_usuario") REFERENCES "TipoUsuario"("id_tipo_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "mp_token_cipher" TEXT,
    "mp_token_iv" TEXT,
    "mp_token_tag" TEXT,
    "mp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mp_onboarded_at" TIMESTAMP(3),
    CONSTRAINT "DetalleUsuario_pkey" PRIMARY KEY ("id_detalle_usuario"),
    CONSTRAINT "DetalleUsuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
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
    "imagenes" TEXT,
    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id_publicacion"),
    CONSTRAINT "Publicacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "PublicacionEtiqueta_pkey" PRIMARY KEY ("id_publicacion_etiqueta"),
    CONSTRAINT "PublicacionEtiqueta_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicacionEtiqueta_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "Etiqueta"("id_etiqueta") ON DELETE CASCADE ON UPDATE CASCADE
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
    "id_publicacion_etiqueta" INTEGER,
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
    CONSTRAINT "PedidoDonacion_pkey" PRIMARY KEY ("id_pedido"),
    CONSTRAINT "PedidoDonacion_id_publicacion_etiqueta_fkey" FOREIGN KEY ("id_publicacion_etiqueta") REFERENCES "PublicacionEtiqueta"("id_publicacion_etiqueta") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoDonacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoDonacion_id_tipo_donacion_fkey" FOREIGN KEY ("id_tipo_donacion") REFERENCES "TipoDonacion"("id_tipo_donacion") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoDonacion_id_ong_evaluadora_fkey" FOREIGN KEY ("id_ong_evaluadora") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabla CalificacionONG
CREATE TABLE "CalificacionONG" (
    "id_calificacion" SERIAL NOT NULL,
    "id_ong" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "puntuacion" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "fecha_calificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalificacionONG_pkey" PRIMARY KEY ("id_calificacion"),
    CONSTRAINT "CalificacionONG_id_ong_fkey" FOREIGN KEY ("id_ong") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalificacionONG_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "Infracciones_pkey" PRIMARY KEY ("id_infraccion"),
    CONSTRAINT "Infracciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Infracciones_id_tipo_infraccion_fkey" FOREIGN KEY ("id_tipo_infraccion") REFERENCES "TipoInfraccion"("id_tipo_infraccion") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla TipoONG
CREATE TABLE "TipoONG" (
    "id_tipo_ong" SERIAL NOT NULL,
    "grupo_social" TEXT NOT NULL,
    "necesidad" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    CONSTRAINT "TipoONG_pkey" PRIMARY KEY ("id_tipo_ong"),
    CONSTRAINT "TipoONG_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "RespuestaPublicacion_pkey" PRIMARY KEY ("id_respuesta"),
    CONSTRAINT "RespuestaPublicacion_id_respuesta_padre_fkey" FOREIGN KEY ("id_respuesta_padre") REFERENCES "RespuestaPublicacion"("id_respuesta") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RespuestaPublicacion_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RespuestaPublicacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla Ranking
CREATE TABLE "Ranking" (
    "id_ranking" SERIAL NOT NULL,
    "id_tipo_ranking" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "puesto" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL,
    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id_ranking"),
    CONSTRAINT "Ranking_id_tipo_ranking_fkey" FOREIGN KEY ("id_tipo_ranking") REFERENCES "TipoRanking"("id_tipo_ranking") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ranking_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "coordenadas" TEXT,
    CONSTRAINT "RegistroPendiente_pkey" PRIMARY KEY ("id")
);

-- Tabla Categoria
CREATE TABLE "Categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT,
    "icono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- Tabla ONGCategoria
CREATE TABLE "ONGCategoria" (
    "id_ong_categoria" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ONGCategoria_pkey" PRIMARY KEY ("id_ong_categoria"),
    CONSTRAINT "ONGCategoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ONGCategoria_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "Categoria"("id_categoria") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla Notificacion
CREATE TABLE "Notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo_notificacion" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id_notificacion"),
    CONSTRAINT "Notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla PasswordResetToken
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PasswordResetToken_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla PublicacionLike
CREATE TABLE "PublicacionLike" (
    "id_like" SERIAL NOT NULL,
    "id_publicacion" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublicacionLike_pkey" PRIMARY KEY ("id_like"),
    CONSTRAINT "PublicacionLike_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicacionLike_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla SolicitudRevisionIPJ
CREATE TABLE "SolicitudRevisionIPJ" (
    "id_solicitud" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombre_legal" TEXT,
    "cuit" TEXT NOT NULL,
    "matricula" TEXT,
    "tipo_organizacion" TEXT NOT NULL,
    "ubicacion" TEXT,
    "razon" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "notas_admin" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revision" TIMESTAMP(3),
    CONSTRAINT "SolicitudRevisionIPJ_pkey" PRIMARY KEY ("id_solicitud"),
    CONSTRAINT "SolicitudRevisionIPJ_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);


-- Indices y claves únicas según modelo
CREATE UNIQUE INDEX "PublicacionLike_id_publicacion_id_usuario_key" ON "PublicacionLike"("id_publicacion", "id_usuario");
CREATE UNIQUE INDEX "ONGCategoria_id_usuario_id_categoria_key" ON "ONGCategoria"("id_usuario", "id_categoria");
CREATE UNIQUE INDEX "ONGCategoria_id_ong_categoria_key" ON "ONGCategoria"("id_ong_categoria");
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_id_usuario_idx" ON "PasswordResetToken"("id_usuario");
CREATE UNIQUE INDEX "SolicitudRevisionIPJ_email_key" ON "SolicitudRevisionIPJ"("email");
CREATE INDEX "SolicitudRevisionIPJ_estado_idx" ON "SolicitudRevisionIPJ"("estado");


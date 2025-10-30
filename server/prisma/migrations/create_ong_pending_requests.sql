-- Crear tabla para solicitudes de registro de ONGs pendientes
CREATE TABLE IF NOT EXISTS "SolicitudRegistroONG" (
  "id_solicitud" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "contrasena" VARCHAR(255) NOT NULL,
  "nombre_organizacion" VARCHAR(255) NOT NULL,
  "cuit" VARCHAR(20) NOT NULL,
  "ubicacion" VARCHAR(255),
  "descripcion" TEXT,
  "telefono" VARCHAR(50),
  "sitio_web" VARCHAR(255),
  "documentacion" TEXT,
  "estado" VARCHAR(50) DEFAULT 'pendiente',
  "motivo_rechazo" TEXT,
  "notas_admin" TEXT,
  "fecha_solicitud" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "fecha_revision" TIMESTAMP,
  "revisado_por" INTEGER REFERENCES "Usuario"("id_usuario"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS "idx_solicitud_ong_estado" ON "SolicitudRegistroONG"("estado");
CREATE INDEX IF NOT EXISTS "idx_solicitud_ong_email" ON "SolicitudRegistroONG"("email");
CREATE INDEX IF NOT EXISTS "idx_solicitud_ong_cuit" ON "SolicitudRegistroONG"("cuit");


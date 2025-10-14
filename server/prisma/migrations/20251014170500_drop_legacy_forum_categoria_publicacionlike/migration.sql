-- Limpieza de tablas legadas: Foro, ForoCategoria, RespuestaForo, Categoria, ONGCategoria, PublicacionLike
-- Uso de IF EXISTS y CASCADE para evitar errores si no existen o si hay FKs

DROP TABLE IF EXISTS "ForoCategoria" CASCADE;
DROP TABLE IF EXISTS "RespuestaForo" CASCADE;
DROP TABLE IF EXISTS "Foro" CASCADE;
DROP TABLE IF EXISTS "PublicacionLike" CASCADE;
DROP TABLE IF EXISTS "ONGCategoria" CASCADE;
DROP TABLE IF EXISTS "Categoria" CASCADE;



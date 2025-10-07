-- AddColumn redes_sociales to Usuario table
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "redes_sociales" TEXT;


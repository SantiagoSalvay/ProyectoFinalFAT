-- AddColumn coordenadas to Usuario and RegistroPendiente tables
ALTER TABLE "Usuario" ADD COLUMN "coordenadas" TEXT;
ALTER TABLE "RegistroPendiente" ADD COLUMN "coordenadas" TEXT;


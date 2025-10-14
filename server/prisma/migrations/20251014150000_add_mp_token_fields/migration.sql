-- AlterTable: add Mercado Pago encrypted fields to DetalleUsuario
ALTER TABLE "DetalleUsuario"
  ADD COLUMN "mp_token_cipher" TEXT,
  ADD COLUMN "mp_token_iv" TEXT,
  ADD COLUMN "mp_token_tag" TEXT,
  ADD COLUMN "mp_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "mp_onboarded_at" TIMESTAMP(3);



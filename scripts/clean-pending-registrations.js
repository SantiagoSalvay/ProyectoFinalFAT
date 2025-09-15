// Script para limpiar registros pendientes antiguos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanPendingRegistrations() {
  try {
    console.log('🧹 [LIMPIEZA] Iniciando limpieza de registros pendientes...\n');

    // Contar registros pendientes antes de limpiar
    const countBefore = await prisma.registroPendiente.count();
    console.log(`📊 [LIMPIEZA] Registros pendientes antes: ${countBefore}`);

    // Eliminar todos los registros pendientes
    const result = await prisma.registroPendiente.deleteMany({});
    
    console.log(`🗑️ [LIMPIEZA] Registros eliminados: ${result.count}`);
    console.log('✅ [LIMPIEZA] Limpieza completada');

  } catch (error) {
    console.error('❌ [LIMPIEZA] Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanPendingRegistrations();

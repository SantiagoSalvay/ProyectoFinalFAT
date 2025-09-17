import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAllPendingRegistrations() {
  try {
    console.log('⚠️ [LIMPIEZA TOTAL] ADVERTENCIA: Esto eliminará TODOS los registros pendientes');
    console.log('⚠️ [LIMPIEZA TOTAL] Solo ejecuta esto si estás seguro de que quieres limpiar todo\n');

    // 1. Mostrar todos los registros pendientes
    const todosLosRegistros = await prisma.registroPendiente.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        correo: true,
        usuario: true,
        verification_token: true,
        createdAt: true
      }
    });

    console.log(`📋 [LIMPIEZA TOTAL] Registros pendientes a eliminar: ${todosLosRegistros.length}`);
    
    if (todosLosRegistros.length === 0) {
      console.log('✅ [LIMPIEZA TOTAL] No hay registros pendientes para eliminar.');
      return;
    }

    // Mostrar detalles de los registros
    todosLosRegistros.forEach((reg, index) => {
      const horasTranscurridas = Math.floor((Date.now() - new Date(reg.createdAt).getTime()) / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${reg.correo} (${reg.usuario}) - Token: ${reg.verification_token} - Hace ${horasTranscurridas} horas`);
    });

    // 2. Eliminar todos los registros pendientes
    console.log('\n🗑️ [LIMPIEZA TOTAL] Eliminando todos los registros pendientes...');
    
    const resultado = await prisma.registroPendiente.deleteMany({});
    
    console.log(`✅ [LIMPIEZA TOTAL] Eliminados ${resultado.count} registros pendientes`);

    // 3. Verificar que se eliminaron todos
    const registrosRestantes = await prisma.registroPendiente.count();
    console.log(`📊 [LIMPIEZA TOTAL] Registros pendientes restantes: ${registrosRestantes}`);

    if (registrosRestantes === 0) {
      console.log('🎉 [LIMPIEZA TOTAL] ¡Limpieza completada exitosamente!');
      console.log('💡 [LIMPIEZA TOTAL] Ahora los usuarios pueden registrarse nuevamente sin conflictos de tokens.');
    } else {
      console.log('⚠️ [LIMPIEZA TOTAL] Aún quedan registros pendientes. Revisa la base de datos.');
    }

  } catch (error) {
    console.error('❌ [LIMPIEZA TOTAL] Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanAllPendingRegistrations();
}

export { cleanAllPendingRegistrations };

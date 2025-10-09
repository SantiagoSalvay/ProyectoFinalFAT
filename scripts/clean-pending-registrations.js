import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanPendingRegistrations() {
  try {
    console.log('🧹 [LIMPIEZA] Iniciando limpieza de registros pendientes...\n');

    // 1. Mostrar registros pendientes antes de la limpieza
    const registrosAntes = await prisma.RegistroPendiente.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        correo: true,
        verification_token: true,
        createdAt: true
      }
    });

    console.log(`📋 [LIMPIEZA] Registros pendientes encontrados: ${registrosAntes.length}`);
    registrosAntes.forEach((reg, index) => {
      const horasTranscurridas = Math.floor((Date.now() - new Date(reg.createdAt).getTime()) / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${reg.correo} - Token: ${reg.verification_token} - Hace ${horasTranscurridas} horas`);
    });

    if (registrosAntes.length === 0) {
      console.log('✅ [LIMPIEZA] No hay registros pendientes para limpiar.');
      return;
    }

    // 2. Limpiar registros pendientes antiguos (más de 24 horas)
    const fechaLimite = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas atrás
    
    const registrosEliminados = await prisma.RegistroPendiente.deleteMany({
      where: {
        createdAt: {
          lt: fechaLimite
        }
      }
    });

    console.log(`\n🗑️ [LIMPIEZA] Registros eliminados (más de 24 horas): ${registrosEliminados.count}`);

    // 3. Limpiar registros duplicados (mismo correo)
    const registrosRestantes = await prisma.RegistroPendiente.findMany({
      select: {
        correo: true,
        id: true,
        createdAt: true
      }
    });

    // Agrupar por correo
    const registrosPorCorreo = {};
    registrosRestantes.forEach(reg => {
      if (!registrosPorCorreo[reg.correo]) {
        registrosPorCorreo[reg.correo] = [];
      }
      registrosPorCorreo[reg.correo].push(reg);
    });

    // Eliminar duplicados, manteniendo solo el más reciente
    let duplicadosEliminados = 0;
    for (const [correo, registros] of Object.entries(registrosPorCorreo)) {
      if (registros.length > 1) {
        // Ordenar por fecha de creación (más reciente primero)
        registros.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Eliminar todos excepto el más reciente
        const idsAEliminar = registros.slice(1).map(reg => reg.id);
        
        if (idsAEliminar.length > 0) {
          await prisma.RegistroPendiente.deleteMany({
            where: {
              id: {
                in: idsAEliminar
              }
            }
          });
          duplicadosEliminados += idsAEliminar.length;
          console.log(`   🗑️ Eliminados ${idsAEliminar.length} registros duplicados para ${correo}`);
        }
      }
    }

    console.log(`🗑️ [LIMPIEZA] Registros duplicados eliminados: ${duplicadosEliminados}`);

    // 4. Mostrar estado final
    const registrosFinales = await prisma.RegistroPendiente.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        correo: true,
        verification_token: true,
        createdAt: true
      }
    });

    console.log(`\n✅ [LIMPIEZA] Limpieza completada. Registros pendientes restantes: ${registrosFinales.length}`);
    
    if (registrosFinales.length > 0) {
      console.log('📋 [LIMPIEZA] Registros restantes:');
      registrosFinales.forEach((reg, index) => {
        const horasTranscurridas = Math.floor((Date.now() - new Date(reg.createdAt).getTime()) / (1000 * 60 * 60));
        console.log(`   ${index + 1}. ${reg.correo} - Token: ${reg.verification_token} - Hace ${horasTranscurridas} horas`);
      });
    }

    // 5. Sugerencias adicionales
    console.log('\n💡 [LIMPIEZA] Sugerencias:');
    if (registrosFinales.length > 0) {
      console.log('   - Los registros restantes son recientes (menos de 24 horas)');
      console.log('   - Si sigues teniendo problemas, considera limpiar todos los registros pendientes');
      console.log('   - Ejecuta: node scripts/clean-all-pending.js (¡CUIDADO: elimina TODOS!)');
    } else {
      console.log('   - No hay registros pendientes. El sistema está limpio.');
    }

  } catch (error) {
    console.error('❌ [LIMPIEZA] Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanPendingRegistrations();
}

export { cleanPendingRegistrations };
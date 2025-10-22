import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupNotifications() {
  try {
    console.log('🧹 Limpiando notificaciones...\n');

    // 1. Verificar notificaciones de mensajes borrados
    console.log('📋 Verificando notificaciones de mensajes borrados...');
    const notificacionesMensajeBorrado = await prisma.notificacion.findMany({
      where: {
        tipo_notificacion: 'mensaje_borrado'
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    console.log(`   Encontradas ${notificacionesMensajeBorrado.length} notificaciones de mensajes borrados`);
    
    if (notificacionesMensajeBorrado.length > 0) {
      console.log('\n   Detalle:');
      notificacionesMensajeBorrado.forEach(n => {
        console.log(`   - Usuario: ${n.usuario.nombre} ${n.usuario.apellido} (ID: ${n.id_usuario})`);
        console.log(`     Mensaje: ${n.mensaje.substring(0, 80)}...`);
        console.log(`     Fecha: ${n.fecha_creacion}`);
        console.log('');
      });
    }

    // 2. Opcional: Eliminar todas las notificaciones de mensajes borrados (descomentar si quieres limpiar)
    // const deleted = await prisma.notificacion.deleteMany({
    //   where: {
    //     tipo_notificacion: 'mensaje_borrado'
    //   }
    // });
    // console.log(`\n✅ Eliminadas ${deleted.count} notificaciones de mensajes borrados`);

    console.log('\n✅ Verificación completada');
    console.log('\n💡 Si quieres eliminar todas las notificaciones de mensajes borrados,');
    console.log('   descomenta las líneas en el script y vuelve a ejecutarlo.');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNotifications()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

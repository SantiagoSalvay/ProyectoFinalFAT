import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllForumPosts() {
  try {
    console.log('🔍 Buscando publicaciones del foro...');

    // Obtener IDs de publicaciones que tienen donaciones (NO las borraremos)
    const publicacionesConDonaciones = await prisma.publicacionEtiqueta.findMany({
      where: {
        pedidosDonacion: {
          some: {}
        }
      },
      select: {
        id_publicacion: true
      },
      distinct: ['id_publicacion']
    });

    const idsConDonaciones = publicacionesConDonaciones.map(pe => pe.id_publicacion);
    console.log(`📌 Publicaciones con donaciones (NO se borrarán): ${idsConDonaciones.length}`);

    // Obtener publicaciones del foro (sin donaciones)
    const forumPosts = await prisma.publicacion.findMany({
      where: {
        id_publicacion: {
          notIn: idsConDonaciones
        }
      },
      select: {
        id_publicacion: true,
        titulo: true
      }
    });

    console.log(`📝 Publicaciones del foro encontradas: ${forumPosts.length}`);

    if (forumPosts.length === 0) {
      console.log('✅ No hay publicaciones del foro para eliminar.');
      return;
    }

    // Confirmar antes de borrar
    console.log('\n⚠️  Se eliminarán las siguientes publicaciones:');
    forumPosts.forEach(post => {
      console.log(`   - [${post.id_publicacion}] ${post.titulo}`);
    });

    console.log('\n🗑️  Eliminando publicaciones del foro...');

    // Eliminar todas las publicaciones del foro
    // Las respuestas se eliminarán automáticamente por el onDelete: Cascade
    const result = await prisma.publicacion.deleteMany({
      where: {
        id_publicacion: {
          in: forumPosts.map(p => p.id_publicacion)
        }
      }
    });

    console.log(`✅ Se eliminaron ${result.count} publicaciones del foro exitosamente.`);
    console.log('✅ Las respuestas asociadas también fueron eliminadas automáticamente.');

  } catch (error) {
    console.error('❌ Error al eliminar publicaciones:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
deleteAllForumPosts()
  .then(() => {
    console.log('\n✅ Script completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

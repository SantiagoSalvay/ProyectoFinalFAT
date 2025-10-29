import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalcularRankings() {
  try {
    console.log('🔄 Iniciando recálculo de rankings...');

    // Obtener todos los usuarios con sus puntos actuales
    const usuarios = await prisma.DetalleUsuario.findMany({
      include: {
        Usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true
          }
        }
      },
      orderBy: { puntosActuales: 'desc' }
    });

    console.log(`📊 Encontrados ${usuarios.length} usuarios con puntos`);

    // Crear o actualizar tipos de ranking (solo ONGs y Usuarios)
    let tipoRankingONG = await prisma.TipoRanking.findFirst({
      where: { tipo_ranking: 'ONGs' }
    });
    if (!tipoRankingONG) {
      tipoRankingONG = await prisma.TipoRanking.create({
        data: { tipo_ranking: 'ONGs' }
      });
    }

    let tipoRankingUsuarios = await prisma.TipoRanking.findFirst({
      where: { tipo_ranking: 'Usuarios' }
    });
    if (!tipoRankingUsuarios) {
      tipoRankingUsuarios = await prisma.TipoRanking.create({
        data: { tipo_ranking: 'Usuarios' }
      });
    }

    // Limpiar rankings existentes
    await prisma.Ranking.deleteMany({});
    console.log('🗑️ Rankings anteriores eliminados');

    // Crear rankings
    const rankings = [];
    let puestoONG = 1;
    let puestoUsuario = 1;

    for (const detalle of usuarios) {
      const usuario = detalle.Usuario;
      
      // Ranking por tipo de usuario
      if (usuario.id_tipo_usuario === 2) { // ONG
        rankings.push({
          id_tipo_ranking: tipoRankingONG.id_tipo_ranking,
          id_usuario: usuario.id_usuario,
          puesto: puestoONG,
          puntos: detalle.puntosActuales
        });
        puestoONG++;
      } else if (usuario.id_tipo_usuario === 1) { // Usuario regular
        rankings.push({
          id_tipo_ranking: tipoRankingUsuarios.id_tipo_ranking,
          id_usuario: usuario.id_usuario,
          puesto: puestoUsuario,
          puntos: detalle.puntosActuales
        });
        puestoUsuario++;
      }
    }

    // Insertar todos los rankings
    if (rankings.length > 0) {
      await prisma.Ranking.createMany({ data: rankings });
    }

    console.log(`✅ Rankings recalculados: ${rankings.length} entradas creadas`);
    
    // Mostrar top 5 ONGs y Usuarios
    const topOngs = await prisma.Ranking.findMany({
      where: { id_tipo_ranking: tipoRankingONG.id_tipo_ranking },
      include: { usuario: { select: { nombre: true, apellido: true } } },
      orderBy: { puesto: 'asc' },
      take: 5
    });
    console.log('\n🏆 Top 5 ONGs:');
    topOngs.forEach(r => console.log(`${r.puesto}. ${r.usuario.nombre} ${r.usuario.apellido} - ${r.puntos} puntos`));

    const topUsers = await prisma.Ranking.findMany({
      where: { id_tipo_ranking: tipoRankingUsuarios.id_tipo_ranking },
      include: { usuario: { select: { nombre: true, apellido: true } } },
      orderBy: { puesto: 'asc' },
      take: 5
    });
    console.log('\n🏆 Top 5 Usuarios:');
    topUsers.forEach(r => console.log(`${r.puesto}. ${r.usuario.nombre} ${r.usuario.apellido} - ${r.puntos} puntos`));

    return rankings.length;

  } catch (error) {
    console.error('❌ Error recalculando rankings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  recalcularRankings()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default recalcularRankings;

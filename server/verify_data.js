const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verificando datos insertados...\n');

    // Verificar tipos de usuario
    const tiposUsuario = await prisma.tipoUsuario.findMany();
    console.log('📋 Tipos de Usuario:');
    tiposUsuario.forEach(tipo => {
      console.log(`  - ${tipo.tipo_usuario}`);
    });
    console.log('');

    // Verificar tipos de ranking
    const tiposRanking = await prisma.tipoRanking.findMany();
    console.log('🏆 Tipos de Ranking:');
    tiposRanking.forEach(tipo => {
      console.log(`  - ${tipo.tipo_ranking}`);
    });
    console.log('');

    // Verificar tipos de infracción
    const tiposInfraccion = await prisma.tipoInfraccion.findMany();
    console.log('⚠️  Tipos de Infracción:');
    tiposInfraccion.forEach(tipo => {
      console.log(`  - ${tipo.tipo_infraccion} (${tipo.severidad})`);
    });
    console.log('');

    // Verificar etiquetas
    const etiquetas = await prisma.etiqueta.findMany();
    console.log('🏷️  Etiquetas:');
    etiquetas.forEach(etiqueta => {
      console.log(`  - ${etiqueta.etiqueta}`);
    });
    console.log('');

    // Verificar tipos de donación
    const tiposDonacion = await prisma.tipoDonacion.findMany();
    console.log('🎁 Tipos de Donación:');
    tiposDonacion.forEach(tipo => {
      console.log(`  - ${tipo.tipo_donacion}: ${tipo.descripcion} (${tipo.puntos} puntos)`);
    });

    console.log('\n✅ Verificación completada exitosamente!');
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();

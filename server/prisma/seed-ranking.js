import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTiposDonacion() {
  try {
    console.log('🌱 Iniciando seed de tipos de donación...');

    // Tipos de donación con sus puntos correspondientes
    const tiposDonacion = [
      {
        tipo_donacion: 'Dinero',
        descripcion: 'Donación monetaria',
        puntos: 1 // 1 punto por peso argentino
      },
      {
        tipo_donacion: 'Alimentos',
        descripcion: 'Donación de alimentos no perecederos',
        puntos: 2 // 2 puntos por unidad
      },
      {
        tipo_donacion: 'Ropa',
        descripcion: 'Donación de ropa en buen estado',
        puntos: 3 // 3 puntos por prenda
      },
      {
        tipo_donacion: 'Medicamentos',
        descripcion: 'Donación de medicamentos',
        puntos: 5 // 5 puntos por medicamento
      },
      {
        tipo_donacion: 'Libros',
        descripcion: 'Donación de libros y material educativo',
        puntos: 2 // 2 puntos por libro
      },
      {
        tipo_donacion: 'Juguetes',
        descripcion: 'Donación de juguetes',
        puntos: 2 // 2 puntos por juguete
      },
      {
        tipo_donacion: 'Voluntariado',
        descripcion: 'Trabajo voluntario',
        puntos: 10 // 10 puntos por hora de voluntariado
      },
      {
        tipo_donacion: 'Servicios',
        descripcion: 'Donación de servicios profesionales',
        puntos: 15 // 15 puntos por hora de servicio
      },
      {
        tipo_donacion: 'Tecnología',
        descripcion: 'Donación de equipos tecnológicos',
        puntos: 20 // 20 puntos por dispositivo
      },
      {
        tipo_donacion: 'Muebles',
        descripcion: 'Donación de muebles y electrodomésticos',
        puntos: 25 // 25 puntos por mueble
      }
    ];

    // Crear tipos de ranking (solo ONGs y Usuarios)
    const tiposRanking = [
      { tipo_ranking: 'ONGs' },
      { tipo_ranking: 'Usuarios' }
    ];

    console.log('📝 Creando tipos de donación...');
    for (const tipo of tiposDonacion) {
      const existingTipo = await prisma.TipoDonacion.findFirst({
        where: { tipo_donacion: tipo.tipo_donacion }
      });
      
      if (existingTipo) {
        await prisma.TipoDonacion.update({
          where: { id_tipo_donacion: existingTipo.id_tipo_donacion },
          data: { puntos: tipo.puntos }
        });
        console.log(`🔄 ${tipo.tipo_donacion}: ${tipo.puntos} puntos (actualizado)`);
      } else {
        await prisma.TipoDonacion.create({ data: tipo });
        console.log(`✅ ${tipo.tipo_donacion}: ${tipo.puntos} puntos (creado)`);
      }
    }

    console.log('📝 Creando tipos de ranking...');
    for (const tipo of tiposRanking) {
      const existingTipo = await prisma.TipoRanking.findFirst({
        where: { tipo_ranking: tipo.tipo_ranking }
      });
      
      if (existingTipo) {
        console.log(`🔄 ${tipo.tipo_ranking} (ya existe)`);
      } else {
        await prisma.TipoRanking.create({ data: tipo });
        console.log(`✅ ${tipo.tipo_ranking} (creado)`);
      }
    }

    console.log('🎉 Seed completado exitosamente!');
    
    // Mostrar resumen
    const tiposCreados = await prisma.TipoDonacion.findMany();
    const rankingsCreados = await prisma.TipoRanking.findMany();
    
    console.log(`\n📊 Resumen:`);
    console.log(`- Tipos de donación: ${tiposCreados.length}`);
    console.log(`- Tipos de ranking: ${rankingsCreados.length}`);
    
    console.log('\n🏆 Sistema de puntos por tipo de donación:');
    tiposCreados.forEach(tipo => {
      console.log(`- ${tipo.tipo_donacion}: ${tipo.puntos} puntos`);
    });

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTiposDonacion()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default seedTiposDonacion;

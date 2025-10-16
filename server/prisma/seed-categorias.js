import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategorias() {
  console.log('🌱 Insertando categorías predefinidas...');

  const categorias = [
    { nombre: 'Niños', descripcion: 'Organizaciones que trabajan con niños y jóvenes', color: '#2196f3', icono: '👶' },
    { nombre: 'Gente mayor', descripcion: 'Organizaciones que apoyan a personas mayores', color: '#8bc34a', icono: '👴' },
    { nombre: 'Mujeres', descripcion: 'Organizaciones enfocadas en derechos y apoyo a mujeres', color: '#e040fb', icono: '👩' },
    { nombre: 'Animales', descripcion: 'Protección y cuidado de animales', color: '#ff9800', icono: '🐾' },
    { nombre: 'Personas con discapacidad', descripcion: 'Apoyo e inclusión de personas con discapacidad', color: '#ffeb3b', icono: '♿' },
    { nombre: 'Familias', descripcion: 'Apoyo integral a familias', color: '#009688', icono: '👨‍👩‍👧‍👦' },
    { nombre: 'Otros', descripcion: 'Otras causas sociales', color: '#f44336', icono: '🤝' }
  ];

  for (const categoria of categorias) {
    try {
      const result = await prisma.categoria.upsert({
        where: { nombre: categoria.nombre },
        update: {},
        create: categoria
      });
      console.log(`✅ Categoría creada/actualizada: ${result.nombre}`);
    } catch (error) {
      console.error(`❌ Error con categoría ${categoria.nombre}:`, error);
    }
  }

  console.log('✨ Seed de categorías completado!');
}

seedCategorias()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

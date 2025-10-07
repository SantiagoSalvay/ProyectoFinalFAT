import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // 1. Tipos de Usuario
  console.log('📝 Insertando Tipos de Usuario...');
  const tiposUsuario = await prisma.tipoUsuario.createMany({
    data: [
      { tipo_usuario: 'Persona' },    // id: 1
      { tipo_usuario: 'ONG' },        // id: 2
      { tipo_usuario: 'Admin' },      // id: 3
    ],
    skipDuplicates: true,
  });
  console.log(`   ✅ ${tiposUsuario.count} tipos de usuario insertados`);

  // 2. Tipos de Ranking
  console.log('\n📝 Insertando Tipos de Ranking...');
  const tiposRanking = await prisma.tipoRanking.createMany({
    data: [
      { tipo_ranking: 'Ranking ONG' },
      { tipo_ranking: 'Ranking Usuarios' },
    ],
    skipDuplicates: true,
  });
  console.log(`   ✅ ${tiposRanking.count} tipos de ranking insertados`);

  // 3. Tipos de Infracción
  console.log('\n📝 Insertando Tipos de Infracción...');
  const tiposInfraccion = await prisma.tipoInfraccion.createMany({
    data: [
      { tipo_infraccion: 'Contenido inapropiado', severidad: 'Media' },
      { tipo_infraccion: 'Spam', severidad: 'Baja' },
      { tipo_infraccion: 'Lenguaje ofensivo', severidad: 'Alta' },
      { tipo_infraccion: 'Información falsa', severidad: 'Alta' },
      { tipo_infraccion: 'Contenido ilegal', severidad: 'Crítica' },
      { tipo_infraccion: 'Acoso', severidad: 'Crítica' },
      { tipo_infraccion: 'Discriminación', severidad: 'Crítica' },
    ],
    skipDuplicates: true,
  });
  console.log(`   ✅ ${tiposInfraccion.count} tipos de infracción insertados`);

  // 4. Etiquetas
  console.log('\n📝 Insertando Etiquetas...');
  const etiquetas = await prisma.etiqueta.createMany({
    data: [
      { etiqueta: 'Alimentos' },
      { etiqueta: 'Ropa' },
      { etiqueta: 'Medicamentos' },
      { etiqueta: 'Juguetes' },
      { etiqueta: 'Libros' },
      { etiqueta: 'Electrodomésticos' },
      { etiqueta: 'Muebles' },
      { etiqueta: 'Herramientas' },
      { etiqueta: 'Material escolar' },
      { etiqueta: 'Productos de higiene' },
      { etiqueta: 'Calzado' },
      { etiqueta: 'Accesorios' },
      { etiqueta: 'Deportes' },
      { etiqueta: 'Tecnología' },
      { etiqueta: 'Hogar' },
      { etiqueta: 'Jardín' },
      { etiqueta: 'Mascotas' },
      { etiqueta: 'Bebés' },
      { etiqueta: 'Adultos mayores' },
      { etiqueta: 'Emergencias' },
    ],
    skipDuplicates: true,
  });
  console.log(`   ✅ ${etiquetas.count} etiquetas insertadas`);

  // 5. Tipos de Donación
  console.log('\n📝 Insertando Tipos de Donación...');
  const tiposDonacion = await prisma.tipoDonacion.createMany({
    data: [
      { tipo_donacion: 'Alimentos', descripcion: 'Donación de productos alimenticios', puntos: 10 },
      { tipo_donacion: 'Ropa', descripcion: 'Donación de prendas de vestir', puntos: 5 },
      { tipo_donacion: 'Medicamentos', descripcion: 'Donación de medicamentos', puntos: 15 },
      { tipo_donacion: 'Juguetes', descripcion: 'Donación de juguetes para niños', puntos: 8 },
      { tipo_donacion: 'Libros', descripcion: 'Donación de libros y material educativo', puntos: 6 },
      { tipo_donacion: 'Electrodomésticos', descripcion: 'Donación de aparatos eléctricos', puntos: 20 },
      { tipo_donacion: 'Muebles', descripcion: 'Donación de muebles y decoración', puntos: 12 },
      { tipo_donacion: 'Herramientas', descripcion: 'Donación de herramientas y equipos', puntos: 15 },
      { tipo_donacion: 'Material escolar', descripcion: 'Donación de útiles escolares', puntos: 7 },
      { tipo_donacion: 'Productos de higiene', descripcion: 'Donación de productos de cuidado personal', puntos: 5 },
      { tipo_donacion: 'Voluntariado', descripcion: 'Donación de tiempo y trabajo voluntario', puntos: 0 },
    ],
    skipDuplicates: true,
  });
  console.log(`   ✅ ${tiposDonacion.count} tipos de donación insertados`);

  // 6. Super Admin
  console.log('\n🛡️  Creando Super Admin por defecto...');
  // Asegurar que el tipo Admin exista y obtener su ID
  let adminTipo = await prisma.tipoUsuario.findFirst({ where: { tipo_usuario: 'Admin' } });
  if (!adminTipo) {
    adminTipo = await prisma.tipoUsuario.create({ data: { tipo_usuario: 'Admin' } });
  }

  const adminEmail = 'admin@demos.local';
  const adminPassword = 'Admin#1234';
  const existingAdmin = await prisma.usuario.findFirst({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.usuario.create({
      data: {
        nombre: 'Super',
        apellido: 'Admin',
        email: adminEmail,
        contrasena: hashed,
        id_tipo_usuario: adminTipo.id_tipo_usuario,
        ubicacion: 'HQ',
        detalleUsuario: { create: { email_verified: true } }
      }
    });
    console.log(`   ✅ Super Admin creado: ${adminUser.email} (pass: ${adminPassword})`);
  } else {
    console.log('   ℹ️  Super Admin ya existe, no se modifica.');
  }

  console.log('\n✅ Seed completado exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


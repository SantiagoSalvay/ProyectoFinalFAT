import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTipos() {
  try {
    const tipos = await prisma.tipoUsuario.findMany();
    console.log('Tipos de usuario existentes:', tipos);
    
    if (tipos.length === 0) {
      console.log('Creando tipos de usuario...');
      await prisma.tipoUsuario.createMany({
        data: [
          { tipo_usuario: 1, nombre_tipo_usuario: 'Persona' },
          { tipo_usuario: 2, nombre_tipo_usuario: 'ONG' }
        ]
      });
      console.log('✅ Tipos de usuario creados');
    } else {
      console.log('✅ Tipos de usuario ya existen');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTipos();

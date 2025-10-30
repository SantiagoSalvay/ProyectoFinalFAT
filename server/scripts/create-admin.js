/**
 * Script para crear usuario administrador
 * 
 * Uso: node scripts/create-admin.js
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...');

    // Datos del admin
    const adminData = {
      email: 'admin@demosmas.local',
      password: 'Admin#1234',
      nombre: 'Administrador',
      apellido: 'Sistema',
      ubicacion: 'Córdoba, Argentina'
    };

    // Verificar si ya existe un usuario con este email
    const existingUser = await prisma.usuario.findFirst({
      where: { email: adminData.email }
    });

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con el email:', adminData.email);
      console.log('🔄 Actualizando contraseña...');
      
      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Actualizar usuario existente
      await prisma.usuario.update({
        where: { id_usuario: existingUser.id_usuario },
        data: {
          contrasena: hashedPassword,
          id_tipo_usuario: 3 // Admin
        }
      });

      console.log('✅ Usuario admin actualizado exitosamente');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Contraseña:', adminData.password);
      return;
    }

    // Verificar/crear tipo de usuario Admin (id 3)
    let tipoAdmin = await prisma.tipoUsuario.findUnique({
      where: { id_tipo_usuario: 3 }
    });

    if (!tipoAdmin) {
      console.log('📝 Creando tipo de usuario Admin...');
      tipoAdmin = await prisma.tipoUsuario.create({
        data: {
          id_tipo_usuario: 3,
          tipo_usuario: 'admin'
        }
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Crear usuario admin
    const admin = await prisma.usuario.create({
      data: {
        nombre: adminData.nombre,
        apellido: adminData.apellido,
        email: adminData.email,
        contrasena: hashedPassword,
        id_tipo_usuario: 3,
        ubicacion: adminData.ubicacion,
        createdAt: new Date()
      }
    });

    // Crear detalle de usuario
    await prisma.detalleUsuario.create({
      data: {
        id_usuario: admin.id_usuario,
        email_verified: true,
        auth_provider: 'email',
        puntosActuales: 0
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Contraseña:', adminData.password);
    console.log('👤 ID:', admin.id_usuario);
    console.log('🎯 Tipo:', 'Administrador (tipo 3)');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Puedes iniciar sesión en: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
createAdmin()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });


const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function generateNewResetToken() {
  try {
    console.log('🔑 [GENERAR] Generando nuevo token de reset...\n');

    // 1. Buscar un usuario
    const usuarios = await prisma.Usuario.findMany({
      take: 1,
      select: {
        id_Usuario: true,
        correo: true,
        Usuario: true
      }
    });

    if (usuarios.length === 0) {
      console.log('❌ [GENERAR] No hay usuarios en la base de datos');
      return;
    }

    const usuario = usuarios[0];
    console.log(`✅ [GENERAR] Usuario encontrado: ${usuario.correo} (${usuario.usuario})`);

    // 2. Generar nuevo token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    console.log(`🔑 [GENERAR] Nuevo token: ${resetToken}`);
    console.log(`⏰ [GENERAR] Expira: ${resetTokenExpiry}`);

    // 3. Actualizar en la base de datos
    await prisma.Usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      }
    });

    console.log('✅ [GENERAR] Token guardado en la base de datos');

    // 4. Mostrar enlace para probar
    console.log('\n🔗 [GENERAR] Enlace para probar:');
    console.log(`http://localhost:3000/reset-password/${resetToken}`);

    console.log('\n💡 [GENERAR] Puedes usar este enlace para probar el reset de contraseña desde el frontend.');

  } catch (error) {
    console.error('❌ [GENERAR] Error al generar token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
generateNewResetToken();

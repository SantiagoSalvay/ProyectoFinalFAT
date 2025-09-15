// Script para diagnosticar problemas de verificación
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugVerification() {
  try {
    console.log('🔍 [DEBUG] Iniciando diagnóstico de verificación...\n');

    // 1. Verificar registros pendientes
    const registrosPendientes = await prisma.registroPendiente.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('📋 [DEBUG] Registros pendientes (últimos 5):');
    if (registrosPendientes.length === 0) {
      console.log('   ❌ No hay registros pendientes');
    } else {
      registrosPendientes.forEach((reg, index) => {
        console.log(`   ${index + 1}. Email: ${reg.correo}`);
        console.log(`      Token: ${reg.verification_token}`);
        console.log(`      Creado: ${reg.createdAt}`);
        console.log(`      Expira: ${reg.token_expiry}`);
        console.log('');
      });
    }

    // 2. Verificar usuarios registrados
    const usuariosRegistrados = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        correo: true,
        email_verified: true,
        createdAt: true
      }
    });

    console.log('👥 [DEBUG] Usuarios registrados (últimos 5):');
    if (usuariosRegistrados.length === 0) {
      console.log('   ❌ No hay usuarios registrados');
    } else {
      usuariosRegistrados.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.correo}`);
        console.log(`      Verificado: ${user.email_verified ? '✅' : '❌'}`);
        console.log(`      Creado: ${user.createdAt}`);
        console.log('');
      });
    }

    // 3. Verificar tipos de usuario
    const tiposUsuario = await prisma.tipoUsuario.findMany();
    console.log('🏷️ [DEBUG] Tipos de usuario disponibles:');
    tiposUsuario.forEach(tipo => {
      console.log(`   ${tipo.tipo_usuario}. ${tipo.nombre_tipo_usuario}`);
    });

    console.log('\n✅ [DEBUG] Diagnóstico completado');

  } catch (error) {
    console.error('❌ [DEBUG] Error durante el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugVerification();

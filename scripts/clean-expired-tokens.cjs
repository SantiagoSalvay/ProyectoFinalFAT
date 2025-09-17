const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanExpiredTokens() {
  try {
    console.log('🧹 [LIMPIEZA] Limpiando tokens de reset expirados...\n');

    // 1. Mostrar tokens antes de la limpieza
    const tokensAntes = await prisma.usuario.findMany({
      where: { reset_token: { not: null } },
      select: {
        id_usuario: true,
        correo: true,
        reset_token: true,
        reset_token_expiry: true
      }
    });

    console.log(`📋 [LIMPIEZA] Tokens encontrados: ${tokensAntes.length}`);
    tokensAntes.forEach((user, index) => {
      const ahora = new Date();
      const expira = new Date(user.reset_token_expiry);
      const expirado = ahora > expira;
      const minutosRestantes = Math.floor((expira - ahora) / (1000 * 60));
      
      console.log(`   ${index + 1}. ${user.correo}`);
      console.log(`      Token: ${user.reset_token}`);
      console.log(`      Estado: ${expirado ? '❌ EXPIRADO' : '✅ VÁLIDO'}`);
      if (!expirado) {
        console.log(`      Tiempo restante: ${minutosRestantes} minutos`);
      }
      console.log('');
    });

    // 2. Limpiar tokens expirados
    const ahora = new Date();
    const resultado = await prisma.usuario.updateMany({
      where: {
        reset_token: { not: null },
        reset_token_expiry: { lt: ahora }
      },
      data: {
        reset_token: null,
        reset_token_expiry: null
      }
    });

    console.log(`🗑️ [LIMPIEZA] Tokens expirados eliminados: ${resultado.count}`);

    // 3. Mostrar estado final
    const tokensFinales = await prisma.usuario.findMany({
      where: { reset_token: { not: null } },
      select: {
        id_usuario: true,
        correo: true,
        reset_token: true,
        reset_token_expiry: true
      }
    });

    console.log(`\n✅ [LIMPIEZA] Limpieza completada. Tokens válidos restantes: ${tokensFinales.length}`);
    
    if (tokensFinales.length > 0) {
      console.log('📋 [LIMPIEZA] Tokens válidos restantes:');
      tokensFinales.forEach((user, index) => {
        const expira = new Date(user.reset_token_expiry);
        const minutosRestantes = Math.floor((expira - ahora) / (1000 * 60));
        console.log(`   ${index + 1}. ${user.correo} - Token: ${user.reset_token} - Restante: ${minutosRestantes} min`);
      });
    } else {
      console.log('   No hay tokens válidos restantes.');
    }

  } catch (error) {
    console.error('❌ [LIMPIEZA] Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
cleanExpiredTokens();

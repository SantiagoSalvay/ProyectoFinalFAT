const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugResetToken() {
  try {
    console.log('🔍 [DEBUG] Analizando tokens de reset de contraseña...\n');

    // 1. Buscar usuarios con tokens de reset
    console.log('👥 [DEBUG] Usuarios con tokens de reset:');
    const usuariosConResetToken = await prisma.Usuario.findMany({
      where: {
        reset_token: {
          not: null
        }
      },
      select: {
        id_Usuario: true,
        correo: true,
        Usuario: true,
        reset_token: true,
        reset_token_expiry: true
      }
    });

    if (usuariosConResetToken.length === 0) {
      console.log('   No hay usuarios con tokens de reset activos.');
    } else {
      usuariosConResetToken.forEach((user, index) => {
        const ahora = new Date();
        const expira = new Date(user.reset_token_expiry);
        const expirado = ahora > expira;
        const minutosRestantes = Math.floor((expira - ahora) / (1000 * 60));
        
        console.log(`   ${index + 1}. Usuario: ${user.correo} (${user.usuario})`);
        console.log(`      Token: ${user.reset_token}`);
        console.log(`      Expira: ${user.reset_token_expiry}`);
        console.log(`      Estado: ${expirado ? '❌ EXPIRADO' : '✅ VÁLIDO'}`);
        if (!expirado) {
          console.log(`      Tiempo restante: ${minutosRestantes} minutos`);
        }
        console.log('');
      });
    }

    // 2. Verificar tokens recientes (últimas 24 horas)
    console.log('⏰ [DEBUG] Tokens generados en las últimas 24 horas:');
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const tokensRecientes = await prisma.Usuario.findMany({
      where: {
        reset_token: {
          not: null
        },
        reset_token_expiry: {
          gte: hace24Horas
        }
      },
      select: {
        id_Usuario: true,
        correo: true,
        reset_token: true,
        reset_token_expiry: true
      },
      orderBy: {
        reset_token_expiry: 'desc'
      }
    });

    if (tokensRecientes.length === 0) {
      console.log('   No hay tokens recientes.');
    } else {
      tokensRecientes.forEach((user, index) => {
        const ahora = new Date();
        const expira = new Date(user.reset_token_expiry);
        const minutosRestantes = Math.floor((expira - ahora) / (1000 * 60));
        
        console.log(`   ${index + 1}. ${user.correo}`);
        console.log(`      Token: ${user.reset_token}`);
        console.log(`      Expira: ${user.reset_token_expiry}`);
        console.log(`      Tiempo restante: ${minutosRestantes} minutos`);
        console.log('');
      });
    }

    // 3. Estadísticas generales
    console.log('📊 [DEBUG] Estadísticas:');
    const totalUsuarios = await prisma.Usuario.count();
    const totalConResetToken = await prisma.Usuario.count({
      where: { reset_token: { not: null } }
    });
    const tokensExpirados = await prisma.Usuario.count({
      where: {
        reset_token: { not: null },
        reset_token_expiry: { lt: new Date() }
      }
    });
    const tokensValidos = await prisma.Usuario.count({
      where: {
        reset_token: { not: null },
        reset_token_expiry: { gte: new Date() }
      }
    });

    console.log(`   Total usuarios: ${totalUsuarios}`);
    console.log(`   Usuarios con tokens de reset: ${totalConResetToken}`);
    console.log(`   Tokens válidos: ${tokensValidos}`);
    console.log(`   Tokens expirados: ${tokensExpirados}`);

    // 4. Sugerencias
    console.log('\n💡 [DEBUG] Sugerencias:');
    if (tokensExpirados > 0) {
      console.log('   - Hay tokens expirados que pueden limpiarse');
      console.log('   - Ejecuta: node scripts/clean-expired-tokens.cjs');
    }
    
    if (tokensValidos > 0) {
      console.log('   - Hay tokens válidos disponibles para reset');
      console.log('   - Verifica que el token en la URL sea correcto');
    }

    if (totalConResetToken === 0) {
      console.log('   - No hay tokens de reset activos');
      console.log('   - Solicita un nuevo enlace de recuperación');
    }

  } catch (error) {
    console.error('❌ [DEBUG] Error durante el análisis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
debugResetToken();

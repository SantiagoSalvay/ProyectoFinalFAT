const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testResetEndpoint() {
  try {
    console.log('🧪 [TEST] Probando endpoint de reset de contraseña...\n');

    // 1. Obtener el token válido de la base de datos
    const usuarioConToken = await prisma.Usuario.findFirst({
      where: {
        reset_token: { not: null },
        reset_token_expiry: { gte: new Date() }
      },
      select: {
        id_Usuario: true,
        correo: true,
        reset_token: true,
        reset_token_expiry: true
      }
    });

    if (!usuarioConToken) {
      console.log('❌ [TEST] No hay tokens válidos para probar');
      return;
    }

    console.log(`✅ [TEST] Token encontrado para ${usuarioConToken.correo}`);
    console.log(`🔑 [TEST] Token: ${usuarioConToken.reset_token}`);
    console.log(`⏰ [TEST] Expira: ${usuarioConToken.reset_token_expiry}`);

    // 2. Probar el endpoint
    console.log('\n🌐 [TEST] Probando endpoint POST /auth/reset-password/:token...');
    
    const nuevaContrasena = 'NuevaPassword123!';
    const url = `http://localhost:3001/auth/reset-password/${usuarioConToken.reset_token}`;
    
    console.log(`📡 [TEST] URL: ${url}`);
    console.log(`📤 [TEST] Payload: { nuevaContrasena: "${nuevaContrasena}" }`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevaContrasena }),
    });

    console.log(`📊 [TEST] Status de respuesta: ${response.status}`);
    console.log(`📊 [TEST] Status text: ${response.statusText}`);

    const data = await response.json();
    console.log('📋 [TEST] Respuesta del servidor:', data);

    if (response.ok) {
      console.log('✅ [TEST] Reset de contraseña exitoso');
      
      // 3. Verificar que el token se limpió
      console.log('\n💾 [TEST] Verificando que el token se limpió...');
      const usuarioActualizado = await prisma.Usuario.findUnique({
        where: { id_usuario: usuarioConToken.id_usuario },
        select: {
          reset_token: true,
          reset_token_expiry: true
        }
      });

      if (!usuarioActualizado.reset_token) {
        console.log('✅ [TEST] Token limpiado correctamente de la base de datos');
      } else {
        console.log('❌ [TEST] Token NO se limpió de la base de datos');
      }

    } else {
      console.log('❌ [TEST] Error en el reset:', data.error);
      
      // 4. Si hay error, mostrar más detalles
      if (data.error === 'Token inválido o expirado') {
        console.log('\n🔍 [TEST] Investigando por qué el token es inválido...');
        
        // Verificar si el token existe exactamente
        const tokenExacto = await prisma.Usuario.findFirst({
          where: { reset_token: usuarioConToken.reset_token }
        });
        
        console.log(`🔍 [TEST] Token existe en BD: ${tokenExacto ? 'SÍ' : 'NO'}`);
        
        if (tokenExacto) {
          const ahora = new Date();
          const expira = new Date(tokenExacto.reset_token_expiry);
          console.log(`🔍 [TEST] Fecha actual: ${ahora}`);
          console.log(`🔍 [TEST] Token expira: ${expira}`);
          console.log(`🔍 [TEST] Token expirado: ${ahora > expira ? 'SÍ' : 'NO'}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ [TEST] Error durante la prueba:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 [TEST] El servidor no está corriendo en el puerto 3001');
      console.log('💡 [TEST] Ejecuta: cd server && npm start');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
testResetEndpoint();

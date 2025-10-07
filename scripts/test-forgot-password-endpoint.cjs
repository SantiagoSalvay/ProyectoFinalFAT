const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testForgotPasswordEndpoint() {
  try {
    console.log('🧪 [TEST] Probando endpoint de forgot password...\n');

    // 1. Buscar un usuario para probar
    console.log('👥 [TEST] Buscando usuario para prueba...');
    const usuarios = await prisma.Usuario.findMany({
      take: 1,
      select: {
        id_Usuario: true,
        correo: true,
        Usuario: true
      }
    });

    if (usuarios.length === 0) {
      console.log('❌ [TEST] No hay usuarios en la base de datos para probar');
      return;
    }

    const usuarioPrueba = usuarios[0];
    console.log(`✅ [TEST] Usuario encontrado: ${usuarioPrueba.correo} (${usuarioPrueba.usuario})`);

    // 2. Probar el endpoint
    console.log('\n🌐 [TEST] Probando endpoint POST /auth/request-password-reset...');
    
    const response = await fetch('http://localhost:3001/auth/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo: usuarioPrueba.correo }),
    });

    console.log(`📊 [TEST] Status de respuesta: ${response.status}`);
    console.log(`📊 [TEST] Status text: ${response.statusText}`);

    const data = await response.json();
    console.log('📋 [TEST] Respuesta del servidor:', data);

    if (response.ok) {
      console.log('✅ [TEST] Endpoint funcionando correctamente');
      
      // 3. Verificar que se guardó el token en la base de datos
      console.log('\n💾 [TEST] Verificando token en la base de datos...');
      const usuarioActualizado = await prisma.Usuario.findUnique({
        where: { id_usuario: usuarioPrueba.id_usuario },
        select: {
          reset_token: true,
          reset_token_expiry: true
        }
      });

      if (usuarioActualizado.reset_token) {
        console.log('✅ [TEST] Token guardado en la base de datos');
        console.log(`🔑 [TEST] Token: ${usuarioActualizado.reset_token}`);
        console.log(`⏰ [TEST] Expira: ${usuarioActualizado.reset_token_expiry}`);
      } else {
        console.log('❌ [TEST] Token NO se guardó en la base de datos');
      }

    } else {
      console.log('❌ [TEST] Error en el endpoint:', data.error);
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
testForgotPasswordEndpoint();

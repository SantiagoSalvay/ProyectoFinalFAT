const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOAuthFlow() {
  try {
    console.log('🧪 [TEST] Probando flujo de OAuth...\n');

    // 1. Verificar que el servidor backend esté corriendo
    console.log('🌐 [TEST] Verificando servidor backend...');
    try {
      const response = await fetch('http://localhost:3001/');
      const data = await response.json();
      console.log('✅ [TEST] Backend funcionando:', data.message);
    } catch (error) {
      console.log('❌ [TEST] Backend no disponible:', error.message);
      console.log('💡 [TEST] Ejecuta: cd server && npm start');
      return;
    }

    // 2. Verificar que el endpoint de Google OAuth esté disponible
    console.log('\n🔍 [TEST] Verificando endpoint de Google OAuth...');
    try {
      const response = await fetch('http://localhost:3001/api/auth/google', {
        method: 'GET',
        redirect: 'manual' // No seguir redirects automáticamente
      });
      
      console.log('📊 [TEST] Status:', response.status);
      console.log('📊 [TEST] Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 302) {
        const location = response.headers.get('location');
        console.log('✅ [TEST] Redirect a Google:', location);
      } else {
        console.log('⚠️ [TEST] Respuesta inesperada del endpoint de Google OAuth');
      }
    } catch (error) {
      console.log('❌ [TEST] Error al verificar endpoint de Google:', error.message);
    }

    // 3. Verificar usuarios con OAuth
    console.log('\n👥 [TEST] Verificando usuarios con OAuth...');
    const usuariosOAuth = await prisma.Usuario.findMany({
      where: {
        auth_provider: {
          not: 'email'
        }
      },
      select: {
        id_Usuario: true,
        correo: true,
        auth_provider: true,
        google_id: true,
        facebook_id: true,
        twitter_id: true
      }
    });

    if (usuariosOAuth.length === 0) {
      console.log('   No hay usuarios con OAuth registrados.');
    } else {
      console.log(`   Usuarios con OAuth encontrados: ${usuariosOAuth.length}`);
      usuariosOAuth.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.correo} (${user.auth_provider})`);
        if (user.google_id) console.log(`      Google ID: ${user.google_id}`);
        if (user.facebook_id) console.log(`      Facebook ID: ${user.facebook_id}`);
        if (user.twitter_id) console.log(`      Twitter ID: ${user.twitter_id}`);
      });
    }

    // 4. Verificar configuración de variables de entorno
    console.log('\n⚙️ [TEST] Verificando configuración OAuth...');
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log(`   GOOGLE_CLIENT_ID: ${googleClientId ? 'CONFIGURADO' : 'NO_CONFIGURADO'}`);
    console.log(`   GOOGLE_CLIENT_SECRET: ${googleClientSecret ? 'CONFIGURADO' : 'NO_CONFIGURADO'}`);
    
    if (!googleClientId || !googleClientSecret) {
      console.log('⚠️ [TEST] Google OAuth no está configurado correctamente');
      console.log('💡 [TEST] Verifica las variables de entorno en el archivo .env');
    }

    // 5. Sugerencias
    console.log('\n💡 [TEST] Sugerencias:');
    console.log('   1. Asegúrate de que el servidor frontend esté corriendo en puerto 3000');
    console.log('   2. Asegúrate de que el servidor backend esté corriendo en puerto 3001');
    console.log('   3. Verifica que las variables de entorno de Google OAuth estén configuradas');
    console.log('   4. Prueba acceder a: http://localhost:3000/auth/callback directamente');

  } catch (error) {
    console.error('❌ [TEST] Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
testOAuthFlow();

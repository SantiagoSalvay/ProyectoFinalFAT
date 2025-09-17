async function checkFrontend() {
  try {
    console.log('🌐 [CHECK] Verificando servidor frontend...\n');

    // 1. Verificar que el frontend esté corriendo
    console.log('🔍 [CHECK] Probando http://localhost:3000...');
    try {
      const response = await fetch('http://localhost:3000/', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log('📊 [CHECK] Status:', response.status);
      console.log('📊 [CHECK] Content-Type:', response.headers.get('content-type'));
      
      if (response.status === 200) {
        console.log('✅ [CHECK] Frontend funcionando correctamente');
      } else {
        console.log('⚠️ [CHECK] Frontend respondiendo pero con status inesperado');
      }
    } catch (error) {
      console.log('❌ [CHECK] Frontend no disponible:', error.message);
      console.log('💡 [CHECK] Ejecuta: pnpm dev (desde la raíz del proyecto)');
      return;
    }

    // 2. Verificar la ruta específica de callback
    console.log('\n🔍 [CHECK] Probando http://localhost:3000/auth/callback...');
    try {
      const response = await fetch('http://localhost:3000/auth/callback', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log('📊 [CHECK] Status:', response.status);
      
      if (response.status === 200) {
        console.log('✅ [CHECK] Ruta /auth/callback disponible');
      } else if (response.status === 404) {
        console.log('❌ [CHECK] Ruta /auth/callback NO encontrada');
        console.log('💡 [CHECK] Verifica que el servidor frontend se haya reiniciado correctamente');
      } else {
        console.log('⚠️ [CHECK] Respuesta inesperada de /auth/callback');
      }
    } catch (error) {
      console.log('❌ [CHECK] Error al verificar /auth/callback:', error.message);
    }

    // 3. Verificar proxy de API
    console.log('\n🔍 [CHECK] Probando proxy de API...');
    try {
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log('📊 [CHECK] Status:', response.status);
      
      if (response.status === 302) {
        console.log('✅ [CHECK] Proxy de API funcionando correctamente');
        const location = response.headers.get('location');
        console.log('📋 [CHECK] Redirect a:', location);
      } else {
        console.log('⚠️ [CHECK] Proxy de API no funcionando como esperado');
      }
    } catch (error) {
      console.log('❌ [CHECK] Error al verificar proxy de API:', error.message);
    }

    // 4. Sugerencias
    console.log('\n💡 [CHECK] Sugerencias:');
    console.log('   1. Si el frontend no está corriendo:');
    console.log('      - Ve a la raíz del proyecto');
    console.log('      - Ejecuta: pnpm dev');
    console.log('   2. Si el frontend está corriendo pero /auth/callback da 404:');
    console.log('      - Detén el servidor (Ctrl+C)');
    console.log('      - Reinicia: pnpm dev');
    console.log('   3. Si el proxy no funciona:');
    console.log('      - Verifica que vite.config.ts tenga la configuración correcta');

  } catch (error) {
    console.error('❌ [CHECK] Error durante la verificación:', error);
  }
}

// Ejecutar la función
checkFrontend();

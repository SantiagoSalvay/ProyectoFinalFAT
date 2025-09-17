async function checkServerStatus() {
  try {
    console.log('🔍 [STATUS] Verificando estado del servidor...\n');

    // 1. Verificar servidor frontend
    console.log('🌐 [STATUS] Probando servidor frontend (puerto 3000)...');
    try {
      const response = await fetch('http://localhost:3000/', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log(`📊 [STATUS] Frontend - Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ [STATUS] Servidor frontend funcionando');
      } else {
        console.log('⚠️ [STATUS] Servidor frontend respondiendo pero con status inesperado');
      }
    } catch (error) {
      console.log('❌ [STATUS] Servidor frontend NO está funcionando');
      console.log('💡 [STATUS] Ejecuta: pnpm dev');
      return;
    }

    // 2. Verificar ruta específica de callback
    console.log('\n🔍 [STATUS] Probando ruta /auth/callback...');
    try {
      const response = await fetch('http://localhost:3000/auth/callback', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log(`📊 [STATUS] Callback - Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ [STATUS] Ruta /auth/callback funcionando correctamente');
      } else if (response.status === 404) {
        console.log('❌ [STATUS] Ruta /auth/callback NO encontrada (404)');
        console.log('💡 [STATUS] El servidor necesita ser reiniciado completamente');
      } else {
        console.log(`⚠️ [STATUS] Respuesta inesperada: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ [STATUS] Error al verificar /auth/callback:', error.message);
    }

    // 3. Verificar proxy de API
    console.log('\n🔍 [STATUS] Probando proxy de API...');
    try {
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log(`📊 [STATUS] API Proxy - Status: ${response.status}`);
      
      if (response.status === 302) {
        console.log('✅ [STATUS] Proxy de API funcionando correctamente');
      } else {
        console.log('⚠️ [STATUS] Proxy de API no funcionando como esperado');
      }
    } catch (error) {
      console.log('❌ [STATUS] Error al verificar proxy de API:', error.message);
    }

    // 4. Diagnóstico
    console.log('\n🔍 [STATUS] Diagnóstico:');
    if (response && response.status === 404) {
      console.log('❌ [STATUS] PROBLEMA: La ruta /auth/callback no está disponible');
      console.log('💡 [STATUS] SOLUCIÓN:');
      console.log('   1. Detén completamente el servidor (Ctrl+C)');
      console.log('   2. Espera 5 segundos');
      console.log('   3. Reinicia: pnpm dev');
      console.log('   4. Espera a que aparezca "Local: http://localhost:3000/"');
      console.log('   5. Prueba nuevamente');
    }

  } catch (error) {
    console.error('❌ [STATUS] Error durante la verificación:', error);
  }
}

// Ejecutar la función
checkServerStatus();

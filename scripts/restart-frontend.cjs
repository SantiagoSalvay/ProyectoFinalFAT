const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function restartFrontend() {
  try {
    console.log('🔄 [RESTART] Reiniciando servidor frontend...\n');

    // 1. Matar procesos en puerto 3000
    console.log('🛑 [RESTART] Matando procesos en puerto 3000...');
    try {
      await execAsync('netstat -ano | findstr :3000');
      console.log('   Procesos encontrados en puerto 3000');
      
      // Matar el proceso principal
      await execAsync('taskkill /F /PID 11044');
      console.log('✅ [RESTART] Proceso matado exitosamente');
    } catch (error) {
      console.log('⚠️ [RESTART] No se pudo matar el proceso (puede que ya esté cerrado)');
    }

    // 2. Esperar un momento
    console.log('\n⏳ [RESTART] Esperando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Verificar que el puerto esté libre
    console.log('🔍 [RESTART] Verificando que el puerto esté libre...');
    try {
      const { stdout } = await execAsync('netstat -ano | findstr :3000');
      if (stdout.trim()) {
        console.log('⚠️ [RESTART] Aún hay procesos en puerto 3000');
        console.log('   Puedes matarlos manualmente o cambiar de puerto');
      } else {
        console.log('✅ [RESTART] Puerto 3000 está libre');
      }
    } catch (error) {
      console.log('✅ [RESTART] Puerto 3000 está libre');
    }

    // 4. Instrucciones para reiniciar
    console.log('\n🚀 [RESTART] Instrucciones para reiniciar:');
    console.log('   1. Ve a la raíz del proyecto (donde está package.json)');
    console.log('   2. Ejecuta: pnpm dev');
    console.log('   3. Espera a que el servidor inicie completamente');
    console.log('   4. Prueba acceder a: http://localhost:3000/auth/callback');

    console.log('\n💡 [RESTART] Si el problema persiste:');
    console.log('   - Verifica que no haya errores en la consola del servidor');
    console.log('   - Asegúrate de estar en la raíz del proyecto');
    console.log('   - Prueba con: npm run dev (en lugar de pnpm dev)');

  } catch (error) {
    console.error('❌ [RESTART] Error durante el reinicio:', error);
  }
}

// Ejecutar la función
restartFrontend();

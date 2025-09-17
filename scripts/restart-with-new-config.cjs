const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function restartWithNewConfig() {
  try {
    console.log('🔄 [RESTART] Reiniciando con nueva configuración...\n');

    // 1. Matar procesos en puerto 3000
    console.log('🛑 [RESTART] Matando procesos en puerto 3000...');
    try {
      const { stdout } = await execAsync('netstat -ano | findstr :3000');
      if (stdout.trim()) {
        const lines = stdout.split('\n').filter(line => line.trim());
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              pids.add(pid);
            }
          }
        });

        for (const pid of pids) {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`✅ [RESTART] Proceso ${pid} matado`);
          } catch (error) {
            console.log(`⚠️ [RESTART] No se pudo matar proceso ${pid}`);
          }
        }
      } else {
        console.log('✅ [RESTART] No hay procesos en puerto 3000');
      }
    } catch (error) {
      console.log('✅ [RESTART] Puerto 3000 está libre');
    }

    // 2. Esperar
    console.log('\n⏳ [RESTART] Esperando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Verificar que el puerto esté libre
    try {
      const { stdout } = await execAsync('netstat -ano | findstr :3000');
      if (stdout.trim()) {
        console.log('⚠️ [RESTART] Aún hay procesos en puerto 3000');
      } else {
        console.log('✅ [RESTART] Puerto 3000 está libre');
      }
    } catch (error) {
      console.log('✅ [RESTART] Puerto 3000 está libre');
    }

    console.log('\n🚀 [RESTART] Ahora ejecuta: pnpm dev');
    console.log('💡 [RESTART] La nueva configuración debería permitir que /auth/callback funcione');

  } catch (error) {
    console.error('❌ [RESTART] Error durante el reinicio:', error);
  }
}

// Ejecutar la función
restartWithNewConfig();

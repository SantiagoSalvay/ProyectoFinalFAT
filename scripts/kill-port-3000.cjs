const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function killPort3000() {
  try {
    console.log('🛑 [KILL] Matando todos los procesos en puerto 3000...\n');

    // 1. Obtener todos los PIDs en puerto 3000
    console.log('🔍 [KILL] Buscando procesos en puerto 3000...');
    const { stdout } = await execAsync('netstat -ano | findstr :3000');
    
    if (!stdout.trim()) {
      console.log('✅ [KILL] No hay procesos en puerto 3000');
      return;
    }

    console.log('📋 [KILL] Procesos encontrados:');
    console.log(stdout);

    // 2. Extraer PIDs únicos
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

    console.log(`\n🎯 [KILL] PIDs únicos encontrados: ${Array.from(pids).join(', ')}`);

    // 3. Matar cada PID
    for (const pid of pids) {
      try {
        console.log(`🛑 [KILL] Matando proceso PID: ${pid}`);
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`✅ [KILL] Proceso ${pid} matado exitosamente`);
      } catch (error) {
        console.log(`⚠️ [KILL] No se pudo matar proceso ${pid}: ${error.message}`);
      }
    }

    // 4. Verificar que el puerto esté libre
    console.log('\n🔍 [KILL] Verificando que el puerto esté libre...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const { stdout: checkOutput } = await execAsync('netstat -ano | findstr :3000');
      if (checkOutput.trim()) {
        console.log('⚠️ [KILL] Aún hay procesos en puerto 3000:');
        console.log(checkOutput);
      } else {
        console.log('✅ [KILL] Puerto 3000 está completamente libre');
      }
    } catch (error) {
      console.log('✅ [KILL] Puerto 3000 está completamente libre');
    }

    console.log('\n🚀 [KILL] Ahora puedes reiniciar el servidor frontend:');
    console.log('   1. Ve a la raíz del proyecto');
    console.log('   2. Ejecuta: pnpm dev');

  } catch (error) {
    console.error('❌ [KILL] Error durante el proceso:', error);
  }
}

// Ejecutar la función
killPort3000();

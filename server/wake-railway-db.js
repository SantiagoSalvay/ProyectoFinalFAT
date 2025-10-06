import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wakeDatabase() {
  console.log('⏳ Intentando despertar la base de datos de Railway...\n');
  
  const maxAttempts = 5;
  const delayBetweenAttempts = 2000; // 2 segundos
  
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      console.log(`📡 Intento ${i}/${maxAttempts}...`);
      
      await prisma.$executeRaw`SELECT 1`;
      
      console.log('✅ ¡Base de datos activa!');
      console.log('🎉 Puedes iniciar tu servidor ahora.\n');
      
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.log(`❌ Fallo: ${error.message}`);
      
      if (i < maxAttempts) {
        console.log(`⏱️  Esperando ${delayBetweenAttempts / 1000} segundos antes del próximo intento...\n`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      } else {
        console.error('\n💥 No se pudo despertar la base de datos después de 5 intentos.');
        console.error('📝 Soluciones:');
        console.error('   1. Ve a Railway y activa manualmente el servicio');
        console.error('   2. Usa una base de datos local (ver SOLUCION_BD_PAUSADA.md)');
        console.error('   3. Ejecuta: npm run keep-db-alive (en otra terminal)\n');
        
        await prisma.$disconnect();
        process.exit(1);
      }
    }
  }
}

wakeDatabase();


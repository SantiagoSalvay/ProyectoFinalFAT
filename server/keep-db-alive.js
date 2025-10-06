import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hacer ping cada 4 minutos (Railway pausa después de 5 min de inactividad)
const PING_INTERVAL = 4 * 60 * 1000; // 4 minutos

async function pingDatabase() {
  try {
    await prisma.$executeRaw`SELECT 1`;
    console.log(`✅ [${new Date().toLocaleTimeString()}] BD activa`);
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString()}] Error al hacer ping:`, error.message);
  }
}

console.log('🔄 Iniciando keep-alive de la base de datos...');
console.log(`⏰ Haciendo ping cada ${PING_INTERVAL / 1000 / 60} minutos`);

// Ping inicial
pingDatabase();

// Pings periódicos
setInterval(pingDatabase, PING_INTERVAL);

// Mantener el proceso vivo
process.on('SIGINT', async () => {
  console.log('\n🛑 Deteniendo keep-alive...');
  await prisma.$disconnect();
  process.exit(0);
});


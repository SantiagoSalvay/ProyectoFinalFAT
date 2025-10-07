import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugVerificationTokens() {
  try {
    console.log('🔍 [DEBUG] Iniciando análisis de tokens de verificación...\n');

    // 1. Mostrar todos los registros pendientes
    console.log('📋 [DEBUG] Registros pendientes actuales:');
    const registrosPendientes = await prisma.RegistroPendiente.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        correo: true,
        Usuario: true,
        verification_token: true,
        createdAt: true,
        token_expiry: true
      }
    });

    if (registrosPendientes.length === 0) {
      console.log('   No hay registros pendientes.');
    } else {
      registrosPendientes.forEach((reg, index) => {
        console.log(`   ${index + 1}. ID: ${reg.id}`);
        console.log(`      Correo: ${reg.correo}`);
        console.log(`      Usuario: ${reg.usuario}`);
        console.log(`      Token: ${reg.verification_token}`);
        console.log(`      Creado: ${reg.createdAt}`);
        console.log(`      Expira: ${reg.token_expiry}`);
        console.log('');
      });
    }

    // 2. Mostrar usuarios ya registrados con tokens de verificación
    console.log('👥 [DEBUG] Usuarios registrados con tokens de verificación:');
    const usuariosConTokens = await prisma.Usuario.findMany({
      where: {
        verification_token: {
          not: null
        }
      },
      select: {
        id_Usuario: true,
        correo: true,
        Usuario: true,
        verification_token: true,
        email_verified: true,
        createdAt: true
      }
    });

    if (usuariosConTokens.length === 0) {
      console.log('   No hay usuarios con tokens de verificación.');
    } else {
      usuariosConTokens.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id_usuario}`);
        console.log(`      Correo: ${user.correo}`);
        console.log(`      Usuario: ${user.usuario}`);
        console.log(`      Token: ${user.verification_token}`);
        console.log(`      Verificado: ${user.email_verified}`);
        console.log(`      Creado: ${user.createdAt}`);
        console.log('');
      });
    }

    // 3. Buscar tokens específicos mencionados en el error
    const tokenProblematico = '94f3f0b1-f45e-4a61-966b-cb43a2870bac';
    const tokenExistente = '45e49891-c756-4121-9ea6-05d9a978f3ea';

    console.log('🔍 [DEBUG] Búsqueda de tokens específicos:');
    
    // Buscar token problemático en registros pendientes
    const tokenEnPendientes = await prisma.RegistroPendiente.findFirst({
      where: { verification_token: tokenProblematico }
    });
    console.log(`   Token problemático (${tokenProblematico}) en registros pendientes: ${tokenEnPendientes ? 'SÍ' : 'NO'}`);

    // Buscar token problemático en usuarios registrados
    const tokenEnUsuarios = await prisma.Usuario.findFirst({
      where: { verification_token: tokenProblematico }
    });
    console.log(`   Token problemático en usuarios registrados: ${tokenEnUsuarios ? 'SÍ' : 'NO'}`);

    // Buscar token existente en registros pendientes
    const tokenExistenteEnPendientes = await prisma.RegistroPendiente.findFirst({
      where: { verification_token: tokenExistente }
    });
    console.log(`   Token existente (${tokenExistente}) en registros pendientes: ${tokenExistenteEnPendientes ? 'SÍ' : 'NO'}`);

    // Buscar token existente en usuarios registrados
    const tokenExistenteEnUsuarios = await prisma.Usuario.findFirst({
      where: { verification_token: tokenExistente }
    });
    console.log(`   Token existente en usuarios registrados: ${tokenExistenteEnUsuarios ? 'SÍ' : 'NO'}`);

    // 4. Estadísticas generales
    console.log('\n📊 [DEBUG] Estadísticas:');
    const totalPendientes = await prisma.RegistroPendiente.count();
    const totalUsuarios = await prisma.Usuario.count();
    const usuariosVerificados = await prisma.Usuario.count({
      where: { email_verified: true }
    });
    const usuariosNoVerificados = await prisma.Usuario.count({
      where: { email_verified: false }
    });

    console.log(`   Total registros pendientes: ${totalPendientes}`);
    console.log(`   Total usuarios: ${totalUsuarios}`);
    console.log(`   Usuarios verificados: ${usuariosVerificados}`);
    console.log(`   Usuarios no verificados: ${usuariosNoVerificados}`);

    // 5. Sugerencias de limpieza
    console.log('\n💡 [DEBUG] Sugerencias:');
    
    if (totalPendientes > 0) {
      console.log('   - Hay registros pendientes que pueden estar causando confusión');
      console.log('   - Considera limpiar registros pendientes antiguos (más de 24 horas)');
    }

    if (usuariosNoVerificados > 0) {
      console.log('   - Hay usuarios no verificados que pueden necesitar reenvío de emails');
    }

    // 6. Función de limpieza opcional
    console.log('\n🧹 [DEBUG] ¿Deseas limpiar registros pendientes antiguos? (más de 24 horas)');
    console.log('   Ejecuta: node scripts/clean-pending-registrations.js');

  } catch (error) {
    console.error('❌ [DEBUG] Error durante el análisis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugVerificationTokens();
}

export { debugVerificationTokens };

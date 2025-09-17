const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Configuración del transportador de email (igual que el servicio corregido)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Plantilla de email para recuperación (igual que el servicio)
const passwordResetTemplate = (resetToken) => ({
  subject: 'Recuperación de contraseña - DEMOS+',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2b555f; font-size: 32px; margin: 0;">DEMOS+</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #73e4fd;">
        <h2 style="color: #2b555f; margin-top: 0;">Recuperación de contraseña</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}" 
             style="background-color: #2b555f; color: white; padding: 15px 30px; text-decoration: none; 
                    border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            🔒 Recuperar contraseña
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          <strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="font-size: 14px; color: #666;">
          Si no solicitaste este cambio, puedes ignorar este correo.
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
        </p>
      </div>
    </div>
  `
});

async function testPasswordReset() {
  try {
    console.log('🧪 [TEST] Iniciando prueba del servicio de reset de contraseña...\n');

    // 1. Verificar configuración de variables de entorno
    console.log('⚙️ [TEST] Verificando configuración SMTP:');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com (por defecto)'}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '465 (por defecto)'}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'NO_CONFIGURADO'}`);
    console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? `CONFIGURADO (${process.env.SMTP_PASS.length} caracteres)` : 'NO_CONFIGURADO'}`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('❌ [TEST] Variables de entorno SMTP no configuradas correctamente');
      return;
    }

    // 2. Verificar conexión SMTP
    console.log('\n🔌 [TEST] Verificando conexión SMTP...');
    try {
      await transporter.verify();
      console.log('✅ [TEST] Conexión SMTP verificada exitosamente');
    } catch (verifyError) {
      console.error('❌ [TEST] Error al verificar conexión SMTP:', verifyError.message);
      return;
    }

    // 3. Buscar un usuario para probar
    console.log('\n👥 [TEST] Buscando usuario para prueba...');
    const usuarios = await prisma.usuario.findMany({
      take: 1,
      select: {
        id_usuario: true,
        correo: true,
        usuario: true
      }
    });

    if (usuarios.length === 0) {
      console.log('❌ [TEST] No hay usuarios en la base de datos para probar');
      return;
    }

    const usuarioPrueba = usuarios[0];
    console.log(`✅ [TEST] Usuario encontrado: ${usuarioPrueba.correo} (${usuarioPrueba.usuario})`);

    // 4. Generar token de prueba
    const { v4: uuidv4 } = require('uuid');
    const resetToken = uuidv4();
    console.log(`🔑 [TEST] Token de prueba generado: ${resetToken}`);

    // 5. Probar envío de email
    console.log('\n📧 [TEST] Enviando email de prueba...');
    try {
      const template = passwordResetTemplate(resetToken);
      
      console.log(`🔗 [TEST] Enlace generado: http://localhost:3000/reset-password/${resetToken}`);
      
      const result = await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
        to: usuarioPrueba.correo,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ [TEST] Email de prueba enviado exitosamente');
      console.log(`📧 [TEST] Message ID: ${result.messageId}`);
      
    } catch (emailError) {
      console.error('❌ [TEST] Error al enviar email de prueba:', emailError.message);
      console.error('📋 [TEST] Detalles del error:', {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response
      });
      return;
    }

    // 6. Actualizar token en la base de datos (simulando el proceso real)
    console.log('\n💾 [TEST] Actualizando token en la base de datos...');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    await prisma.usuario.update({
      where: { id_usuario: usuarioPrueba.id_usuario },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      }
    });
    
    console.log('✅ [TEST] Token actualizado en la base de datos');
    console.log(`⏰ [TEST] Token expira: ${resetTokenExpiry}`);

    console.log('\n🎉 [TEST] Prueba completada exitosamente!');
    console.log('💡 [TEST] El servicio de reset de contraseña está funcionando correctamente.');

  } catch (error) {
    console.error('❌ [TEST] Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
testPasswordReset();

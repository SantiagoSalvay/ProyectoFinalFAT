const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Configuración del transportador de email (igual que en el servicio)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Plantilla de email (igual que en el servicio)
const emailTemplate = (verificationToken) => ({
  subject: 'Verifica tu correo electrónico - DEMOS+',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2b555f; font-size: 32px; margin: 0;">DEMOS+</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #73e4fd;">
        <h2 style="color: #2b555f; margin-top: 0;">¡Bienvenido a DEMOS+!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Gracias por registrarte en nuestra plataforma. Para completar tu registro y activar tu cuenta, 
          necesitas verificar tu correo electrónico.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/verificar/${verificationToken}" 
             style="background-color: #2b555f; color: white; padding: 15px 30px; text-decoration: none; 
                    border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            ✉️ Verificar mi correo electrónico
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
        </p>
        <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px; font-size: 12px;">
          http://localhost:3000/verificar/${verificationToken}
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          <strong>Importante:</strong> Este enlace es válido hasta que completes la verificación.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="font-size: 14px; color: #666;">
          Si no creaste una cuenta en DEMOS+, puedes ignorar este correo.
        </p>
        <p style="font-size: 12px; color: #999;">
          © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
        </p>
      </div>
    </div>
  `
});

async function resendVerificationEmail() {
  try {
    console.log('📧 [REENVÍO] Iniciando reenvío de email de verificación...\n');

    // 1. Buscar registros pendientes
    const registrosPendientes = await prisma.RegistroPendiente.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        correo: true,
        Usuario: true,
        verification_token: true,
        createdAt: true
      }
    });

    if (registrosPendientes.length === 0) {
      console.log('❌ [REENVÍO] No hay registros pendientes para reenviar emails.');
      return;
    }

    console.log(`📋 [REENVÍO] Encontrados ${registrosPendientes.length} registros pendientes:`);
    registrosPendientes.forEach((reg, index) => {
      const horasTranscurridas = Math.floor((Date.now() - new Date(reg.createdAt).getTime()) / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${reg.correo} (${reg.usuario}) - Token: ${reg.verification_token} - Hace ${horasTranscurridas} horas`);
    });

    // 2. Reenviar emails
    for (const registro of registrosPendientes) {
      try {
        console.log(`\n📧 [REENVÍO] Enviando email a ${registro.correo}...`);
        
        const template = emailTemplate(registro.verification_token);
        
        console.log(`🔗 [REENVÍO] Enlace generado: http://localhost:3000/verificar/${registro.verification_token}`);
        
        await transporter.sendMail({
          from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
          to: registro.correo,
          subject: template.subject,
          html: template.html
        });
        
        console.log(`✅ [REENVÍO] Email enviado exitosamente a ${registro.correo}`);
        
      } catch (emailError) {
        console.error(`❌ [REENVÍO] Error al enviar email a ${registro.correo}:`, emailError.message);
      }
    }

    console.log('\n🎉 [REENVÍO] Proceso de reenvío completado.');
    console.log('💡 [REENVÍO] Los usuarios pueden ahora verificar sus cuentas con los enlaces enviados.');

  } catch (error) {
    console.error('❌ [REENVÍO] Error durante el reenvío:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
resendVerificationEmail();

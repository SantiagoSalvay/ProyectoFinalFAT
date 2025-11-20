import nodemailer from 'nodemailer';

// Configuración del transportador de email (IDÉNTICA a la de verificación)
const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = parseInt(process.env.SMTP_PORT || '587');
const secure = process.env.SMTP_SECURE === 'true' ? true : (port === 465);
const isBrevo = String(host).includes('brevo');
const passRaw = isBrevo
  ? (process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '')
  : (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '');
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: (passRaw || '').replace(/\s+/g, '')
  },
  requireTLS: !secure,
  tls: {
    rejectUnauthorized: false
  }
});

// Plantilla de email para recuperación (SIMPLE como la de verificación)
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

export const passwordResetService = {
  /**
   * Envía un correo de recuperación de contraseña
   * USANDO EXACTAMENTE LA MISMA MECÁNICA QUE sendVerificationEmail
   */
  sendPasswordResetEmail: async (to, resetToken) => {
    try {
      console.log('📧 [PASSWORD RESET] Enviando email de recuperación...');
      console.log('🔗 [PASSWORD RESET] URL: http://localhost:3000/reset-password/' + resetToken);
      
      const template = passwordResetTemplate(resetToken);
      
      // EXACTAMENTE igual al código de sendVerificationEmail
      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ [PASSWORD RESET] Email de recuperación enviado a:', to);
      return true;
    } catch (error) {
      console.error('❌ [PASSWORD RESET] Error al enviar email de recuperación:', error);
      throw error;
    }
  }
};
import nodemailer from 'nodemailer';

// Configuración del transportador de email
const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = parseInt(process.env.SMTP_PORT || '587');
const secure = process.env.SMTP_SECURE === 'true' ? true : (port === 465);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  requireTLS: !secure,
  tls: {
    rejectUnauthorized: false
  }
});

// Plantillas de email
const emailTemplates = {
  verifyEmail: (verificationToken: string) => ({
    subject: 'Verifica tu correo electrónico - DEMOS+',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2b555f; text-align: center;">Verifica tu correo electrónico</h1>
        <p>Gracias por registrarte en DEMOS+. Para completar tu registro, haz clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/verificar-email/${verificationToken}" 
             style="background-color: #2b555f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar correo electrónico
          </a>
        </div>
        <p>Si no creaste una cuenta en DEMOS+, puedes ignorar este correo.</p>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 24 horas.</p>
      </div>
    `
  }),

  resetPassword: (resetToken: string) => ({
    subject: 'Recuperación de contraseña - DEMOS+',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #7c3aed; text-align: center; margin-bottom: 20px;">🔐 Recuperación de contraseña</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hola,<br><br>
            Has solicitado restablecer tu contraseña en <strong>DEMOS+</strong>. 
            Haz clic en el siguiente botón para crear una nueva contraseña:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}" 
               style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3); transition: all 0.3s ease;">
              🔑 Recuperar contraseña
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>
          <p style="color: #ef4444; font-size: 14px; font-weight: bold; background-color: #fef2f2; padding: 10px; border-radius: 6px; border-left: 4px solid #ef4444;">
            ⚠️ Este enlace expirará en 1 hora por seguridad.
          </p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              Este es un email automático de DEMOS+<br>
              Si tienes problemas, contacta nuestro soporte.
            </p>
          </div>
        </div>
      </div>
    `
  })
};

export const emailService = {
  /**
   * Envía un correo de verificación
   */
  sendVerificationEmail: async (to: string, verificationToken: string) => {
    try {
      const template = emailTemplates.verifyEmail(verificationToken);
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: template.subject,
        html: template.html
      });
      console.log('Email de verificación enviado a:', to);
      return true;
    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
      throw error;
    }
  },

  /**
   * Envía un correo de recuperación de contraseña
   */
  sendPasswordResetEmail: async (to: string, resetToken: string) => {
    try {
      const template = emailTemplates.resetPassword(resetToken);
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: template.subject,
        html: template.html
      });
      console.log('Email de recuperación enviado a:', to);
      return true;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      throw error;
    }
  }
};
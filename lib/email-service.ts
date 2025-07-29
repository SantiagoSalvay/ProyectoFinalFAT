import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2b555f; text-align: center;">Recuperación de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}" 
             style="background-color: #2b555f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Recuperar contraseña
          </a>
        </div>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
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
        from: process.env.SMTP_USER,
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
        from: process.env.SMTP_USER,
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
import nodemailer from 'nodemailer';

// Configuración del transportador de email
console.log('🔧 Configurando transporter de email con:', {
  host: process.env.SMTP_HOST || 'NO_CONFIGURADO',
  port: process.env.SMTP_PORT || 'NO_CONFIGURADO',
  user: process.env.SMTP_USER ? 'CONFIGURADO' : 'NO_CONFIGURADO',
  pass: process.env.SMTP_PASS ? 'CONFIGURADO' : 'NO_CONFIGURADO'
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Plantillas de email
const emailTemplates = {
  verifyEmail: (verificationToken) => ({
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
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/verificar/${verificationToken}" 
               style="background-color: #2b555f; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              ✉️ Verificar mi correo electrónico
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
          </p>
          <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px; font-size: 12px;">
            ${process.env.APP_URL || 'http://localhost:3000'}/verificar/${verificationToken}
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
  }),

  resetPassword: (resetToken) => ({
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
  })
};

export const emailService = {
  /**
   * Envía un correo de verificación
   */
  sendVerificationEmail: async (to, verificationToken) => {
    try {
      const template = emailTemplates.verifyEmail(verificationToken);
      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
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
   * VERSIÓN ALTERNATIVA: Usa exactamente el mismo transporter que verification
   */
  sendPasswordResetEmailAlt: async (to, resetToken) => {
    try {
      console.log('🧪 [EMAIL SERVICE] Probando con transporter principal...');
      const template = emailTemplates.resetPassword(resetToken);
      
      // Usar EXACTAMENTE el mismo código que sendVerificationEmail
      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html
      });
      console.log('✅ Email de recuperación enviado a:', to);
      return true;
    } catch (error) {
      console.error('❌ Error al enviar email de recuperación:', error);
      throw error;
    }
  },

  /**
   * Envía un correo de recuperación de contraseña
   */
  sendPasswordResetEmail: async (to, resetToken) => {
    try {
      console.log('📧 [EMAIL SERVICE] Iniciando envío de email de recuperación...');
      console.log('🔗 [EMAIL SERVICE] URL: http://localhost:3000/reset-password/' + resetToken);
      
      // Crear transporter específico para reset con configuración alternativa
      const resetTransporter = nodemailer.createTransporter({
        service: 'gmail', // Usar servicio Gmail directo
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        debug: true, // Activar debug para ver más detalles
        logger: true,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verificar conexión
      console.log('🔌 [EMAIL SERVICE] Verificando conexión SMTP...');
      await resetTransporter.verify();
      console.log('✅ [EMAIL SERVICE] Conexión SMTP verificada');
      
      const template = emailTemplates.resetPassword(resetToken);
      
      // Usar exactamente el mismo formato que verification
      const mailOptions = {
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`, // Cambié el emoji a ser igual
        to,
        subject: template.subject,
        html: template.html
      };
      
      console.log('📤 [EMAIL SERVICE] Enviando email con opciones:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      const result = await resetTransporter.sendMail(mailOptions);
      console.log('✅ [EMAIL SERVICE] Resultado del envío:', {
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected,
        pending: result.pending
      });
      
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error detallado:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      throw error;
    }
  }
};
import nodemailer from 'nodemailer';

// Configuración del transportador de email
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
  }),

  welcomeEmail: (userName) => ({
    subject: '¡Bienvenido a DEMOS+! Tu cuenta ha sido activada 🎉',
    html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
            DEMOS+
          </h1>
        </div>
        
        <!-- Mensaje principal -->
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
          <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
            ¡Bienvenido, ${userName}!
          </h2>
          <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a usar nuestra plataforma.
          </p>
          
          <!-- Botón principal -->
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; 
                    border-radius: 25px; font-weight: 600; font-size: 16px; margin-bottom: 30px;">
            🚀 Comenzar en DEMOS+
          </a>
        </div>
        
        <!-- Funcionalidades rápidas -->
        <div style="padding: 0 30px 30px 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
              <div style="font-size: 14px; color: #495057; font-weight: 600;">Crear Foros</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🤝</div>
              <div style="font-size: 14px; color: #495057; font-weight: 600;">Hacer Donaciones</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">📢</div>
              <div style="font-size: 14px; color: #495057; font-weight: 600;">Solicitar Ayuda</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
              <div style="font-size: 14px; color: #495057; font-weight: 600;">Participar</div>
            </div>
          </div>
        </div>
        
        <!-- Footer simple -->
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
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
      console.log('📧 [EMAIL SERVICE] Enviando email de verificación:', {
        to: to,
        token: verificationToken,
        tokenLength: verificationToken ? verificationToken.length : 0
      });
      
      const template = emailTemplates.verifyEmail(verificationToken);
      
      console.log('🔗 [EMAIL SERVICE] Enlace generado:', `http://localhost:3000/verificar/${verificationToken}`);
      
      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ [EMAIL SERVICE] Email enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de verificación:', error);
      throw error;
    }
  },

  /**
   * VERSIÓN ALTERNATIVA: Usa exactamente el mismo transporter que verification
   */
  sendPasswordResetEmailAlt: async (to, resetToken) => {
    try {
      const template = emailTemplates.resetPassword(resetToken);
      
      // Usar EXACTAMENTE el mismo código que sendVerificationEmail
      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html
      });
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
      // Crear transporter específico para reset con configuración alternativa
      const resetTransporter = nodemailer.createTransport({
        service: 'gmail', // Usar servicio Gmail directo
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        debug: false, // Desactivar debug
        logger: false,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verificar conexión
      await resetTransporter.verify();
      
      const template = emailTemplates.resetPassword(resetToken);
      
      // Usar exactamente el mismo formato que verification
      const mailOptions = {
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`, // Cambié el emoji a ser igual
        to,
        subject: template.subject,
        html: template.html
      };
      
      const result = await resetTransporter.sendMail(mailOptions);
      
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
  },

  /**
   * Envía un correo de bienvenida después de la verificación
   */
  sendWelcomeEmail: async (to, userName) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de bienvenida:', {
        to: to,
        userName: userName
      });
      
      const template = emailTemplates.welcomeEmail(userName);
      
      await transporter.sendMail({
        from: `"DEMOS+ 🎉" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ [EMAIL SERVICE] Email de bienvenida enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de bienvenida:', error);
      throw error;
    }
  }
};
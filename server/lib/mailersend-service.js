import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Inicializar MailerSend con la API Key
const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY || '',
});

// Validar configuración
if (!process.env.MAILERSEND_API_KEY) {
    console.error('❌ [MAILERSEND] MAILERSEND_API_KEY no está configurada');
}

// Email del remitente (debe estar verificado en MailerSend)
const getFromEmail = () => {
    return process.env.MAILERSEND_FROM_EMAIL || process.env.SMTP_USER || 'noreply@demosmas.site';
};

const getFromName = () => {
    return process.env.MAILERSEND_FROM_NAME || 'DEMOS+';
};

// Plantillas de email (mismas que en email-service.js)
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
    }),

    loginNotification: (userName, loginInfo) => ({
        subject: 'Nuevo inicio de sesión en tu cuenta DEMOS+',
        html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
            DEMOS+
          </h1>
        </div>
        
        <!-- Mensaje principal -->
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
          <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
            Nuevo inicio de sesión detectado
          </h2>
          <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hola ${userName}, hemos detectado un nuevo inicio de sesión en tu cuenta.
          </p>
        </div>
        
        <!-- Información de la sesión -->
        <div style="padding: 0 30px 30px 30px;">
          <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #ff6b6b;">
            <h3 style="color: #2b555f; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
              📍 Detalles de la sesión:
            </h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">🕐 Fecha y hora:</strong>
              <span style="color: #6c757d; margin-left: 8px;">${loginInfo.dateTime}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">🌐 Dirección IP:</strong>
              <span style="color: #6c757d; margin-left: 8px; font-family: monospace;">${loginInfo.ipAddress}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">💻 Dispositivo:</strong>
              <span style="color: #6c757d; margin-left: 8px;">${loginInfo.userAgent}</span>
            </div>
            
            <div style="margin-bottom: 0;">
              <strong style="color: #495057;">📍 Ubicación aproximada:</strong>
              <span style="color: #6c757d; margin-left: 8px;">${loginInfo.location || 'No disponible'}</span>
            </div>
          </div>
        </div>
        
        <!-- Advertencia de seguridad -->
        <div style="padding: 0 30px 30px 30px;">
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
              <strong style="color: #856404;">¿No fuiste tú?</strong>
            </div>
            <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
              Si no iniciaste sesión en tu cuenta, te recomendamos cambiar tu contraseña inmediatamente y revisar la actividad de tu cuenta.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">
            Este es un mensaje automático de seguridad de DEMOS+
          </p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">
            © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
          </p>
        </div>
        
      </div>
    `
    }),

    passwordChangeNotification: (userName, changeInfo) => ({
        subject: 'Tu contraseña ha sido cambiada - DEMOS+',
        html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2b555f 0%, #73e4fd 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">DEMOS+</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Plataforma de donaciones y ayuda comunitaria</p>
        </div>
        
        <!-- Contenido principal -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🔒</span>
            </div>
            <h2 style="color: #2b555f; margin: 0 0 10px 0; font-size: 24px;">Contraseña actualizada</h2>
            <p style="color: #6c757d; font-size: 16px; margin: 0;">Tu contraseña ha sido cambiada exitosamente</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #2b555f; margin: 0 0 20px 0; font-size: 18px;">📋 Detalles del cambio</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">📅 Fecha y hora:</strong>
              <span style="color: #6c757d; margin-left: 8px;">${changeInfo.dateTime}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">🌐 Dirección IP:</strong>
              <span style="color: #6c757d; margin-left: 8px;">${changeInfo.ipAddress}</span>
            </div>
            
            <div style="margin-bottom: 0;">
              <strong style="color: #495057;">💻 Dispositivo:</strong>
              <span style="color: #6c757d; margin-left: 8px;">${changeInfo.userAgent}</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">
            Este es un mensaje automático de seguridad de DEMOS+
          </p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">
            © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
          </p>
        </div>
        
      </div>
    `
    }),

    oauthAccountCreated: (userName, provider) => ({
        subject: `¡Cuenta creada exitosamente con ${provider}! - DEMOS+`,
        html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2b555f 0%, #73e4fd 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">DEMOS+</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Plataforma de donaciones y ayuda comunitaria</p>
        </div>
        
        <!-- Contenido principal -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">${provider === 'Google' ? '🔍' : '🐦'}</span>
            </div>
            <h2 style="color: #2b555f; margin: 0 0 10px 0; font-size: 24px;">¡Cuenta creada exitosamente!</h2>
            <p style="color: #6c757d; font-size: 16px; margin: 0;">Tu cuenta ha sido creada usando ${provider}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">
            Este es un mensaje automático de DEMOS+
          </p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">
            © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
          </p>
        </div>
        
      </div>
    `
    })
};

// Función auxiliar para enviar emails
const sendEmail = async (to, subject, html, fromName = getFromName()) => {
    try {
        console.log('📧 [MAILERSEND] Enviando email:', {
            to,
            subject,
            from: getFromEmail()
        });

        const sentFrom = new Sender(getFromEmail(), fromName);
        const recipients = [new Recipient(to)];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(subject)
            .setHtml(html);

        const response = await mailerSend.email.send(emailParams);

        console.log('✅ [MAILERSEND] Email enviado exitosamente:', response);
        return true;
    } catch (error) {
        console.error('❌ [MAILERSEND] Error al enviar email:', {
            message: error.message,
            body: error.body,
            statusCode: error.statusCode
        });
        throw error;
    }
};

// Servicio de email exportado
export const emailService = {
    /**
     * Envía un correo de verificación
     */
    sendVerificationEmail: async (to, verificationToken) => {
        const template = emailTemplates.verifyEmail(verificationToken);
        return sendEmail(to, template.subject, template.html, 'DEMOS+ 📧');
    },

    /**
     * Envía un correo de recuperación de contraseña
     */
    sendPasswordResetEmail: async (to, resetToken) => {
        const template = emailTemplates.resetPassword(resetToken);
        return sendEmail(to, template.subject, template.html, 'DEMOS+ 📧');
    },

    /**
     * Envía un correo de bienvenida después de la verificación
     */
    sendWelcomeEmail: async (to, userName) => {
        const template = emailTemplates.welcomeEmail(userName);
        return sendEmail(to, template.subject, template.html, 'DEMOS+ 🎉');
    },

    /**
     * Envía un correo de notificación de inicio de sesión
     */
    sendLoginNotificationEmail: async (to, userName, loginInfo) => {
        const template = emailTemplates.loginNotification(userName, loginInfo);
        return sendEmail(to, template.subject, template.html, 'DEMOS+ Security');
    },

    /**
     * Envía un correo de notificación de cambio de contraseña
     */
    sendPasswordChangeNotificationEmail: async (to, userName, changeInfo) => {
        const template = emailTemplates.passwordChangeNotification(userName, changeInfo);
        return sendEmail(to, template.subject, template.html, 'DEMOS+ Security');
    },

    /**
     * Envía un correo de notificación de cuenta creada con OAuth
     */
    sendOAuthAccountCreatedEmail: async (to, userName, provider) => {
        const template = emailTemplates.oauthAccountCreated(userName, provider);
        return sendEmail(to, template.subject, template.html, 'DEMOS+ Welcome');
    },

    /**
     * Verifica la configuración de MailerSend
     */
    verifyTransporter: async () => {
        if (!process.env.MAILERSEND_API_KEY) {
            throw new Error('MAILERSEND_API_KEY no está configurada');
        }
        console.log('✅ [MAILERSEND] Configuración verificada');
        return true;
    }
};

import nodemailer from 'nodemailer';

// Nota: Las variables de entorno ya están cargadas en server/src/index.js
// No necesitamos cargar dotenv aquí, ya que en producción las variables
// se configuran directamente en el servidor y en local se cargan desde index.js

// Función para crear transporter
const createTransporter = () => {
  // Validar que las variables de entorno estén configuradas
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const errorMsg = '❌ [EMAIL SERVICE] Variables de entorno SMTP no configuradas. ' +
      'Se requieren SMTP_USER y SMTP_PASS. ' +
      `SMTP_USER: ${process.env.SMTP_USER ? 'Configurado' : 'FALTANTE'}, ` +
      `SMTP_PASS: ${process.env.SMTP_PASS ? 'Configurado' : 'FALTANTE'}`;
    console.error(errorMsg);
    throw new Error('Configuración SMTP incompleta. Verifica las variables de entorno SMTP_USER y SMTP_PASS.');
  }

  console.log('🔧 [EMAIL SERVICE] Creando transporter con configuración:', {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    user: process.env.SMTP_USER,
    pass: 'Configurada' // No mostrar la contraseña en logs
  });
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Configuraciones para evitar spam
    tls: {
      rejectUnauthorized: false
    },
    // Headers adicionales para mejorar la entrega
    headers: {
      'X-Mailer': 'DEMOS+ Platform',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal'
    }
  });
};

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
    text: `
DEMOS+ - Notificación de Seguridad

Hola ${userName},

Hemos detectado un nuevo inicio de sesión en tu cuenta DEMOS+.

Detalles de la sesión:
- Fecha y hora: ${loginInfo.dateTime}
- Dirección IP: ${loginInfo.ipAddress}
- Dispositivo: ${loginInfo.userAgent}
- Ubicación: ${loginInfo.location || 'No disponible'}

¿No fuiste tú?
Si no iniciaste sesión en tu cuenta, te recomendamos cambiar tu contraseña inmediatamente y revisar la actividad de tu cuenta.

Acciones recomendadas:
- Ver mi cuenta: ${process.env.APP_URL || 'http://localhost:3000'}/dashboard
- Cambiar contraseña: ${process.env.APP_URL || 'http://localhost:3000'}/change-password

Este es un mensaje automático de seguridad de DEMOS+.
© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
    `,
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
        
        <!-- Botones de acción -->
        <div style="padding: 0 30px 30px 30px; text-align: center;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; 
                    border-radius: 25px; font-weight: 600; font-size: 14px; margin: 0 10px 10px 0;">
            🔍 Ver mi cuenta
          </a>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/change-password" 
             style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 12px 25px; text-decoration: none; 
                    border-radius: 25px; font-weight: 600; font-size: 14px; margin: 0 0 10px 10px;">
            🔒 Cambiar contraseña
          </a>
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
    text: `
DEMOS+ - Notificación de Seguridad

Hola ${userName},

Tu contraseña ha sido cambiada exitosamente en tu cuenta DEMOS+.

Detalles del cambio:
- Fecha y hora: ${changeInfo.dateTime}
- Dirección IP: ${changeInfo.ipAddress}
- Dispositivo: ${changeInfo.userAgent}

Si no realizaste este cambio, contacta inmediatamente con nuestro equipo de soporte.

Saludos,
El equipo de DEMOS+
    `,
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
          
          <!-- Advertencia de seguridad -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
              <strong style="color: #856404;">¿No realizaste este cambio?</strong>
            </div>
            <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
              Si no cambiaste tu contraseña, contacta inmediatamente con nuestro equipo de soporte para asegurar la seguridad de tu cuenta.
            </p>
          </div>
          
          <!-- Botón de acción -->
          <div style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; 
                      border-radius: 25px; font-weight: 600; font-size: 14px;">
              🔍 Ir a mi cuenta
            </a>
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
    text: `
DEMOS+ - Cuenta Creada

Hola ${userName},

¡Tu cuenta ha sido creada exitosamente usando ${provider}!

Tu cuenta está lista para usar. Puedes acceder a todas las funcionalidades de DEMOS+.

Saludos,
El equipo de DEMOS+
    `,
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
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #2b555f; margin: 0 0 20px 0; font-size: 18px;">🎉 ¡Bienvenido a DEMOS+!</h3>
            
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Tu cuenta está lista para usar. Puedes acceder a todas las funcionalidades de nuestra plataforma:
            </p>
            
            <ul style="color: #495057; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>📝 Crear y participar en foros</li>
              <li>🎯 Publicar pedidos de donación</li>
              <li>🤝 Conectar con la comunidad</li>
              <li>📊 Ver rankings y estadísticas</li>
            </ul>
          </div>
          
          <!-- Información de seguridad -->
          <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 20px; margin-right: 10px;">🔒</span>
              <strong style="color: #0066cc;">Cuenta segura</strong>
            </div>
            <p style="color: #0066cc; font-size: 14px; margin: 0; line-height: 1.5;">
              Tu cuenta está vinculada a ${provider}, por lo que es segura y no necesitas recordar una contraseña adicional.
            </p>
          </div>
          
          <!-- Botón de acción -->
          <div style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; 
                      border-radius: 25px; font-weight: 600; font-size: 14px;">
              🚀 Comenzar a usar DEMOS+
            </a>
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
      const transporter = createTransporter();
      
      console.log('🔗 [EMAIL SERVICE] Enlace generado:', `${process.env.APP_URL || 'http://localhost:3000'}/verificar/${verificationToken}`);
      
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
      const transporter = createTransporter();
      
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
      const transporter = createTransporter();
      
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
  },

  /**
   * Envía un correo de notificación de inicio de sesión
   */
  sendLoginNotificationEmail: async (to, userName, loginInfo) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de notificación de login:', {
        to: to,
        userName: userName,
        ipAddress: loginInfo.ipAddress,
        userAgent: loginInfo.userAgent
      });
      
      const template = emailTemplates.loginNotification(userName, loginInfo);
      const transporter = createTransporter();
      
      await transporter.sendMail({
        from: `"DEMOS+ Security" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        // Headers adicionales para mejorar la entrega
        headers: {
          'X-Mailer': 'DEMOS+ Platform',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'List-Unsubscribe': `<${process.env.APP_URL || 'http://localhost:3000'}/unsubscribe>`,
          'X-Report-Abuse': `Please report abuse to ${process.env.SMTP_USER}`
        }
      });
      
      console.log('✅ [EMAIL SERVICE] Email de notificación de login enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de notificación de login:', error);
      throw error;
    }
  },

  /**
   * Envía un correo de notificación de cambio de contraseña
   */
  sendPasswordChangeNotificationEmail: async (to, userName, changeInfo) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de notificación de cambio de contraseña:', {
        to: to,
        userName: userName,
        ipAddress: changeInfo.ipAddress,
        userAgent: changeInfo.userAgent
      });

      const template = emailTemplates.passwordChangeNotification(userName, changeInfo);
      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"DEMOS+ Security" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        // Headers adicionales para mejorar la entrega
        headers: {
          'X-Mailer': 'DEMOS+ Platform',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'List-Unsubscribe': `<${process.env.APP_URL || 'http://localhost:3000'}/unsubscribe>`,
          'X-Report-Abuse': `Please report abuse to ${process.env.SMTP_USER}`
        }
      });

      console.log('✅ [EMAIL SERVICE] Email de notificación de cambio de contraseña enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de notificación de cambio de contraseña:', error);
      throw error;
    }
  },

  /**
   * Envía un correo de notificación de cuenta creada con OAuth
   */
  sendOAuthAccountCreatedEmail: async (to, userName, provider) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de cuenta creada con OAuth:', {
        to: to,
        userName: userName,
        provider: provider
      });

      const template = emailTemplates.oauthAccountCreated(userName, provider);
      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"DEMOS+ Welcome" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        // Headers adicionales para mejorar la entrega
        headers: {
          'X-Mailer': 'DEMOS+ Platform',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'List-Unsubscribe': `<${process.env.APP_URL || 'http://localhost:3000'}/unsubscribe>`,
          'X-Report-Abuse': `Please report abuse to ${process.env.SMTP_USER}`
        }
      });

      console.log('✅ [EMAIL SERVICE] Email de cuenta creada con OAuth enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de cuenta creada con OAuth:', error);
      throw error;
    }
  },

  /**
   * Envía un correo de confirmación cuando se recibe una solicitud de ONG
   */
  sendOngRequestReceivedEmail: async (to, nombreOrganizacion, cuit) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de solicitud recibida:', {
        to: to,
        organizacion: nombreOrganizacion
      });

      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Solicitud de registro recibida - DEMOS+',
        html: `
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                DEMOS+
              </h1>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
              <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
                ¡Solicitud recibida exitosamente!
              </h2>
              <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hola ${nombreOrganizacion}, hemos recibido tu solicitud de registro en DEMOS+.
              </p>
            </div>
            
            <!-- Información de la solicitud -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="color: #2b555f; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                  📋 Datos de tu solicitud:
                </h3>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #495057;">🏢 Organización:</strong>
                  <span style="color: #6c757d; margin-left: 8px;">${nombreOrganizacion}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #495057;">📄 CUIT:</strong>
                  <span style="color: #6c757d; margin-left: 8px;">${cuit}</span>
                </div>
                
                <div style="margin-bottom: 0;">
                  <strong style="color: #495057;">✉️ Email:</strong>
                  <span style="color: #6c757d; margin-left: 8px;">${to}</span>
                </div>
              </div>
            </div>
            
            <!-- Próximos pasos -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 20px; border-radius: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">ℹ️</span>
                  <strong style="color: #0066cc;">¿Qué sigue?</strong>
                </div>
                <p style="color: #0066cc; font-size: 14px; margin: 0; line-height: 1.5;">
                  Nuestro equipo la revisará pronto para verificar que tu organización es legítima. 
                  Te enviaremos un correo cuando tu solicitud sea aprobada y puedas acceder a tu cuenta.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">
                Si tienes alguna pregunta, no dudes en contactarnos
              </p>
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">
                © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
              </p>
            </div>
            
          </div>
        `
      });

      console.log('✅ [EMAIL SERVICE] Email de solicitud recibida enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de solicitud recibida:', error);
      throw error;
    }
  },

  /**
   * Envía un correo cuando una solicitud de ONG es aprobada
   */
  sendOngRequestApprovedEmail: async (to, nombreOrganizacion) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de solicitud aprobada:', {
        to: to,
        organizacion: nombreOrganizacion
      });

      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"DEMOS+ 🎉" <${process.env.SMTP_USER}>`,
        to,
        subject: '¡Tu cuenta en DEMOS+ ha sido aprobada!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                DEMOS+
              </h1>
            </div>
            
            <!-- Mensaje principal -->
            <div style="padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
              <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
                ¡Bienvenido a DEMOS+!
              </h2>
              <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hola ${nombreOrganizacion}, ¡excelentes noticias! Tu solicitud ha sido aprobada y tu cuenta ya está activa.
              </p>
              
              <!-- Botón principal -->
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 25px; font-weight: 600; font-size: 16px; margin-bottom: 30px;">
                🚀 Iniciar sesión en DEMOS+
              </a>
            </div>
            
            <!-- Credenciales -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #10b981;">
                <h3 style="color: #2b555f; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                  🔑 Tus credenciales:
                </h3>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #495057;">✉️ Email:</strong>
                  <span style="color: #6c757d; margin-left: 8px;">${to}</span>
                </div>
                
                <div style="margin-bottom: 0;">
                  <strong style="color: #495057;">🔒 Contraseña:</strong>
                  <span style="color: #6c757d; margin-left: 8px;">La que ingresaste al registrarte</span>
                </div>
              </div>
            </div>
            
            <!-- Próximos pasos -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 20px; border-radius: 8px;">
                <h3 style="color: #0066cc; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                  🚀 ¿Qué puedes hacer ahora?
                </h3>
                <ul style="color: #0066cc; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Publicar tus proyectos y campañas</li>
                  <li>Conectar con voluntarios</li>
                  <li>Recibir donaciones</li>
                  <li>Participar en el foro comunitario</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">
                Empieza a publicar tus proyectos y conectar con voluntarios!
              </p>
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">
                © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
              </p>
            </div>
            
          </div>
        `
      });

      console.log('✅ [EMAIL SERVICE] Email de solicitud aprobada enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de solicitud aprobada:', error);
      throw error;
    }
  },

  /**
   * Envía un correo cuando una solicitud de ONG es rechazada
   */
  sendOngRequestRejectedEmail: async (to, nombreOrganizacion, motivoRechazo) => {
    try {
      console.log('📧 [EMAIL SERVICE] Enviando email de solicitud rechazada:', {
        to: to,
        organizacion: nombreOrganizacion
      });

      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"DEMOS+ 📧" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Actualización sobre tu solicitud en DEMOS+',
        html: `
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                DEMOS+
              </h1>
            </div>
            
            <!-- Mensaje principal -->
            <div style="padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
              <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
                Actualización de tu solicitud
              </h2>
              <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hola ${nombreOrganizacion}, lamentablemente, no pudimos aprobar tu solicitud de registro en DEMOS+ en este momento.
              </p>
            </div>
            
            <!-- Motivo del rechazo -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background: #fee2e2; padding: 25px; border-radius: 12px; border-left: 4px solid #ef4444;">
                <h3 style="color: #991b1b; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">
                  📝 Motivo del rechazo:
                </h3>
                <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
                  ${motivoRechazo}
                </p>
              </div>
            </div>
            
            <!-- Información de contacto -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 20px; border-radius: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">💬</span>
                  <strong style="color: #0066cc;">¿Tienes preguntas?</strong>
                </div>
                <p style="color: #0066cc; font-size: 14px; margin: 0; line-height: 1.5;">
                  Si crees que esto es un error o deseas proporcionar más información, 
                  por favor contáctanos respondiendo a este email o a través de nuestros canales de soporte.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">
                Gracias por tu interés en DEMOS+
              </p>
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">
                © 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria
              </p>
            </div>
            
          </div>
        `
      });

      console.log('✅ [EMAIL SERVICE] Email de solicitud rechazada enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error al enviar email de solicitud rechazada:', error);
      throw error;
    }
  }
};
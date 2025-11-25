// Resend email service
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ [RESEND] RESEND_API_KEY not configured. Please set it in .env');
}

// Helper functions for sender details
const getFromEmail = () => {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
};

const getFromName = () => {
  return process.env.RESEND_FROM_NAME || 'DEMOS+';
};

// Generic email sender
async function sendEmail(to, subject, html) {
  console.log('📧 [RESEND] Sending email:', { to, subject, from: getFromEmail() });
  try {
    const { data, error } = await resend.emails.send({
      from: `${getFromName()} <${getFromEmail()}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    if (error) {
      console.error('❌ [RESEND] Error sending email:', error);
      throw error;
    }
    console.log('✅ [RESEND] Email sent successfully:', data);
    return data;
  } catch (err) {
    console.error('❌ [RESEND] sendEmail threw:', err);
    throw err;
  }
}

// Email templates
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
            Gracias por registrarte en nuestra plataforma. Para completar tu registro y activar tu cuenta, necesitas verificar tu correo electrónico.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/verificar/${verificationToken}" style="background-color: #2b555f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
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
          <p style="font-size: 12px; color: #999;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
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
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}" style="background-color: #2b555f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              🔒 Recuperar contraseña
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            <strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="font-size: 14px; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
  }),
  welcomeEmail: (userName) => ({
    subject: '¡Bienvenido a DEMOS+! Tu cuenta ha sido activada 🎉',
    html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">DEMOS+</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
          <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">¡Bienvenido, ${userName}!</h2>
          <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a usar nuestra plataforma.
          </p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; margin-bottom: 30px;">
            🚀 Comenzar en DEMOS+
          </a>
        </div>
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
  }),
  passwordChangedEmail: (userName) => ({
    subject: 'Tu contraseña ha sido cambiada - DEMOS+',
    html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #2b555f 0%, #73e4fd 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">DEMOS+</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Plataforma de donaciones y ayuda comunitaria</p>
        </div>
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🔒</span>
            </div>
            <h2 style="color: #2b555f; margin: 0 0 10px 0; font-size: 24px;">Contraseña actualizada</h2>
            <p style="color: #6c757d; font-size: 16px; margin: 0;">Tu contraseña ha sido cambiada exitosamente</p>
          </div>
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <p style="color: #495057; margin: 0;">
              Hola ${userName},<br/><br/>Te confirmamos que tu contraseña ha sido actualizada correctamente. Si no realizaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente.
            </p>
          </div>
        </div>
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Este es un mensaje automático de seguridad de DEMOS+</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
  }),
  loginNotification: (userName, loginInfo) => ({
    subject: 'Nuevo inicio de sesión en tu cuenta DEMOS+',
    html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">DEMOS+</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
          <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">Nuevo inicio de sesión detectado</h2>
          <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Hola ${userName}, hemos detectado un nuevo inicio de sesión en tu cuenta.</p>
        </div>
        <div style="padding: 0 30px 30px 30px;">
          <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #ff6b6b;">
            <h3 style="color: #2b555f; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">📍 Detalles de la sesión:</h3>
            <div style="margin-bottom: 15px;"><strong style="color: #495057;">🕐 Fecha y hora:</strong> <span style="color: #6c757d; margin-left: 8px;">${loginInfo.dateTime}</span></div>
            <div style="margin-bottom: 15px;"><strong style="color: #495057;">🌐 Dirección IP:</strong> <span style="color: #6c757d; margin-left: 8px; font-family: monospace;">${loginInfo.ipAddress}</span></div>
            <div style="margin-bottom: 0;"><strong style="color: #495057;">💻 Dispositivo:</strong> <span style="color: #6c757d; margin-left: 8px;">${loginInfo.userAgent}</span></div>
          </div>
        </div>
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Este es un mensaje automático de seguridad de DEMOS+</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
  }),
  ongRequestReceived: (ongName, solicitudId) => ({
    subject: 'Solicitud de registro recibida - DEMOS+',
    html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">DEMOS+</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
          <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">Solicitud recibida</h2>
          <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hola <strong>${ongName}</strong>, hemos recibido tu solicitud de registro como organización en DEMOS+.
          </p>
        </div>
        <div style="padding: 0 30px 30px 30px;">
          <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #667eea;">
            <h3 style="color: #2b555f; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">🔍 Próximos pasos</h3>
            <p style="color: #495057; margin: 0 0 15px 0; line-height: 1.6;">
              Tu solicitud está siendo revisada por nuestro equipo de administradores. Este proceso puede tomar entre 24 y 48 horas.
            </p>
            <p style="color: #495057; margin: 0; line-height: 1.6;">
              <strong>Número de solicitud:</strong> <span style="color: #667eea; font-family: monospace;">#${solicitudId}</span>
            </p>
          </div>
          <div style="background: #fff3cd; padding: 20px; border-radius: 12px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>⚠️ Importante:</strong> Te notificaremos por email cuando tu solicitud sea aprobada. Guarda este email para tus registros.
            </p>
          </div>
        </div>
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Gracias por tu interés en DEMOS+</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
  }),
  ongRequestApproved: (ongName, loginUrl) => ({
    subject: '¡Tu solicitud ha sido aprobada! - DEMOS+',
    html: `
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">DEMOS+</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
          <h2 style="color: #2b555f; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">¡Solicitud aprobada!</h2>
          <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Felicitaciones <strong>${ongName}</strong>, tu solicitud de registro ha sido aprobada por nuestro equipo.
          </p>
        </div>
        <div style="padding: 0 30px 30px 30px;">
          <div style="background: #d4edda; padding: 25px; border-radius: 12px; border-left: 4px solid #28a745; margin-bottom: 25px;">
            <h3 style="color: #155724; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">🎉 ¡Tu cuenta está lista!</h3>
            <p style="color: #155724; margin: 0 0 20px 0; line-height: 1.6;">
              Ya puedes acceder a tu cuenta y comenzar a utilizar todas las funcionalidades de la plataforma DEMOS+.
            </p>
            <div style="text-align: center;">
              <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
                🚀 Iniciar sesión ahora
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
            <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
              <strong>📧 Tu correo de acceso:</strong><br>
              Usa el email con el que te registraste para iniciar sesión.
            </p>
            <p style="color: #495057; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>🔒 Contraseña:</strong><br>
              Usa la contraseña que creaste durante el registro.
            </p>
          </div>
        </div>
        <div style="background: #2b555f; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">¡Bienvenido a la comunidad DEMOS+!</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">© 2024 DEMOS+ - Plataforma de donaciones y ayuda comunitaria</p>
        </div>
      </div>
    `,
  }),
};

// Exported email service
export const emailService = {
  sendVerificationEmail: async (to, verificationToken) => {
    const template = emailTemplates.verifyEmail(verificationToken);
    return sendEmail(to, template.subject, template.html);
  },
  sendVerificationEmailWithFallback: async (to, verificationToken) => {
    const template = emailTemplates.verifyEmail(verificationToken);
    return sendEmail(to, template.subject, template.html);
  },
  sendPasswordResetEmail: async (to, resetToken) => {
    const template = emailTemplates.resetPassword(resetToken);
    return sendEmail(to, template.subject, template.html);
  },
  sendWelcomeEmail: async (to, userName) => {
    const template = emailTemplates.welcomeEmail(userName);
    return sendEmail(to, template.subject, template.html);
  },
  sendPasswordChangedEmail: async (to, userName) => {
    const template = emailTemplates.passwordChangedEmail(userName);
    return sendEmail(to, template.subject, template.html);
  },
  sendLoginNotificationEmail: async (to, userName, loginInfo) => {
    const template = emailTemplates.loginNotification(userName, loginInfo);
    return sendEmail(to, template.subject, template.html);
  },
  sendONGRequestReceivedEmail: async (to, ongName, solicitudId) => {
    const template = emailTemplates.ongRequestReceived(ongName, solicitudId);
    return sendEmail(to, template.subject, template.html);
  },
  sendONGRequestApprovedEmail: async (to, ongName, loginUrl) => {
    const template = emailTemplates.ongRequestApproved(ongName, loginUrl);
    return sendEmail(to, template.subject, template.html);
  },
  verifyTransporter: async () => {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada');
    }
    console.log('✅ [RESEND] Configuración verificada');
    return true;
  },
};

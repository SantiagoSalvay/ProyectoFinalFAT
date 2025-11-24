import { emailService } from './resend-service.js';

/**
 * Servicio de recuperación de contraseña
 * Ahora usa MailerSend en lugar de SMTP para mayor velocidad y confiabilidad
 */
export const passwordResetService = {
  /**
   * Envía un correo de recuperación de contraseña usando MailerSend
   */
  sendPasswordResetEmail: async (to, resetToken) => {
    try {
      console.log('📧 [PASSWORD RESET] Enviando email de recuperación vía MailerSend...');
      console.log('🔗 [PASSWORD RESET] Token:', resetToken);

      // Usar el servicio de MailerSend que ya está configurado
      await emailService.sendPasswordResetEmail(to, resetToken);

      console.log('✅ [PASSWORD RESET] Email de recuperación enviado exitosamente a:', to);
      return true;
    } catch (error) {
      console.error('❌ [PASSWORD RESET] Error al enviar email de recuperación:', error);
      throw error;
    }
  }
};
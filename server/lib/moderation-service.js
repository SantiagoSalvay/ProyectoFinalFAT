/**
 * Servicio de Moderación Avanzado
 * Maneja advertencias, baneos y cola de aprobación de comentarios
 */

import { PrismaClient } from '@prisma/client';
import { moderateContent, isSpam } from './content-moderation.js';

const prisma = new PrismaClient();

// Configuración del sistema de moderación
const MODERATION_CONFIG = {
  MAX_WARNINGS_BEFORE_BAN: 3,
  AUTO_APPROVE_THRESHOLD: 'low', // low, medium, high
  TEMP_BAN_DURATION_DAYS: 7,
  PERMANENT_BAN_THRESHOLD: 5 // Infracciones antes de baneo permanente
};

/**
 * Registra una infracción del usuario
 */
async function recordInfraction(userId, type, severity, content, actionTaken) {
  try {
    const infraction = await prisma.moderationInfraction.create({
      data: {
        user_id: userId,
        infraction_type: type,
        severity,
        content: content?.substring(0, 500), // Limitar tamaño
        action_taken: actionTaken
      }
    });

    console.log(`[MODERACIÓN] Infracción registrada para usuario ${userId}: ${type} (${severity})`);
    return infraction;
  } catch (error) {
    console.error('Error al registrar infracción:', error);
    throw error;
  }
}

/**
 * Incrementa el contador de advertencias del usuario
 */
async function addWarning(userId, reason) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: { warnings_count: true, is_banned: true }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.is_banned) {
      return { action: 'already_banned', usuario };
    }

    const newWarningsCount = usuario.warnings_count + 1;

    // Si alcanza el máximo de advertencias, banear
    if (newWarningsCount >= MODERATION_CONFIG.MAX_WARNINGS_BEFORE_BAN) {
      return await banUser(userId, 'Múltiples infracciones a las normas de la comunidad', 'permanent');
    }

    // Actualizar contador de advertencias
    const updatedUser = await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { warnings_count: newWarningsCount }
    });

    console.log(`[MODERACIÓN] Advertencia ${newWarningsCount}/${MODERATION_CONFIG.MAX_WARNINGS_BEFORE_BAN} para usuario ${userId}`);

    return {
      action: 'warning',
      warningsCount: newWarningsCount,
      remainingWarnings: MODERATION_CONFIG.MAX_WARNINGS_BEFORE_BAN - newWarningsCount,
      usuario: updatedUser
    };
  } catch (error) {
    console.error('Error al agregar advertencia:', error);
    throw error;
  }
}

/**
 * Banea a un usuario
 */
async function banUser(userId, reason, type = 'permanent') {
  try {
    const bannedUntil = type === 'temporary' 
      ? new Date(Date.now() + MODERATION_CONFIG.TEMP_BAN_DURATION_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const bannedUser = await prisma.usuario.update({
      where: { id_usuario: userId },
      data: {
        is_banned: true,
        banned_at: new Date(),
        banned_reason: reason,
        banned_until: bannedUntil
      }
    });

    console.log(`[MODERACIÓN] Usuario ${userId} ${type === 'temporary' ? 'temporalmente' : 'permanentemente'} baneado: ${reason}`);

    return {
      action: 'banned',
      type,
      bannedUntil,
      usuario: bannedUser
    };
  } catch (error) {
    console.error('Error al banear usuario:', error);
    throw error;
  }
}

/**
 * Verifica si un usuario está baneado
 */
async function checkBanStatus(userId) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: {
        is_banned: true,
        banned_at: true,
        banned_reason: true,
        banned_until: true
      }
    });

    if (!usuario) {
      return { isBanned: false };
    }

    // Si es baneo temporal y ya expiró, desbanear
    if (usuario.is_banned && usuario.banned_until) {
      if (new Date() > new Date(usuario.banned_until)) {
        await prisma.usuario.update({
          where: { id_usuario: userId },
          data: {
            is_banned: false,
            banned_at: null,
            banned_reason: null,
            banned_until: null
          }
        });

        return { isBanned: false, wasUnbanned: true };
      }
    }

    return {
      isBanned: usuario.is_banned,
      bannedAt: usuario.banned_at,
      bannedReason: usuario.banned_reason,
      bannedUntil: usuario.banned_until
    };
  } catch (error) {
    console.error('Error al verificar estado de baneo:', error);
    throw error;
  }
}

/**
 * Modera un comentario y determina su acción
 */
async function moderateComment(userId, content, foroId) {
  try {
    // 1. Verificar si el usuario está baneado
    const banStatus = await checkBanStatus(userId);
    if (banStatus.isBanned) {
      return {
        approved: false,
        status: 'user_banned',
        reason: banStatus.bannedReason,
        bannedUntil: banStatus.bannedUntil
      };
    }

    // 2. Validar contenido
    const validation = moderateContent(content, false);
    const spamCheck = isSpam(content);

    // 3. Determinar acción basada en severidad
    let action = 'approved';
    let infractionType = null;
    let shouldWarn = false;

    if (!validation.isValid || spamCheck) {
      // Contenido problemático detectado
      if (validation.severity === 'high' || spamCheck) {
        action = 'rejected';
        shouldWarn = true;
        infractionType = spamCheck ? 'spam' : 'offensive_language';
      } else if (validation.severity === 'medium') {
        action = 'pending'; // Requiere revisión manual
        infractionType = 'potential_violation';
      } else {
        action = 'approved'; // Severidad baja, aprobar con advertencia
      }
    }

    // 4. Registrar infracción y advertencia si es necesario
    if (shouldWarn) {
      await recordInfraction(
        userId,
        infractionType,
        validation.severity,
        content,
        'warning'
      );

      const warningResult = await addWarning(userId, validation.errors.join(', '));

      // Si el usuario fue baneado por esta infracción
      if (warningResult.action === 'banned') {
        return {
          approved: false,
          status: 'user_banned',
          reason: 'Múltiples infracciones - Cuenta baneada',
          userBanned: true,
          warningsCount: MODERATION_CONFIG.MAX_WARNINGS_BEFORE_BAN
        };
      }

      return {
        approved: false,
        status: 'rejected',
        reason: validation.errors[0] || 'Contenido inapropiado',
        warning: {
          count: warningResult.warningsCount,
          remaining: warningResult.remainingWarnings,
          message: `Advertencia ${warningResult.warningsCount}/${MODERATION_CONFIG.MAX_WARNINGS_BEFORE_BAN}. ${warningResult.remainingWarnings} advertencias más y tu cuenta será baneada.`
        }
      };
    }

    // 5. Si pasa todas las validaciones o tiene severidad baja
    return {
      approved: action === 'approved',
      status: action,
      warnings: validation.warnings,
      autoApproved: action === 'approved'
    };

  } catch (error) {
    console.error('Error en moderación de comentario:', error);
    throw error;
  }
}

/**
 * Crea un comentario con moderación automática
 */
async function createModeratedComment(userId, foroId, mensaje) {
  try {
    // 1. Moderar el contenido
    const moderationResult = await moderateComment(userId, mensaje, foroId);

    // 2. Si el usuario está baneado, no permitir comentar
    if (moderationResult.status === 'user_banned') {
      throw new Error(moderationResult.reason || 'Tu cuenta ha sido baneada');
    }

    // 3. Determinar estado del comentario
    let moderationStatus = 'pending';
    let rejectionReason = null;

    if (moderationResult.approved && moderationResult.autoApproved) {
      moderationStatus = 'approved';
    } else if (moderationResult.status === 'rejected') {
      moderationStatus = 'rejected';
      rejectionReason = moderationResult.reason;
    }

    // 4. Crear el comentario en la base de datos
    const comentario = await prisma.respuestaForo.create({
      data: {
        id_foro: parseInt(foroId),
        id_usuario: userId,
        mensaje: mensaje.trim(),
        fecha: new Date(),
        moderation_status: moderationStatus,
        moderated_at: moderationStatus !== 'pending' ? new Date() : null,
        rejection_reason: rejectionReason
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            tipo_usuario: true
          }
        }
      }
    });

    console.log(`[MODERACIÓN] Comentario creado con estado: ${moderationStatus}`);

    return {
      comentario,
      moderation: moderationResult,
      needsApproval: moderationStatus === 'pending'
    };

  } catch (error) {
    console.error('Error al crear comentario moderado:', error);
    throw error;
  }
}

/**
 * Obtiene comentarios con filtro de moderación
 * - Los usuarios normales solo ven comentarios aprobados
 * - El autor ve sus propios comentarios pending/rejected
 */
async function getModeratedComments(foroId, currentUserId = null) {
  try {
    const whereClause = {
      id_foro: parseInt(foroId),
      OR: [
        { moderation_status: 'approved' },
        { moderation_status: null }, // Comentarios antiguos sin moderación
        ...(currentUserId ? [{ 
          id_usuario: currentUserId,
          moderation_status: { in: ['pending', 'rejected'] }
        }] : [])
      ]
    };

    const comentarios = await prisma.respuestaForo.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            tipo_usuario: true
          }
        }
      },
      orderBy: { fecha: 'asc' }
    });

    return comentarios;
  } catch (error) {
    console.error('Error al obtener comentarios moderados:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de infracciones de un usuario
 */
async function getUserInfractions(userId) {
  try {
    const infracciones = await prisma.moderationInfraction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return infracciones;
  } catch (error) {
    console.error('Error al obtener infracciones:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de moderación del usuario
 */
async function getUserModerationStats(userId) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: {
        warnings_count: true,
        is_banned: true,
        banned_reason: true,
        banned_until: true
      }
    });

    const infracciones = await getUserInfractions(userId);

    return {
      warningsCount: usuario?.warnings_count || 0,
      maxWarnings: MODERATION_CONFIG.MAX_WARNINGS_BEFORE_BAN,
      isBanned: usuario?.is_banned || false,
      bannedReason: usuario?.banned_reason,
      bannedUntil: usuario?.banned_until,
      totalInfractions: infracciones.length,
      recentInfractions: infracciones.slice(0, 5)
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de moderación:', error);
    throw error;
  }
}

export {
  recordInfraction,
  addWarning,
  banUser,
  checkBanStatus,
  moderateComment,
  createModeratedComment,
  getModeratedComments,
  getUserInfractions,
  getUserModerationStats,
  MODERATION_CONFIG
};


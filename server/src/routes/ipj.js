import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/ipj/verify
 * DEPRECADO - La verificación IPJ ha sido eliminada
 * Ahora solo se usa SISA para verificación
 */
router.post('/verify', async (req, res) => {
  return res.status(410).json({
    error: 'ENDPOINT_DEPRECATED',
    message: 'La verificación IPJ ha sido deprecada. Ahora solo se usa el registro SISA de Córdoba.'
  });
});

/**
 * POST /api/ipj/request-manual-review
 * Crea una solicitud de revisión manual cuando la ONG no se encuentra en IPJ
 */
router.post('/request-manual-review', async (req, res) => {
  try {
    const {
      email,
      nombre,
      nombreLegal,
      cuit,
      matricula,
      tipo,
      ubicacion,
      razon
    } = req.body;

    // Validar datos requeridos
    if (!email || !nombre || !cuit) {
      return res.status(400).json({
        error: 'Faltan datos requeridos (email, nombre, cuit)'
      });
    }

    console.log('📝 [API-IPJ] Creando solicitud de revisión manual:', {
      email,
      nombre,
      cuit
    });

    // Crear solicitud de revisión en la base de datos
    const solicitud = await prisma.solicitudRevisionIPJ.create({
      data: {
        email,
        nombre,
        nombre_legal: nombreLegal || nombre,
        cuit,
        matricula: matricula || null,
        tipo_organizacion: tipo || 'asociacion_civil',
        ubicacion: ubicacion || '',
        razon: razon || 'No encontrada en IPJ',
        estado: 'pendiente',
        fecha_solicitud: new Date()
      }
    });

    console.log('✅ [API-IPJ] Solicitud de revisión creada:', solicitud.id);

    // TODO: Enviar email a soporte notificando la solicitud
    // await sendEmailToSupport({
    //   subject: 'Nueva solicitud de revisión de ONG - IPJ',
    //   body: `Se ha recibido una solicitud de revisión manual para la ONG "${nombre}" (CUIT: ${cuit})`
    // });

    return res.json({
      success: true,
      message: 'Solicitud de revisión enviada exitosamente',
      solicitudId: solicitud.id
    });

  } catch (error) {
    console.error('❌ [API-IPJ] Error al crear solicitud de revisión:', error);
    
    // Si la tabla no existe
    if (error.code === 'P2021') {
      console.error('⚠️ [API-IPJ] La tabla SolicitudRevisionIPJ no existe. Debes ejecutar la migración de Prisma.');
      return res.status(500).json({
        error: 'Error de configuración de base de datos. Contacta al administrador.'
      });
    }

    return res.status(500).json({
      error: 'Error al procesar la solicitud de revisión'
    });
  }
});

/**
 * GET /api/ipj/manual-reviews
 * Obtiene todas las solicitudes de revisión manual (solo admin)
 */
router.get('/manual-reviews', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación de admin
    
    const solicitudes = await prisma.solicitudRevisionIPJ.findMany({
      orderBy: {
        fecha_solicitud: 'desc'
      }
    });

    return res.json({
      success: true,
      solicitudes
    });

  } catch (error) {
    console.error('❌ [API-IPJ] Error al obtener solicitudes:', error);
    return res.status(500).json({
      error: 'Error al obtener solicitudes de revisión'
    });
  }
});

/**
 * PATCH /api/ipj/manual-reviews/:id
 * Actualiza el estado de una solicitud de revisión manual (solo admin)
 */
router.patch('/manual-reviews/:id', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación de admin
    
    const { id } = req.params;
    const { estado, notas } = req.body;

    if (!['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido'
      });
    }

    const solicitud = await prisma.solicitudRevisionIPJ.update({
      where: { id: parseInt(id) },
      data: {
        estado,
        notas_admin: notas || null,
        fecha_revision: new Date()
      }
    });

    console.log(`✅ [API-IPJ] Solicitud ${id} actualizada a estado: ${estado}`);

    return res.json({
      success: true,
      solicitud
    });

  } catch (error) {
    console.error('❌ [API-IPJ] Error al actualizar solicitud:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    return res.status(500).json({
      error: 'Error al actualizar solicitud'
    });
  }
});

export default router;


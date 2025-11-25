import express from 'express';
import bcrypt from 'bcryptjs';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { emailService } from '../../lib/resend-service.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/ong-requests/create
 * Crear una solicitud de registro para ONG no encontrada en SISA
 */
router.post('/create', async (req, res) => {
  try {
    const {
      email,
      password,
      nombre_organizacion,
      cuit,
      ubicacion,
      descripcion,
      telefono,
      sitio_web
    } = req.body;

    // Validaciones
    if (!email || !password || !nombre_organizacion || !cuit) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: email, password, nombre_organizacion, cuit'
      });
    }

    // Verificar si ya existe una solicitud con este email
    const solicitudExistente = await prisma.solicitudRegistroONG.findUnique({
      where: { email }
    });

    if (solicitudExistente) {
      if (solicitudExistente.estado === 'pendiente') {
        return res.status(400).json({
          error: 'Ya existe una solicitud pendiente con este email. Por favor espera a que sea revisada.'
        });
      } else if (solicitudExistente.estado === 'rechazada') {
        return res.status(400).json({
          error: 'Tu solicitud anterior fue rechazada. Contacta con soporte para más información.',
          motivo: solicitudExistente.motivo_rechazo
        });
      } else if (solicitudExistente.estado === 'aprobada') {
        return res.status(400).json({
          error: 'Tu solicitud ya fue aprobada. Puedes iniciar sesión con tu email y contraseña.'
        });
      }
    }

    // Verificar si ya existe un usuario con este email
    const usuarioExistente = await prisma.usuario.findFirst({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Ya existe una cuenta registrada con este email. Intenta iniciar sesión.'
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear la solicitud
    const solicitud = await prisma.solicitudRegistroONG.create({
      data: {
        email,
        contrasena: hashedPassword,
        nombre_organizacion,
        cuit,
        ubicacion,
        descripcion,
        telefono,
        sitio_web,
        estado: 'pendiente'
      }
    });

    // Enviar email de confirmación al solicitante
    try {
      await emailService.sendONGRequestReceivedEmail(email, nombre_organizacion, solicitud.id_solicitud);
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
      // No fallar la solicitud si el email falla
    }

    res.json({
      success: true,
      message: 'Solicitud enviada exitosamente. Te notificaremos por email cuando sea aprobada.',
      solicitud: {
        id: solicitud.id_solicitud,
        nombre_organizacion: solicitud.nombre_organizacion,
        email: solicitud.email,
        fecha_solicitud: solicitud.fecha_solicitud
      }
    });

  } catch (error) {
    console.error('Error creando solicitud de ONG:', error);

    // Manejar error de constraint único de Prisma (P2002)
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Ya existe una solicitud con este email. Por favor verifica tu bandeja de entrada o contacta con soporte.'
      });
    }

    res.status(500).json({
      error: 'Error al procesar la solicitud',
      details: error.message
    });
  }
});

/**
 * GET /api/ong-requests/list
 * Obtener todas las solicitudes (requiere admin)
 */
router.get('/list', async (req, res) => {
  try {
    const { estado } = req.query;

    const whereClause = estado ? { estado } : {};

    const solicitudes = await prisma.solicitudRegistroONG.findMany({
      where: whereClause,
      orderBy: [
        { estado: 'asc' }, // Pendientes primero
        { fecha_solicitud: 'desc' }
      ]
    });

    res.json({
      success: true,
      solicitudes
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      error: 'Error al obtener solicitudes',
      details: error.message
    });
  }
});

/**
 * GET /api/ong-requests/:id
 * Obtener detalles de una solicitud específica (requiere admin)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitudRegistroONG.findUnique({
      where: { id_solicitud: parseInt(id) }
    });

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    res.json({
      success: true,
      solicitud
    });

  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({
      error: 'Error al obtener la solicitud',
      details: error.message
    });
  }
});

/**
 * POST /api/ong-requests/:id/approve
 * Aprobar una solicitud y crear la ONG (requiere admin)
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, notas_admin } = req.body;

    // Obtener la solicitud
    const solicitud = await prisma.solicitudRegistroONG.findUnique({
      where: { id_solicitud: parseInt(id) }
    });

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        error: `La solicitud ya fue ${solicitud.estado}`
      });
    }

    // Verificar que no exista ya un usuario con ese email
    const usuarioExistente = await prisma.usuario.findFirst({
      where: { email: solicitud.email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Ya existe un usuario con este email'
      });
    }

    // Crear el usuario ONG
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: solicitud.nombre_organizacion,
        apellido: '', // ONGs no tienen apellido
        email: solicitud.email,
        contrasena: solicitud.contrasena, // Ya está hasheada
        id_tipo_usuario: 2, // Tipo ONG
        ubicacion: solicitud.ubicacion,
        telefono: solicitud.telefono,
        redes_sociales: solicitud.sitio_web,
        biografia: solicitud.descripcion,
        createdAt: new Date()
      }
    });

    // Crear detalle de usuario
    await prisma.detalleUsuario.create({
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        email_verified: true,
        auth_provider: 'email',
        puntosActuales: 0
      }
    });

    // Actualizar la solicitud
    await prisma.solicitudRegistroONG.update({
      where: { id_solicitud: parseInt(id) },
      data: {
        estado: 'aprobada',
        fecha_revision: new Date(),
        revisado_por: admin_id || null,
        notas_admin: notas_admin || null,
        updated_at: new Date()
      }
    });

    // Enviar email de aprobación
    try {
      const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}/login`;
      await emailService.sendONGRequestApprovedEmail(solicitud.email, solicitud.nombre_organizacion, loginUrl);
    } catch (emailError) {
      console.error('Error enviando email de aprobación:', emailError);
      // No fallar la aprobación si el email falla
    }

    res.json({
      success: true,
      message: 'Solicitud aprobada y ONG creada exitosamente',
      usuario: {
        id: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      }
    });

  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    res.status(500).json({
      error: 'Error al aprobar la solicitud',
      details: error.message
    });
  }
});

/**
 * POST /api/ong-requests/:id/reject
 * Rechazar una solicitud (requiere admin)
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, motivo_rechazo, notas_admin } = req.body;

    if (!motivo_rechazo) {
      return res.status(400).json({
        error: 'Debe proporcionar un motivo de rechazo'
      });
    }

    // Obtener la solicitud
    const solicitud = await prisma.solicitudRegistroONG.findUnique({
      where: { id_solicitud: parseInt(id) }
    });

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        error: `La solicitud ya fue ${solicitud.estado}`
      });
    }

    // Actualizar la solicitud
    await prisma.solicitudRegistroONG.update({
      where: { id_solicitud: parseInt(id) },
      data: {
        estado: 'rechazada',
        fecha_revision: new Date(),
        revisado_por: admin_id || null,
        motivo_rechazo,
        notas_admin: notas_admin || null,
        updated_at: new Date()
      }
    });

    // Enviar email de rechazo
    try {
      // TODO: Crear template de email para rechazos si es necesario
      console.log('Email de rechazo no implementado aún');
    } catch (emailError) {
      console.error('Error enviando email de rechazo:', emailError);
      // No fallar el rechazo si el email falla
    }

    res.json({
      success: true,
      message: 'Solicitud rechazada exitosamente'
    });

  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    res.status(500).json({
      error: 'Error al rechazar la solicitud',
      details: error.message
    });
  }
});

export default router;


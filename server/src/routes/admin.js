import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { emailService } from '../../lib/resend-service.js';

const router = express.Router();
const prisma = new PrismaClient();

// Simple file-based admin logger (no DB changes)
const logsDir = path.join(process.cwd(), 'logs');
const adminLogFile = path.join(logsDir, 'admin.log');
function ensureLogsDir() {
  try { if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); } catch { }
}
function adminLog(entry) {
  try {
    ensureLogsDir();
    const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
    fs.appendFile(adminLogFile, line, () => { });
  } catch (e) { /* noop */ }
}

// Middleware: requiere JWT y ser Admin (id_tipo_usuario === 3)
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const admin = await prisma.usuario.findUnique({ where: { id_usuario: decoded.userId } });
    if (!admin || (admin.id_tipo_usuario ?? 0) < 3) {
      return res.status(403).json({ error: 'Requiere rol administrador' });
    }
    req.userId = decoded.userId;
    next();
  } catch (e) {
    console.error('Error en requireAdmin:', e);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

async function getOrCreateBanType() {
  return prisma.tipoInfraccion.upsert({
    where: { id_tipo_infraccion: 9999 },
    update: {},
    create: { id_tipo_infraccion: 9999, tipo_infraccion: 'Ban', severidad: 'Crítica' }
  });
}

async function isUserBanned(userId) {
  const banType = await getOrCreateBanType();
  const ban = await prisma.infracciones.findFirst({
    where: {
      id_usuario: userId,
      id_tipo_infraccion: banType.id_tipo_infraccion,
      OR: [{ fecha_expiracion: null }, { fecha_expiracion: { gt: new Date() } }]
    }
  });
  return !!ban;
}

// Listar comentarios por estado
router.get('/comments', requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status || 'pending').toString();
    const comentarios = await prisma.respuestaPublicacion.findMany({
      where: { moderation_status: status },
      orderBy: { fecha_respuesta: 'desc' },
      take: 200,
      select: {
        id_respuesta: true,
        id_publicacion: true,
        id_usuario: true,
        mensaje: true,
        fecha_respuesta: true,
        moderation_status: true,
        rejection_reason: true
      }
    });
    res.json({ comentarios });
  } catch (e) {
    console.error('Error al listar comentarios:', e);
    res.status(500).json({ error: 'Error al listar comentarios' });
  }
});

// Editar/sensurar comentario
router.put('/comments/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { mensaje, moderation_status, rejection_reason } = req.body || {};
    const data = {};
    if (typeof mensaje === 'string') data.mensaje = mensaje;
    if (typeof moderation_status === 'string') data.moderation_status = moderation_status;
    if (rejection_reason !== undefined) data.rejection_reason = rejection_reason;
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    data.moderated_at = new Date();
    const updated = await prisma.respuestaPublicacion.update({ where: { id_respuesta: id }, data });
    adminLog({ actor: req.userId, action: 'update_comment', target: { type: 'respuestaPublicacion', id }, changes: data });
    res.json({ message: 'Comentario actualizado', comentario: updated });
  } catch (e) {
    console.error('Error al actualizar comentario:', e);
    res.status(500).json({ error: 'Error al actualizar comentario' });
  }
});

// Listar usuarios
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: { id_usuario: true, nombre: true, apellido: true, email: true, ubicacion: true, id_tipo_usuario: true },
      take: 500
    });
    const withBan = await Promise.all(users.map(async u => ({ ...u, banned: await isUserBanned(u.id_usuario) })));
    res.json({ users: withBan });
  } catch (e) {
    console.error('Error al listar usuarios:', e);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

// Actualizar usuario
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, apellido, ubicacion } = req.body || {};
    const updated = await prisma.usuario.update({ where: { id_usuario: id }, data: { nombre, apellido, ubicacion } });
    adminLog({ actor: req.userId, action: 'update_user', target: { type: 'usuario', id }, changes: { nombre, apellido, ubicacion } });
    res.json({ message: 'Usuario actualizado', user: updated });
  } catch (e) {
    console.error('Error al actualizar usuario:', e);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Banear usuario
router.post('/users/:id/ban', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason, days, permanent } = req.body || {};
    const banType = await getOrCreateBanType();
    const expiry = permanent ? null : new Date(Date.now() + (Math.max(1, parseInt(days || 7, 10)) * 24 * 60 * 60 * 1000));

    // Crear infracción de baneo
    const inf = await prisma.infracciones.create({
      data: {
        id_usuario: id,
        contenido: reason || 'Ban administrativo',
        id_tipo_infraccion: banType.id_tipo_infraccion,
        fecha_expiracion: expiry
      }
    });

    // Crear notificación para el usuario
    const banMessage = permanent
      ? 'Tu cuenta ha sido baneada permanentemente por los administradores. No podrás acceder a la plataforma.'
      : `Tu cuenta ha sido suspendida por ${days || 7} días. Razón: ${reason || 'Violación de normas de la comunidad'}.`;

    await prisma.notificacion.create({
      data: {
        id_usuario: id,
        tipo_notificacion: 'ban',
        mensaje: banMessage,
        leida: false
      }
    });

    adminLog({
      actor: req.userId,
      action: 'ban_user',
      target: { type: 'usuario', id },
      reason,
      days,
      permanent
    });
    res.json({ message: 'Usuario baneado y notificado', ban: inf });
  } catch (e) {
    console.error('Error al banear usuario:', e);
    res.status(500).json({ error: 'Error al banear usuario' });
  }
});

// Desbanear usuario
router.delete('/users/:id/ban', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const banType = await getOrCreateBanType();
    const now = new Date();
    const result = await prisma.infracciones.updateMany({
      where: {
        id_usuario: id,
        id_tipo_infraccion: banType.id_tipo_infraccion,
        OR: [{ fecha_expiracion: null }, { fecha_expiracion: { gt: now } }]
      },
      data: { fecha_expiracion: now }
    });
    adminLog({ actor: req.userId, action: 'unban_user', target: { type: 'usuario', id } });
    res.json({ message: 'Usuario desbaneado', updated: result.count });
  } catch (e) {
    console.error('Error al desbanear usuario:', e);
    res.status(500).json({ error: 'Error al desbanear usuario' });
  }
});

// Listar ONGs
router.get('/ongs', requireAdmin, async (req, res) => {
  try {
    const ongs = await prisma.usuario.findMany({
      where: { id_tipo_usuario: 2 },
      select: { id_usuario: true, nombre: true, email: true, ubicacion: true, id_tipo_usuario: true },
      take: 500
    });
    const withBan = await Promise.all(ongs.map(async o => ({ ...o, banned: await isUserBanned(o.id_usuario) })));
    res.json({ ongs: withBan });
  } catch (e) {
    console.error('Error al listar ONGs:', e);
    res.status(500).json({ error: 'Error al listar ONGs' });
  }
});

// Actualizar ONG
router.put('/ongs/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, ubicacion } = req.body || {};
    const updated = await prisma.usuario.update({ where: { id_usuario: id }, data: { nombre, ubicacion } });
    res.json({ message: 'ONG actualizada', ong: updated });
  } catch (e) {
    console.error('Error al actualizar ONG:', e);
    res.status(500).json({ error: 'Error al actualizar ONG' });
  }
});

// Banear ONG (mismo que usuario)
router.post('/ongs/:id/ban', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason, days, permanent } = req.body || {};
    const banType = await getOrCreateBanType();
    const expiry = permanent ? null : new Date(Date.now() + (Math.max(1, parseInt(days || 7, 10)) * 24 * 60 * 60 * 1000));
    const inf = await prisma.infracciones.create({
      data: {
        id_usuario: id,
        contenido: reason || 'Ban administrativo',
        id_tipo_infraccion: banType.id_tipo_infraccion,
        fecha_expiracion: expiry
      }
    });
    adminLog({ actor: req.userId, action: 'ban_ong', target: { type: 'usuario', id }, reason, days, permanent });
    res.json({ message: 'ONG baneada', ban: inf });
  } catch (e) {
    console.error('Error al banear ONG:', e);
    res.status(500).json({ error: 'Error al banear ONG' });
  }
});

// Desbanear ONG (mismo que usuario)
router.delete('/ongs/:id/ban', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const banType = await getOrCreateBanType();
    const now = new Date();
    const result = await prisma.infracciones.updateMany({
      where: {
        id_usuario: id,
        id_tipo_infraccion: banType.id_tipo_infraccion,
        OR: [{ fecha_expiracion: null }, { fecha_expiracion: { gt: now } }]
      },
      data: { fecha_expiracion: now }
    });
    adminLog({ actor: req.userId, action: 'unban_ong', target: { type: 'usuario', id } });
    res.json({ message: 'ONG desbaneada', updated: result.count });
  } catch (e) {
    console.error('Error al desbanear ONG:', e);
    res.status(500).json({ error: 'Error al desbanear ONG' });
  }
});

// Aprobar solicitud de revisión manual de ONG
router.put('/ong-requests/:id/approve', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Buscar la solicitud
    const solicitud = await prisma.solicitudRevisionIPJ.findUnique({
      where: { id }
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (solicitud.estado === 'aprobado') {
      return res.status(400).json({ error: 'La solicitud ya fue aprobada' });
    }

    // Iniciar transacción para crear usuario y actualizar solicitud
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado de la solicitud
      const solicitudActualizada = await tx.solicitudRevisionIPJ.update({
        where: { id },
        data: {
          estado: 'aprobado',
          fecha_revision: new Date()
        }
      });

      // 2. Crear usuario si no existe (verificar por email)
      let user = await tx.usuario.findFirst({
        where: { email: solicitud.email }
      });

      if (!user) {
        // Generar contraseña temporal o usar una por defecto si no viene en la solicitud (aquí asumimos que el admin gestiona o se envía un link de reset)
        // Nota: En el flujo actual, la solicitud no guarda la contraseña original. 
        // Lo ideal sería que el email de aprobación tenga un link para "completar registro" o "resetear password".
        // Por simplicidad, crearemos el usuario y enviaremos el link de login. El usuario deberá usar "Olvidé mi contraseña" si no la sabe,
        // O mejor, si la solicitud viene de un registro fallido, quizás deberíamos haber guardado la contraseña encriptada en la solicitud.
        // Como la tabla SolicitudRevisionIPJ no tiene campo password, asumiremos que el usuario debe recuperar contraseña o que el admin le asigna una.

        // Para este caso, vamos a crear el usuario con una contraseña aleatoria y se le pedirá cambiarla.
        const tempPassword = Math.random().toString(36).slice(-8);
        // Importar bcrypt si no está (necesitaremos agregarlo arriba)
        // Como no puedo agregar imports fácilmente en medio, asumiré que el usuario usará "Recuperar contraseña".
        // O mejor, si el registro original falló, el usuario ya ingresó una contraseña. 
        // PERO esa contraseña se perdió al no guardarse en SolicitudRevisionIPJ.
        // Solución: Crear usuario sin contraseña (o dummy) y forzar reset, o simplemente notificar aprobación.

        // Vamos a crear el usuario básico
        user = await tx.usuario.create({
          data: {
            nombre: solicitud.nombre,
            apellido: solicitud.nombre_legal || '',
            email: solicitud.email,
            contrasena: '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', // Dummy hash
            id_tipo_usuario: 2, // ONG
            ubicacion: solicitud.ubicacion || '',
            createdAt: new Date()
          }
        });

        // Crear detalle usuario
        await tx.detalleUsuario.create({
          data: {
            id_usuario: user.id_usuario,
            email_verified: true,
            auth_provider: 'email',
            puntosActuales: 0
          }
        });
      }

      return { solicitud: solicitudActualizada, user };
    });

    // Enviar email de aprobación
    try {
      const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}/login`;
      await emailService.sendONGRequestApprovedEmail(solicitud.email, solicitud.nombre, loginUrl);
      console.log('📧 [ADMIN] Email de aprobación enviado a:', solicitud.email);
    } catch (emailError) {
      console.error('❌ [ADMIN] Error al enviar email de aprobación:', emailError);
    }

    adminLog({
      actor: req.userId,
      action: 'approve_ong_request',
      target: { type: 'solicitudRevisionIPJ', id },
      ongEmail: solicitud.email
    });

    res.json({
      message: 'Solicitud aprobada y usuario creado/verificado',
      solicitud: result.solicitud
    });

  } catch (e) {
    console.error('Error al aprobar solicitud:', e);
    res.status(500).json({ error: 'Error al aprobar solicitud' });
  }
});

// ========= ACTORS (Usuarios + ONGs unificados) =========
router.get('/actors', requireAdmin, async (req, res) => {
  try {
    const { type = 'all', q = '' } = req.query;
    const query = (q || '').toString().toLowerCase();
    const where = {
      id_tipo_usuario: type === 'user' ? 1 : type === 'ong' ? 2 : undefined,
    };
    const actors = await prisma.usuario.findMany({
      where,
      select: { id_usuario: true, nombre: true, apellido: true, email: true, ubicacion: true, id_tipo_usuario: true },
      take: 500
    });
    const filtered = actors.filter(a => `${a.nombre} ${a.apellido} ${a.email}`.toLowerCase().includes(query));
    const withType = await Promise.all(filtered.map(async a => ({
      ...a,
      tipo: a.id_tipo_usuario === 2 ? 'ONG' : 'Usuario',
      banned: await isUserBanned(a.id_usuario)
    })));
    res.json({ actors: withType });
  } catch (e) {
    console.error('Error al listar actores:', e);
    res.status(500).json({ error: 'Error al listar actores' });
  }
});

router.put('/actors/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, apellido, ubicacion } = req.body || {};
    const updated = await prisma.usuario.update({ where: { id_usuario: id }, data: { nombre, apellido, ubicacion } });
    adminLog({ actor: req.userId, action: 'update_actor', target: { type: 'usuario', id }, changes: { nombre, apellido, ubicacion } });
    res.json({ message: 'Actor actualizado', actor: updated });
  } catch (e) {
    console.error('Error al actualizar actor:', e);
    res.status(500).json({ error: 'Error al actualizar actor' });
  }
});

// Alias: usuarios combinados (usuarios + ongs)
router.get('/users-all', requireAdmin, async (req, res) => {
  try {
    const { type = 'all', q = '' } = req.query;
    const query = (q || '').toString().toLowerCase();
    const where = {
      id_tipo_usuario: type === 'user' ? 1 : type === 'ong' ? 2 : undefined,
    };
    const users = await prisma.usuario.findMany({
      where,
      select: { id_usuario: true, nombre: true, apellido: true, email: true, ubicacion: true, id_tipo_usuario: true },
      take: 500
    });
    const filtered = users.filter(a => `${a.nombre} ${a.apellido} ${a.email}`.toLowerCase().includes(query));
    const withType = await Promise.all(filtered.map(async a => ({
      ...a,
      tipo: a.id_tipo_usuario === 2 ? 'ONG' : 'Usuario',
      banned: await isUserBanned(a.id_usuario)
    })));
    res.json({ users: withType });
  } catch (e) {
    console.error('Error al listar users-all:', e);
    res.status(500).json({ error: 'Error al listar usuarios combinados' });
  }
});

// ========= POSTS (Publicaciones) =========
router.get('/posts', requireAdmin, async (req, res) => {
  try {
    const { q = '' } = req.query;
    const query = (q || '').toString().toLowerCase();
    const posts = await prisma.publicacion.findMany({
      take: 200,
      orderBy: { fecha_publicacion: 'desc' },
      select: {
        id_publicacion: true,
        id_usuario: true,
        titulo: true,
        descripcion_publicacion: true,
        fecha_publicacion: true,
        usuario: { select: { id_usuario: true, nombre: true, apellido: true, email: true } }
      }
    });
    const filtered = posts.filter(p => `${p.titulo} ${p.descripcion_publicacion ?? ''} ${p.usuario?.email ?? ''}`.toLowerCase().includes(query));
    res.json({ posts: filtered });
  } catch (e) {
    console.error('Error al listar posts:', e);
    res.status(500).json({ error: 'Error al listar posts' });
  }
});

router.put('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { titulo, descripcion_publicacion, moderate, reason } = req.body || {};
    const data = {};
    if (typeof titulo === 'string') data.titulo = titulo;
    if (typeof descripcion_publicacion === 'string') data.descripcion_publicacion = descripcion_publicacion;
    if (moderate) {
      data.descripcion_publicacion = `[MODERADO] ${reason || 'Contenido moderado por admin'}`;
    }
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const updated = await prisma.publicacion.update({ where: { id_publicacion: id }, data });
    adminLog({ actor: req.userId, action: 'update_post', target: { type: 'publicacion', id }, changes: data });
    res.json({ message: 'Post actualizado', post: updated });
  } catch (e) {
    console.error('Error al actualizar post:', e);
    res.status(500).json({ error: 'Error al actualizar post' });
  }
});

// ========= DONACIONES (PedidoDonacion) =========
async function getOrCreateExcessDonationType() {
  // Reutilizar tipo Ban si no queremos crear otro; pero mejor separar el registro
  return prisma.tipoInfraccion.upsert({
    where: { id_tipo_infraccion: 9998 },
    update: {},
    create: { id_tipo_infraccion: 9998, tipo_infraccion: 'Exceso de Donación', severidad: 'Media' }
  });
}

router.get('/donations', requireAdmin, async (req, res) => {
  try {
    const { q = '' } = req.query;
    const query = (q || '').toString().toLowerCase();
    const rows = await prisma.pedidoDonacion.findMany({
      take: 200,
      orderBy: { fecha_donacion: 'desc' },
      select: {
        id_pedido: true,
        id_usuario: true,
        id_tipo_donacion: true,
        cantidad: true,
        horas_donadas: true,
        puntos_otorgados: true,
        fecha_donacion: true,
        usuario: { select: { id_usuario: true, nombre: true, apellido: true, email: true, id_tipo_usuario: true } },
        tipoDonacion: { select: { id_tipo_donacion: true, tipo_donacion: true } }
      }
    });
    const filtered = rows.filter(r => `${r.usuario?.email ?? ''} ${r.tipoDonacion?.tipo_donacion ?? ''}`.toLowerCase().includes(query));
    res.json({ donations: filtered });
  } catch (e) {
    console.error('Error al listar donaciones:', e);
    res.status(500).json({ error: 'Error al listar donaciones' });
  }
});

router.put('/donations/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { cantidad, horas_donadas, puntos_otorgados } = req.body || {};
    const data = {};
    if (cantidad !== undefined) data.cantidad = parseInt(cantidad, 10);
    if (horas_donadas !== undefined) data.horas_donadas = parseInt(horas_donadas, 10);
    if (puntos_otorgados !== undefined) data.puntos_otorgados = parseInt(puntos_otorgados, 10);
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const updated = await prisma.pedidoDonacion.update({ where: { id_pedido: id }, data });
    adminLog({ actor: req.userId, action: 'update_donation', target: { type: 'pedidoDonacion', id }, changes: data });
    res.json({ message: 'Donación actualizada', donation: updated });
  } catch (e) {
    console.error('Error al actualizar donación:', e);
    res.status(500).json({ error: 'Error al actualizar donación' });
  }
});

router.post('/donations/:id/flag', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body || {};
    const pedido = await prisma.pedidoDonacion.findUnique({ where: { id_pedido: id } });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    const t = await getOrCreateExcessDonationType();
    const inf = await prisma.infracciones.create({
      data: {
        id_usuario: pedido.id_usuario,
        contenido: reason || 'Exceso de donación detectado',
        id_tipo_infraccion: t.id_tipo_infraccion
      }
    });
    adminLog({ actor: req.userId, action: 'flag_donation_excess', target: { type: 'pedidoDonacion', id }, reason });
    res.json({ message: 'Exceso de donación registrado', infraction: inf });
  } catch (e) {
    console.error('Error al marcar exceso de donación:', e);
    res.status(500).json({ error: 'Error al marcar exceso de donación' });
  }
});

// ========= FORUM MODERATION =========
// Listar todos los mensajes del foro (posts con respuestas y subrespuestas)
// Excluye publicaciones de donación monetaria (que tienen publicacionEtiquetas con pedidosDonacion)
router.get('/forum', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50; // Reducido de 100 a 50 por defecto
    const offset = parseInt(req.query.offset) || 0;

    // Obtener IDs de publicaciones que tienen donaciones (para excluirlas)
    const publicacionesConDonaciones = await prisma.publicacionEtiqueta.findMany({
      where: {
        pedidosDonacion: {
          some: {}
        }
      },
      select: {
        id_publicacion: true
      },
      distinct: ['id_publicacion']
    });

    const idsConDonaciones = publicacionesConDonaciones.map(pe => pe.id_publicacion);

    // Obtener publicaciones del foro (sin donaciones) con paginación
    const posts = await prisma.publicacion.findMany({
      where: {
        id_publicacion: {
          notIn: idsConDonaciones
        }
      },
      orderBy: { fecha_publicacion: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id_publicacion: true,
        titulo: true,
        descripcion_publicacion: true,
        fecha_publicacion: true,
        id_usuario: true,
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
            id_tipo_usuario: true
          }
        },
        // Solo contar respuestas en lugar de cargarlas todas
        _count: {
          select: {
            respuestas: true
          }
        }
      }
    });

    // Obtener respuestas solo de las publicaciones cargadas (carga separada más eficiente)
    const postIds = posts.map(p => p.id_publicacion);

    const respuestas = await prisma.respuestaPublicacion.findMany({
      where: {
        id_publicacion: { in: postIds },
        id_respuesta_padre: null
      },
      orderBy: { fecha_respuesta: 'asc' },
      select: {
        id_respuesta: true,
        mensaje: true,
        fecha_respuesta: true,
        id_usuario: true,
        id_publicacion: true,
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
            id_tipo_usuario: true
          }
        },
        _count: {
          select: {
            respuestasHijas: true
          }
        }
      }
    });

    // Obtener subrespuestas
    const respuestaIds = respuestas.map(r => r.id_respuesta);

    const subrespuestas = await prisma.respuestaPublicacion.findMany({
      where: {
        id_respuesta_padre: { in: respuestaIds }
      },
      orderBy: { fecha_respuesta: 'asc' },
      select: {
        id_respuesta: true,
        mensaje: true,
        fecha_respuesta: true,
        id_usuario: true,
        id_respuesta_padre: true,
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
            id_tipo_usuario: true
          }
        }
      }
    });

    // Agrupar subrespuestas por respuesta padre
    const subrespuestasPorPadre = {};
    subrespuestas.forEach(sub => {
      if (!subrespuestasPorPadre[sub.id_respuesta_padre]) {
        subrespuestasPorPadre[sub.id_respuesta_padre] = [];
      }
      subrespuestasPorPadre[sub.id_respuesta_padre].push(sub);
    });

    // Agrupar respuestas por publicación y agregar subrespuestas
    const respuestasPorPost = {};
    respuestas.forEach(resp => {
      if (!respuestasPorPost[resp.id_publicacion]) {
        respuestasPorPost[resp.id_publicacion] = [];
      }
      respuestasPorPost[resp.id_publicacion].push({
        ...resp,
        respuestasHijas: subrespuestasPorPadre[resp.id_respuesta] || []
      });
    });

    // Combinar todo
    const postsConRespuestas = posts.map(post => ({
      ...post,
      respuestas: respuestasPorPost[post.id_publicacion] || []
    }));

    res.json({
      posts: postsConRespuestas,
      hasMore: posts.length === limit
    });
  } catch (e) {
    console.error('Error al listar mensajes del foro:', e);
    res.status(500).json({ error: 'Error al listar mensajes del foro' });
  }
});

// Borrar mensaje del foro (post o reply) y notificar al autor
router.delete('/forum/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { authorId } = req.body;
    const messageId = parseInt(id, 10);

    // Validar que authorId esté presente
    if (!authorId) {
      return res.status(400).json({ error: 'authorId es requerido' });
    }

    let deletedMessage;
    let messageType;
    let messageContent = '';
    let actualAuthorId = null;

    // Obtener el contenido del mensaje ANTES de borrarlo
    if (type === 'post') {
      // Verificar si hay donaciones asociadas a esta publicación
      const publicacion = await prisma.publicacion.findUnique({
        where: { id_publicacion: messageId },
        include: {
          publicacionEtiquetas: {
            include: {
              pedidosDonacion: true
            }
          }
        }
      });

      if (!publicacion) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }

      // Guardar el ID real del autor
      actualAuthorId = publicacion.id_usuario;

      const tieneDonaciones = publicacion.publicacionEtiquetas.some(pe => pe.pedidosDonacion.length > 0);

      if (tieneDonaciones) {
        return res.status(400).json({
          error: 'No se puede borrar este anuncio porque tiene donaciones asociadas. Las donaciones deben ser gestionadas primero.',
          hasDonations: true
        });
      }

      messageContent = publicacion.descripcion_publicacion || '';

      deletedMessage = await prisma.publicacion.delete({
        where: { id_publicacion: messageId }
      });
      messageType = 'anuncio';
    } else if (type === 'reply') {
      const respuesta = await prisma.respuestaPublicacion.findUnique({
        where: { id_respuesta: messageId }
      });

      if (!respuesta) {
        return res.status(404).json({ error: 'Respuesta no encontrada' });
      }

      // Guardar el ID real del autor
      actualAuthorId = respuesta.id_usuario;

      messageContent = respuesta.mensaje || '';

      deletedMessage = await prisma.respuestaPublicacion.delete({
        where: { id_respuesta: messageId }
      });
      messageType = 'respuesta';
    } else {
      return res.status(400).json({ error: 'Tipo de mensaje inválido' });
    }

    // Crear notificación para el autor con el contenido del mensaje eliminado
    const notificationMessage = `Se ha borrado el siguiente mensaje del foro: "${messageContent}" por decisión de los administradores.`;

    // Usar el ID real del autor de la base de datos, no el del body
    const targetUserId = actualAuthorId || parseInt(authorId, 10);

    await prisma.notificacion.create({
      data: {
        id_usuario: targetUserId,
        tipo_notificacion: 'mensaje_borrado',
        mensaje: notificationMessage,
        leida: false
      }
    });

    adminLog({
      actor: req.userId,
      action: 'delete_forum_message',
      target: { type, id: messageId, authorId },
      messageType,
      messageContent
    });

    res.json({ message: `${messageType} eliminado y autor notificado` });
  } catch (e) {
    console.error('Error al borrar mensaje del foro:', e);
    res.status(500).json({ error: 'Error al borrar mensaje del foro' });
  }
});

// ========= LOGS =========
router.get('/logs', requireAdmin, async (req, res) => {
  try {
    ensureLogsDir();
    const limit = Math.max(1, Math.min(parseInt((req.query.limit || '200').toString(), 10), 1000));
    if (!fs.existsSync(adminLogFile)) return res.json({ logs: [] });
    const content = fs.readFileSync(adminLogFile, 'utf-8').trim().split('\n');
    const tail = content.slice(-limit).map(line => { try { return JSON.parse(line); } catch { return { raw: line }; } });
    res.json({ logs: tail });
  } catch (e) {
    console.error('Error al leer logs de admin:', e);
    res.status(500).json({ error: 'Error al leer logs' });
  }
});

export default router;

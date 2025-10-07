import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: requiere JWT y ser Admin (id_tipo_usuario === 3)
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const admin = await prisma.usuario.findUnique({ where: { id_usuario: decoded.userId } });
    if (!admin || admin.id_tipo_usuario !== 3) {
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
      OR: [ { fecha_expiracion: null }, { fecha_expiracion: { gt: new Date() } } ]
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
    const inf = await prisma.infracciones.create({
      data: {
        id_usuario: id,
        contenido: reason || 'Ban administrativo',
        id_tipo_infraccion: banType.id_tipo_infraccion,
        fecha_expiracion: expiry
      }
    });
    res.json({ message: 'Usuario baneado', ban: inf });
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
        OR: [ { fecha_expiracion: null }, { fecha_expiracion: { gt: now } } ]
      },
      data: { fecha_expiracion: now }
    });
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
        OR: [ { fecha_expiracion: null }, { fecha_expiracion: { gt: now } } ]
      },
      data: { fecha_expiracion: now }
    });
    res.json({ message: 'ONG desbaneada', updated: result.count });
  } catch (e) {
    console.error('Error al desbanear ONG:', e);
    res.status(500).json({ error: 'Error al desbanear ONG' });
  }
});

export default router;

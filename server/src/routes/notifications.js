import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// Obtener notificaciones del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  try {
    // El token JWT usa 'userId', no 'id_usuario'
    const userId = req.user.userId || req.user.id_usuario;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no identificado' });
    }
    
    const notifications = await prisma.notificacion.findMany({
      where: {
        id_usuario: userId
      },
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 50 // Limitar a las últimas 50 notificaciones
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Marcar notificación como leída
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id_usuario;
    const notificationId = parseInt(req.params.id);

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notificacion.findFirst({
      where: {
        id_notificacion: notificationId,
        id_usuario: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    // Marcar como leída
    await prisma.notificacion.update({
      where: { id_notificacion: notificationId },
      data: { leida: true }
    });

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

// Marcar todas las notificaciones como leídas
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id_usuario;

    await prisma.notificacion.updateMany({
      where: {
        id_usuario: userId,
        leida: false
      },
      data: { leida: true }
    });

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

// Eliminar una notificación
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id_usuario;
    const notificationId = parseInt(req.params.id);

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notificacion.findFirst({
      where: {
        id_notificacion: notificationId,
        id_usuario: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    await prisma.notificacion.delete({
      where: { id_notificacion: notificationId }
    });

    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
});

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id_usuario;
    
    const count = await prisma.notificacion.count({
      where: {
        id_usuario: userId,
        leida: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener conteo' });
  }
});

export default router;

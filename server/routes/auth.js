import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Obtener perfil del usuario
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.userId },
      select: {
        id_usuario: true,
        usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        ubicacion: true,
        bio: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Actualizar perfil del usuario
router.put('/profile', verifyToken, async (req, res) => {
  const { nombre, apellido, ubicacion, bio } = req.body;

  try {
    const user = await prisma.usuario.update({
      where: { id_usuario: req.userId },
      data: {
        nombre,
        apellido,
        ubicacion,
        bio
      },
      select: {
        id_usuario: true,
        usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        ubicacion: true,
        bio: true,
        createdAt: true
      }
    });

    res.json({ message: 'Perfil actualizado exitosamente', user });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

export default router; 
// Obtener datos de TipoONG para el usuario autenticado
router.get('/profile/tipoong', verifyToken, async (req, res) => {
  try {
    const tipoONG = await prisma.tipoONG.findFirst({
      where: { usuarioId: req.userId },
      select: {
        ID_tipo: true,
        grupo_social: true,
        necesidad: true
      }
    });
    res.json({ tipoONG });
  } catch (error) {
    console.error('Error al obtener datos de TipoONG:', error);
    res.status(500).json({ error: 'Error al obtener datos de TipoONG' });
  }
});

// Guardar datos de TipoONG para el usuario autenticado
router.post('/profile/tipoong', verifyToken, async (req, res) => {
  const { grupo_social, necesidad } = req.body;
  if (!grupo_social || !necesidad) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  try {
    // Si ya existe, actualizar; si no, crear
    let tipoONG = await prisma.tipoONG.findFirst({ where: { usuarioId: req.userId } });
    if (tipoONG) {
      tipoONG = await prisma.tipoONG.update({
        where: { ID_tipo: tipoONG.ID_tipo },
        data: { grupo_social, necesidad }
      });
    } else {
      tipoONG = await prisma.tipoONG.create({
        data: { grupo_social, necesidad, usuarioId: req.userId }
      });
    }
    res.json({ tipoONG });
  } catch (error) {
    console.error('Error al guardar datos de TipoONG:', error);
    res.status(500).json({ error: 'Error al guardar datos de TipoONG' });
  }
});
import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    // Mapear los campos del JWT a req.user
    req.user = {
      id_usuario: decoded.userId,
      email: decoded.email,
      tipo_usuario: decoded.tipo_usuario
    };
    next();
  });
};

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await prisma.Categoria.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json({ categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener categorías de una ONG específica
router.get('/ong/:ongId', async (req, res) => {
  try {
    const { ongId } = req.params;
    
    // TODO: Implementar cuando exista el modelo ONGCategoria en el schema
    // Por ahora devolver array vacío
    res.json({ categorias: [] });
  } catch (error) {
    console.error('Error al obtener categorías de ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Asignar categorías a una ONG (solo para ONGs)
router.post('/ong/:ongId', authenticateToken, async (req, res) => {
  try {
    const { ongId } = req.params;
    const { categoriaIds } = req.body;
    const userId = req.user.id_usuario;

    console.log('🔐 [Categories] Datos del usuario del token:', req.user);
    console.log('🔐 [Categories] ID de ONG del parámetro:', ongId);
    console.log('🔐 [Categories] Tipo de usuario:', req.user.tipo_usuario);
    console.log('🔐 [Categories] ID de usuario del token:', userId);
    console.log('🔐 [Categories] Comparación:', {
      esTipoONG: req.user.tipo_usuario === 2,
      esPropioPerfil: parseInt(ongId) === userId
    });

    // Verificar que el usuario sea una ONG y que esté actualizando su propio perfil
    if (req.user.tipo_usuario !== 2 || parseInt(ongId) !== userId) {
      console.error('❌ [Categories] Autorización denegada');
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Eliminar categorías existentes
    await prisma.ONGCategoria.deleteMany({
      where: { id_usuario: parseInt(ongId) }
    });

    // Agregar nuevas categorías
    if (categoriaIds && categoriaIds.length > 0) {
      const ongCategorias = categoriaIds.map(categoriaId => ({
        id_usuario: parseInt(ongId),
        id_categoria: parseInt(categoriaId)
      }));

      await prisma.ONGCategoria.createMany({
        data: ongCategorias
      });
    }

    // Obtener las categorías actualizadas
    const ongCategorias = await prisma.ONGCategoria.findMany({
      where: { id_usuario: parseInt(ongId) },
      include: {
        categoria: true
      }
    });

    res.json({ 
      message: 'Categorías actualizadas exitosamente',
      categorias: ongCategorias.map(oc => oc.categoria)
    });
  } catch (error) {
    console.error('Error al actualizar categorías de ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva categoría (solo para administradores)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, descripcion, color, icono } = req.body;

    // Verificar que el usuario sea administrador (tipo_usuario === 3)
    if (req.user.tipo_usuario !== 3) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const categoria = await prisma.Categoria.create({
      data: {
        nombre,
        descripcion,
        color,
        icono
      }
    });

    res.status(201).json({ 
      message: 'Categoría creada exitosamente',
      categoria 
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;


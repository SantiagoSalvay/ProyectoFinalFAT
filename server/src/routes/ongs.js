import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las ONGs (usuarios tipo 2)
router.get('/', async (req, res) => {
  try {
    const { type, location } = req.query;
    
    // Construir filtros
    const whereClause = {
      id_tipo_usuario: 2 // Solo usuarios tipo ONG
    };

    // Aplicar filtros si se proporcionan
    if (location) {
      whereClause.ubicacion = {
        contains: location,
        mode: 'insensitive'
      };
    }

    const ongs = await prisma.usuario.findMany({
      where: whereClause,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        createdAt: true,
        biografia: true,
        calificacionesRecibidas: {
          select: {
            puntuacion: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar los datos para el frontend
    const ongsFormateadas = ongs.map(ong => {
      // Calcular rating promedio
      const calificaciones = ong.calificacionesRecibidas;
      const rating = calificaciones.length > 0
        ? calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) / calificaciones.length
        : 0;

      return {
        id: ong.id_usuario,
        name: ong.nombre || 'ONG',
        description: ong.biografia || 'Sin descripción disponible',
        location: ong.ubicacion || 'Ubicación no especificada',
        email: ong.email,
        type: 'public',
        rating: parseFloat(rating.toFixed(1)),
        volunteers_count: 0,
        projects_count: 0,
        website: '',
        phone: '',
        totalRatings: calificaciones.length
      };
    });

    // Aplicar filtro de tipo si se especifica
    let ongsFiltradas = ongsFormateadas;
    if (type && type !== 'all') {
      ongsFiltradas = ongsFormateadas.filter(ong => ong.type === type);
    }

    res.json({ ongs: ongsFiltradas });
  } catch (error) {
    console.error('Error al obtener ONGs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una ONG específica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ong = await prisma.usuario.findFirst({
      where: { 
        id_usuario: parseInt(id),
        id_tipo_usuario: 2
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        createdAt: true,
        biografia: true
      }
    });

    if (!ong) {
      return res.status(404).json({ error: 'ONG no encontrada' });
    }

    const ongFormateada = {
      id: ong.id_usuario,
      name: ong.nombre || 'ONG',
      description: ong.biografia || 'Sin descripción disponible',
      location: ong.ubicacion || 'Ubicación no especificada',
      email: ong.email,
      type: 'public',
      rating: 0,
      volunteers_count: 0,
      projects_count: 0,
      website: '',
      phone: ''
    };

    res.json({ ong: ongFormateada });
  } catch (error) {
    console.error('Error al obtener ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    req.user = { id_usuario: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Calificar una ONG
router.post('/:id/calificar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { puntuacion, comentario } = req.body;
    const userId = req.user.id_usuario;

    // Validar puntuación
    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
    }

    // Verificar que la ONG existe
    const ong = await prisma.usuario.findUnique({
      where: { 
        id_usuario: parseInt(id),
        id_tipo_usuario: 2
      }
    });

    if (!ong) {
      return res.status(404).json({ error: 'ONG no encontrada' });
    }

    // Verificar que el usuario no esté calificando su propia ONG
    if (parseInt(id) === userId) {
      return res.status(400).json({ error: 'No puedes calificar tu propia organización' });
    }

    // Intentar crear o actualizar la calificación
    const calificacion = await prisma.calificacionONG.upsert({
      where: {
        id_ong_id_usuario: {
          id_ong: parseInt(id),
          id_usuario: userId
        }
      },
      update: {
        puntuacion: parseFloat(puntuacion),
        comentario: comentario || null,
        fecha_calificacion: new Date()
      },
      create: {
        id_ong: parseInt(id),
        id_usuario: userId,
        puntuacion: parseFloat(puntuacion),
        comentario: comentario || null
      }
    });

    // Calcular nuevo promedio
    const todasCalificaciones = await prisma.calificacionONG.findMany({
      where: { id_ong: parseInt(id) },
      select: { puntuacion: true }
    });

    const nuevoPromedio = todasCalificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) / todasCalificaciones.length;

    res.json({ 
      message: 'Calificación guardada exitosamente',
      calificacion,
      nuevoPromedio: parseFloat(nuevoPromedio.toFixed(1)),
      totalCalificaciones: todasCalificaciones.length
    });
  } catch (error) {
    console.error('Error al calificar ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar si el usuario ya calificó una ONG
router.get('/:id/mi-calificacion', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_usuario;

    const calificacion = await prisma.calificacionONG.findUnique({
      where: {
        id_ong_id_usuario: {
          id_ong: parseInt(id),
          id_usuario: userId
        }
      }
    });

    if (!calificacion) {
      return res.json({ hasRated: false });
    }

    res.json({
      hasRated: true,
      puntuacion: calificacion.puntuacion,
      comentario: calificacion.comentario,
      fecha: calificacion.fecha_calificacion
    });
  } catch (error) {
    console.error('Error al obtener calificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 
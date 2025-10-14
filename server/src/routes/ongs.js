import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { encryptSecret } from '../../lib/encryption-service.js';

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

    const ongs = await prisma.Usuario.findMany({
      where: whereClause,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        coordenadas: true,
        redes_sociales: true,
        telefono: true,
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

      // Parsear coordenadas si existen
      let coordinates = null;
      if (ong.coordenadas) {
        try {
          coordinates = JSON.parse(ong.coordenadas);
        } catch (e) {
          console.error('Error al parsear coordenadas:', e);
        }
      }

      // Parsear redes sociales si existen
      let socialMedia = [];
      if (ong.redes_sociales) {
        try {
          socialMedia = JSON.parse(ong.redes_sociales);
        } catch (e) {
          console.error('Error al parsear redes sociales:', e);
        }
      }

      return {
        id: ong.id_usuario,
        name: ong.nombre || 'ONG',
        description: ong.biografia || 'Sin descripción disponible',
        location: ong.ubicacion || 'Ubicación no especificada',
        coordinates,
        socialMedia,
        email: ong.email,
        type: 'public',
        rating: parseFloat(rating.toFixed(1)),
        volunteers_count: 0,
        projects_count: 0,
        website: '',
        phone: ong.telefono || '',
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
    
    const ong = await prisma.Usuario.findFirst({
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

// Ver estado de pagos (público) de una ONG
router.get('/:id/mp-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const detalle = await prisma.DetalleUsuario.findUnique({
      where: { id_usuario: id },
      select: { mp_enabled: true }
    });

    res.json({ enabled: !!detalle?.mp_enabled });
  } catch (error) {
    console.error('Error mp-status:', error);
    res.status(500).json({ error: 'Error al obtener estado de pagos' });
  }
});

// Configurar token de MP (solo ONG autenticada)
router.post('/mp-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    // Confirmar que es ONG
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_tipo_usuario: true }
    });
    if (!user || user.id_tipo_usuario !== 2) {
      return res.status(403).json({ error: 'Solo ONGs pueden configurar pagos' });
    }

    const { accessToken, enable } = req.body || {};
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'accessToken es requerido' });
    }

    // Validación básica de MP: producción APP_USR-
    if (accessToken.startsWith('TEST-') || !accessToken.startsWith('APP_USR-')) {
      return res.status(400).json({ error: 'Se requiere Access Token de producción de Mercado Pago (APP_USR-...)' });
    }

    // Validar ENCRYPTION_KEY configurada
    if (!process.env.ENCRYPTION_KEY) {
      return res.status(500).json({ error: 'Falta configurar ENCRYPTION_KEY en el servidor' });
    }

    const enc = encryptSecret(accessToken);

    const detalle = await prisma.DetalleUsuario.upsert({
      where: { id_usuario: userId },
      update: {
        mp_token_cipher: enc.cipher,
        mp_token_iv: enc.iv,
        mp_token_tag: enc.tag,
        mp_enabled: enable === false ? false : true,
        mp_onboarded_at: new Date()
      },
      create: {
        id_usuario: userId,
        mp_token_cipher: enc.cipher,
        mp_token_iv: enc.iv,
        mp_token_tag: enc.tag,
        mp_enabled: enable === false ? false : true,
        mp_onboarded_at: new Date()
      }
    });

    res.json({ message: 'Token configurado', enabled: detalle.mp_enabled });
  } catch (error) {
    console.error('Error al configurar mp-token:', error);
    const message = error?.message || 'Error al configurar token';
    res.status(500).json({ error: 'Error al configurar token', details: message });
  }
});

// Eliminar token de MP (deshabilitar)
router.delete('/mp-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_tipo_usuario: true }
    });
    if (!user || user.id_tipo_usuario !== 2) {
      return res.status(403).json({ error: 'Solo ONGs pueden modificar pagos' });
    }

    await prisma.DetalleUsuario.update({
      where: { id_usuario: userId },
      data: {
        mp_token_cipher: null,
        mp_token_iv: null,
        mp_token_tag: null,
        mp_enabled: false
      }
    }).catch(async () => {
      // Si no existe, crear registro deshabilitado
      await prisma.DetalleUsuario.create({
        data: { id_usuario: userId, mp_enabled: false }
      });
    });

    res.json({ message: 'Pagos deshabilitados', enabled: false });
  } catch (error) {
    console.error('Error al eliminar mp-token:', error);
    res.status(500).json({ error: 'Error al eliminar token' });
  }
});

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
    const ong = await prisma.Usuario.findUnique({
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
    const calificacion = await prisma.CalificacionONG.upsert({
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
    const todasCalificaciones = await prisma.CalificacionONG.findMany({
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

    const calificacion = await prisma.CalificacionONG.findUnique({
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
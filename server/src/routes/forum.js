import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    
    // Buscar el usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: { id_usuario: true, tipo_usuario: true }
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    req.user = usuario;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Obtener todas las categorías
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        etiqueta: 'asc'
      }
    });
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas las publicaciones del foro
router.get('/publicaciones', async (req, res) => {
  try {
    const publicaciones = await prisma.foro.findMany({
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            tipo_usuario: true,
            ubicacion: true
          }
        },
        foroCategorias: {
          include: {
            categoria: true
          }
        },
        respuestas: {
          select: {
            id_respuesta: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Transformar los datos para el frontend
    const publicacionesFormateadas = publicaciones.map(publicacion => {
      let location = publicacion.ubicacion;
      
      // Si la ubicación es un JSON string, parsearlo
      if (location && typeof location === 'string') {
        try {
          const parsedLocation = JSON.parse(location);
          if (parsedLocation.address) {
            location = parsedLocation.address;
          }
        } catch (e) {
          // Si no es JSON válido, usar el string tal como está
        }
      }
      
      return {
        id: publicacion.id_foro.toString(),
        title: publicacion.titulo,
        content: publicacion.descripcion,
        author: {
          id: publicacion.usuario.id_usuario.toString(),
          name: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
          role: publicacion.usuario.tipo_usuario === 2 ? 'ong' : 'person',
          organization: publicacion.usuario.tipo_usuario === 2 ? publicacion.usuario.nombre : undefined,
          avatar: undefined
        },
        tags: publicacion.foroCategorias.map(fc => fc.categoria.etiqueta),
        location: location,
        likes: 0, // Por ahora no implementamos likes
        comments: publicacion.respuestas.length,
        createdAt: publicacion.fecha,
        isLiked: false
      };
    });

    res.json(publicacionesFormateadas);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear una nueva publicación (solo ONGs)
router.post('/publicaciones', authenticateToken, async (req, res) => {
  try {
    const { titulo, descripcion, categorias, ubicacion, coordenadas } = req.body;
    const userId = req.user?.id_usuario;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar que el usuario sea ONG
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: { tipo_usuario: true }
    });

    if (!usuario || usuario.tipo_usuario !== 2) {
      return res.status(403).json({ error: 'Solo las ONGs pueden crear publicaciones' });
    }

    // Preparar datos de ubicación
    let ubicacionData = null;
    if (ubicacion) {
      if (coordenadas && Array.isArray(coordenadas) && coordenadas.length === 2) {
        ubicacionData = JSON.stringify({
          address: ubicacion,
          coordinates: coordenadas
        });
      } else {
        ubicacionData = ubicacion;
      }
    }

    // Crear la publicación
    const nuevaPublicacion = await prisma.foro.create({
      data: {
        id_usuario: userId,
        titulo,
        descripcion,
        fecha: new Date(),
        ubicacion: ubicacionData
      }
    });

    // Asociar las categorías
    if (categorias && categorias.length > 0) {
      for (const categoriaId of categorias) {
        await prisma.foroCategoria.create({
          data: {
            id_foro: nuevaPublicacion.id_foro,
            id_categoria: parseInt(categoriaId)
          }
        });
      }
    }


    res.status(201).json({ 
      message: 'Publicación creada exitosamente',
      id: nuevaPublicacion.id_foro 
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una publicación específica
router.get('/publicaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const publicacion = await prisma.foro.findUnique({
      where: { id_foro: parseInt(id) },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            tipo_usuario: true
          }
        },
        foroCategorias: {
          include: {
            categoria: true
          }
        },
        respuestas: {
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
          orderBy: {
            fecha: 'asc'
          }
        }
      }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json(publicacion);
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 
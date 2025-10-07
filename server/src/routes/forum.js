import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  moderationMiddleware, 
  titleModerationMiddleware, 
  antiFloodMiddleware 
} from '../../lib/content-moderation.js';
// Sistema de moderación simplificado - sin baneo ni advertencias

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación (TEMPORAL sin verificación de baneo)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    
    // Buscar el usuario en la base de datos
    const usuario = await prisma.Usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: { 
        id_usuario: true, 
        id_tipo_usuario: true
      }
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
    const categorias = await prisma.Etiqueta.findMany({
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
    // Intentar obtener el usuario actual (opcional)
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
        userId = decoded.userId;
      } catch (error) {
        // Token inválido, continuar sin userId
      }
    }

    const publicaciones = await prisma.Publicacion.findMany({
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true,
            ubicacion: true
          }
        },
        publicacionEtiquetas: {
          include: {
            etiqueta: true
          }
        },
        respuestas: {
          select: {
            id_respuesta: true
          }
        },
        likes: userId ? {
          where: {
            id_usuario: userId
          },
          select: {
            id_like: true
          }
        } : false
      },
      orderBy: {
        fecha_publicacion: 'desc'
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
        id: publicacion.id_publicacion.toString(),
        title: publicacion.titulo,
        content: publicacion.descripcion_publicacion,
        id_usuario: publicacion.id_usuario,
        author: {
          id: publicacion.usuario.id_usuario.toString(),
          name: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
          role: publicacion.usuario.id_tipo_usuario === 2 ? 'ong' : 'person',
          organization: publicacion.usuario.id_tipo_usuario === 2 ? publicacion.usuario.nombre : undefined,
          avatar: undefined
        },
        tags: publicacion.publicacionEtiquetas.map(pe => pe.etiqueta.etiqueta),
        location: location,
        likes: publicacion.num_megusta || 0,
        comments: publicacion.respuestas.length,
        createdAt: publicacion.fecha_publicacion,
        isLiked: userId && publicacion.likes && publicacion.likes.length > 0
      };
    });

    res.json(publicacionesFormateadas);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear una nueva publicación (solo ONGs)
router.post('/publicaciones', 
  authenticateToken, 
  titleModerationMiddleware('titulo'),
  moderationMiddleware({ fieldName: 'descripcion', strict: true }),
  async (req, res) => {
  try {
    const { titulo, descripcion, categorias, ubicacion, coordenadas } = req.body;
    const userId = req.user?.id_usuario;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar que el usuario sea ONG
    const usuario = await prisma.Usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_tipo_usuario: true }
    });

    if (!usuario || usuario.id_tipo_usuario !== 2) {
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
    const nuevaPublicacion = await prisma.Publicacion.create({
      data: {
        id_usuario: userId,
        titulo,
        descripcion_publicacion: descripcion,
        fecha_publicacion: new Date(),
        ubicacion: ubicacionData
      }
    });

    // Asociar las etiquetas
    console.log('📝 [CREATE POST] Categorías recibidas:', categorias);
    console.log('📝 [CREATE POST] Tipo de categorias:', typeof categorias);
    console.log('📝 [CREATE POST] Es array?:', Array.isArray(categorias));
    
    if (categorias && categorias.length > 0) {
      for (const categoriaId of categorias) {
        console.log('📝 [CREATE POST] Procesando categoriaId:', categoriaId, 'tipo:', typeof categoriaId);
        const parsedId = parseInt(categoriaId);
        console.log('📝 [CREATE POST] Después de parseInt:', parsedId);
        
        if (isNaN(parsedId)) {
          console.error('❌ [CREATE POST] ID de categoría inválido:', categoriaId);
          continue;
        }
        
        await prisma.PublicacionEtiqueta.create({
          data: {
            id_publicacion: nuevaPublicacion.id_publicacion,
            id_etiqueta: parsedId
          }
        });
      }
    }


    res.status(201).json({ 
      message: 'Publicación creada exitosamente',
      id: nuevaPublicacion.id_publicacion 
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
    
    // Intentar obtener el usuario actual (opcional)
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
        userId = decoded.userId;
      } catch (error) {
        // Token inválido, continuar sin userId
      }
    }
    
    const publicacion = await prisma.Publicacion.findUnique({
      where: { id_publicacion: parseInt(id) },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true,
            ubicacion: true
          }
        },
        publicacionEtiquetas: {
          include: {
            etiqueta: true
          }
        },
        respuestas: {
          select: {
            id_respuesta: true
          }
        },
        likes: userId ? {
          where: {
            id_usuario: userId
          },
          select: {
            id_like: true
          }
        } : false
      }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Parsear ubicación si es JSON
    let location = publicacion.ubicacion;
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

    // Formatear la respuesta igual que en /publicaciones
    const publicacionFormateada = {
      id: publicacion.id_publicacion.toString(),
      title: publicacion.titulo,
      content: publicacion.descripcion_publicacion,
      author: {
        id: publicacion.usuario.id_usuario.toString(),
        name: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
        role: publicacion.usuario.id_tipo_usuario === 2 ? 'ong' : 'person',
        organization: publicacion.usuario.id_tipo_usuario === 2 ? publicacion.usuario.nombre : undefined,
        avatar: undefined
      },
      tags: publicacion.publicacionEtiquetas.map(pe => pe.etiqueta.etiqueta),
      location: location,
      likes: publicacion.num_megusta || 0,
      comments: publicacion.respuestas.length,
      createdAt: publicacion.fecha_publicacion,
      isLiked: userId && publicacion.likes && publicacion.likes.length > 0
    };

    res.json(publicacionFormateada);
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un comentario en una publicación CON VALIDACIÓN (sin cooldown en backend)
router.post('/publicaciones/:id/comentarios', 
  authenticateToken,
  moderationMiddleware({ fieldName: 'mensaje', strict: true }), // VALIDAR ANTES DE CREAR
  async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje } = req.body;
    const userId = req.user?.id_usuario;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar que la publicación existe
    const publicacion = await prisma.Publicacion.findUnique({
      where: { id_publicacion: parseInt(id) }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Crear comentario directamente (ya pasó la validación del middleware)
    const nuevoComentario = await prisma.RespuestaPublicacion.create({
      data: {
        id_publicacion: parseInt(id),
        id_usuario: userId,
        mensaje: mensaje.trim(),
        fecha_respuesta: new Date()
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comentario publicado exitosamente',
      comentario: nuevoComentario
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener comentarios de una publicación (TEMPORAL SIN MODERACIÓN)
router.get('/publicaciones/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la publicación existe
    const publicacion = await prisma.Publicacion.findUnique({
      where: { id_publicacion: parseInt(id) }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Obtener TODOS los comentarios (sin filtro de moderación)
    const comentarios = await prisma.RespuestaPublicacion.findMany({
      where: { id_publicacion: parseInt(id) },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true
          }
        }
      },
      orderBy: { fecha_respuesta: 'asc' }
    });

    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un comentario (solo el autor o admin)
router.delete('/comentarios/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id_usuario;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Buscar el comentario
    const comentario = await prisma.RespuestaPublicacion.findUnique({
      where: { id_respuesta: parseInt(id) },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            id_tipo_usuario: true
          }
        }
      }
    });

    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Verificar que el usuario es el autor del comentario
    if (comentario.id_usuario !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este comentario' });
    }

    // Eliminar el comentario
    await prisma.RespuestaPublicacion.delete({
      where: { id_respuesta: parseInt(id) }
    });

    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar una publicación (solo el autor puede eliminarla)
router.delete('/publicaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_usuario;

    // Buscar la publicación y verificar que existe
    const publicacion = await prisma.Publicacion.findUnique({
      where: { id_publicacion: parseInt(id) },
      select: {
        id_usuario: true
      }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Verificar que el usuario es el autor de la publicación
    if (publicacion.id_usuario !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta publicación' });
    }

    // Eliminar la publicación (cascade eliminará etiquetas y comentarios automáticamente)
    await prisma.Publicacion.delete({
      where: { id_publicacion: parseInt(id) }
    });

    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Dar/quitar "me gusta" a una publicación
router.post('/publicaciones/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_usuario;
    const publicacionId = parseInt(id);

    // Verificar que la publicación existe
    const publicacion = await prisma.Publicacion.findUnique({
      where: { id_publicacion: publicacionId }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Verificar si el usuario ya dio like
    const likeExistente = await prisma.PublicacionLike.findUnique({
      where: {
        id_publicacion_id_usuario: {
          id_publicacion: publicacionId,
          id_usuario: userId
        }
      }
    });

    if (likeExistente) {
      // Quitar like
      await prisma.$transaction([
        prisma.PublicacionLike.delete({
          where: { id_like: likeExistente.id_like }
        }),
        prisma.Publicacion.update({
          where: { id_publicacion: publicacionId },
          data: { num_megusta: { decrement: 1 } }
        })
      ]);

      const updatedPublicacion = await prisma.Publicacion.findUnique({
        where: { id_publicacion: publicacionId },
        select: { num_megusta: true }
      });

      return res.json({
        liked: false,
        totalLikes: updatedPublicacion.num_megusta
      });
    } else {
      // Dar like
      await prisma.$transaction([
        prisma.PublicacionLike.create({
          data: {
            id_publicacion: publicacionId,
            id_usuario: userId
          }
        }),
        prisma.Publicacion.update({
          where: { id_publicacion: publicacionId },
          data: { num_megusta: { increment: 1 } }
        })
      ]);

      const updatedPublicacion = await prisma.Publicacion.findUnique({
        where: { id_publicacion: publicacionId },
        select: { num_megusta: true }
      });

      return res.json({
        liked: true,
        totalLikes: updatedPublicacion.num_megusta
      });
    }
  } catch (error) {
    console.error('Error al dar/quitar like:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estado de likes de una publicación
router.get('/publicaciones/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    let userId = null;

    // Verificar si hay usuario autenticado
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
        userId = decoded.userId;
      } catch (err) {
        // Token inválido, continuar sin userId
      }
    }
    
    const publicacionId = parseInt(id);

    // Obtener el número de likes desde la publicación
    const publicacion = await prisma.Publicacion.findUnique({
      where: { id_publicacion: publicacionId },
      select: { num_megusta: true }
    });

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    let isLiked = false;

    // Si hay usuario autenticado, verificar si dio like
    if (userId) {
      const like = await prisma.PublicacionLike.findUnique({
        where: {
          id_publicacion_id_usuario: {
            id_publicacion: publicacionId,
            id_usuario: userId
          }
        }
      });
      isLiked = !!like;
    }

    res.json({
      totalLikes: publicacion.num_megusta || 0,
      isLiked
    });
  } catch (error) {
    console.error('Error al obtener likes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estadísticas de moderación - DESHABILITADO (sistema de sanciones eliminado)
// router.get('/moderation/stats', authenticateToken, async (req, res) => {
//   res.json({ warnings: 0, infractions: [], banned: false });
// });

export default router; 
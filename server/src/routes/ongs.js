import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las ONGs (usuarios tipo 2)
router.get('/', async (req, res) => {
  try {
    const { type, location } = req.query;
    
    // Construir filtros
    const whereClause = {
      tipo_usuario: 2 // Solo usuarios tipo ONG
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
        correo: true,
        ubicacion: true,
        usuario: true,
        createdAt: true,
        bio: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar los datos para el frontend
    const ongsFormateadas = ongs.map(ong => ({
      id: ong.id_usuario,
      name: ong.nombre || ong.usuario,
      description: ong.bio || 'Sin descripción disponible',
      location: ong.ubicacion || 'Ubicación no especificada',
      email: ong.correo,
      type: 'public', // Por defecto todas son públicas
      rating: 4.5, // Rating por defecto
      volunteers_count: Math.floor(Math.random() * 50) + 10, // Simulado
      projects_count: Math.floor(Math.random() * 20) + 5, // Simulado
      website: `https://${ong.usuario}.org`, // URL simulada
      phone: '+54 9 11 1234-5678' // Teléfono simulado
    }));

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
    
    const ong = await prisma.usuario.findUnique({
      where: { 
        id_usuario: parseInt(id),
        tipo_usuario: 2
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        ubicacion: true,
        usuario: true,
        createdAt: true,
        bio: true
      }
    });

    if (!ong) {
      return res.status(404).json({ error: 'ONG no encontrada' });
    }

    const ongFormateada = {
      id: ong.id_usuario,
      name: ong.nombre || ong.usuario,
      description: ong.bio || 'Sin descripción disponible',
      location: ong.ubicacion || 'Ubicación no especificada',
      email: ong.correo,
      type: 'public',
      rating: 4.5,
      volunteers_count: Math.floor(Math.random() * 50) + 10,
      projects_count: Math.floor(Math.random() * 20) + 5,
      website: `https://${ong.usuario}.org`,
      phone: '+54 9 11 1234-5678'
    };

    res.json({ ong: ongFormateada });
  } catch (error) {
    console.error('Error al obtener ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 
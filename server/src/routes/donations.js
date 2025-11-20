import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    req.user = { id_usuario: decoded.userId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Tipos de donación mapeados
const DONATION_TYPES = {
  'dinero': 1,
  'ropa': 2,
  'juguetes': 3,
  'comida': 4,
  'muebles': 5,
  'otros': 6,
};

/**
 * POST /api/donations
 * Crea una nueva donación (PedidoDonacion)
 * 
 * Body:
 * - ongId: number (id del usuario ONG)
 * - donationType: string ('ropa', 'juguetes', 'comida', 'muebles', 'otros')
 * - itemDescription: string (descripción de los objetos a donar)
 * - cantidad: number (cantidad, por defecto 1)
 */
router.post('/donations', auth, async (req, res) => {
  try {
    const { ongId, donationType, itemDescription, cantidad = 1 } = req.body || {};

    // Validaciones básicas
    if (!ongId) {
      return res.status(400).json({ error: 'ongId es requerido' });
    }

    if (!donationType || !DONATION_TYPES[donationType]) {
      return res.status(400).json({ error: `donationType inválido. Opciones: ${Object.keys(DONATION_TYPES).join(', ')}` });
    }

    if (!itemDescription || itemDescription.trim().length < 10) {
      return res.status(400).json({ error: 'itemDescription es requerido y debe tener al menos 10 caracteres' });
    }

    const parsedOngId = parseInt(ongId, 10);
    const parsedCantidad = parseInt(cantidad, 10) || 1;
    const typoDonacionId = DONATION_TYPES[donationType];

    // Verificar que el usuario ONG existe y es realmente una ONG
    const ongUser = await prisma.usuario.findUnique({
      where: { id_usuario: parsedOngId },
      select: { id_usuario: true, id_tipo_usuario: true }
    });

    if (!ongUser) {
      return res.status(404).json({ error: 'ONG no encontrada' });
    }

    if (ongUser.id_tipo_usuario !== 2) {
      return res.status(400).json({ error: 'El usuario seleccionado no es una ONG válida' });
    }

    // Verificar que existe el tipo de donación
    const tipoDonacion = await prisma.tipoDonacion.findUnique({
      where: { id_tipo_donacion: typoDonacionId }
    });

    if (!tipoDonacion) {
      return res.status(404).json({ error: `Tipo de donación no encontrado: ${donationType}` });
    }

    // Crear la donación (PedidoDonacion)
    const donacion = await prisma.pedidoDonacion.create({
      data: {
        id_usuario: req.user.id_usuario,
        id_tipo_donacion: typoDonacionId,
        cantidad: parsedCantidad,
        fecha_donacion: new Date(),
        estado_evaluacion: 'pendiente',
        descripcion_voluntariado: itemDescription
        // Nota: id_publicacion_etiqueta es opcional para donaciones no monetarias
      },
      include: {
        tipoDonacion: true,
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Donación creada: Usuario ${req.user.id_usuario} donó ${parsedCantidad} ${donationType} a ONG ${parsedOngId}`);

    return res.status(201).json({
      message: 'Donación registrada exitosamente. La ONG debe evaluarla para otorgar puntos.',
      donacion: {
        id_pedido: donacion.id_pedido,
        id_usuario: donacion.id_usuario,
        id_tipo_donacion: donacion.id_tipo_donacion,
        cantidad: donacion.cantidad,
        descripcion: donacion.descripcion_voluntariado,
        estado: donacion.estado_evaluacion,
        fecha_donacion: donacion.fecha_donacion,
        tipo_donacion: donacion.tipoDonacion.tipo_donacion
      }
    });
  } catch (error) {
    console.error('Error creando donación:', error);
    return res.status(500).json({
      error: 'Error al registrar la donación',
      details: error.message
    });
  }
});

/**
 * GET /api/donations/my-donations
 * Obtiene las donaciones realizadas por el usuario autenticado
 */
router.get('/donations/my-donations', auth, async (req, res) => {
  try {
    const donaciones = await prisma.pedidoDonacion.findMany({
      where: {
        id_usuario: req.user.id_usuario
      },
      include: {
        tipoDonacion: true,
        ongEvaluadora: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fecha_donacion: 'desc' }
    });

    return res.json({
      donaciones: donaciones.map(d => ({
        id_pedido: d.id_pedido,
        tipo_donacion: d.tipoDonacion.tipo_donacion,
        cantidad: d.cantidad,
        descripcion: d.descripcion_voluntariado,
        estado: d.estado_evaluacion,
        fecha_donacion: d.fecha_donacion,
        fecha_evaluacion: d.fecha_evaluacion,
        puntos_otorgados: d.puntos_otorgados,
        evaluada_por: d.ongEvaluadora ? `${d.ongEvaluadora.nombre} ${d.ongEvaluadora.apellido}` : null
      }))
    });
  } catch (error) {
    console.error('Error obteniendo donaciones:', error);
    return res.status(500).json({ error: 'Error al obtener donaciones' });
  }
});

export default router;

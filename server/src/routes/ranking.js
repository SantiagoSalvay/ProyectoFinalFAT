import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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

// Función para calcular puntos de una donación
const calcularPuntosDonacion = (cantidad, puntosPorTipo) => {
  return cantidad * puntosPorTipo;
};

// Función para actualizar puntos de un usuario
const actualizarPuntosUsuario = async (idUsuario, puntosGanados) => {
  try {
    await prisma.DetalleUsuario.upsert({
      where: { id_usuario: idUsuario },
      update: {
        puntosActuales: {
          increment: puntosGanados
        },
        ultima_fecha_actualizacion: new Date()
      },
      create: {
        id_usuario: idUsuario,
        puntosActuales: puntosGanados,
        ultima_fecha_actualizacion: new Date()
      }
    });
  } catch (error) {
    console.error('Error actualizando puntos del usuario:', error);
    throw error;
  }
};

// Función para procesar puntos cuando se evalúa una donación
const procesarPuntosDonacion = async (idPedidoDonacion) => {
  try {
    const pedido = await prisma.PedidoDonacion.findUnique({
      where: { id_pedido: idPedidoDonacion },
      include: {
        tipoDonacion: true,
        usuario: true,
        publicacionEtiqueta: {
          include: {
            publicacion: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    });

    if (!pedido) {
      throw new Error('Pedido de donación no encontrado');
    }

    const puntosGanados = calcularPuntosDonacion(pedido.cantidad, pedido.tipoDonacion.puntos);
    
    // Actualizar puntos del donador
    await actualizarPuntosUsuario(pedido.id_usuario, puntosGanados);
    
    // Actualizar puntos de la ONG receptora
    const ongReceptora = pedido.publicacionEtiqueta.publicacion.usuario;
    await actualizarPuntosUsuario(ongReceptora.id_usuario, puntosGanados);

    // Actualizar el campo puntos_otorgados en el pedido
    await prisma.PedidoDonacion.update({
      where: { id_pedido: idPedidoDonacion },
      data: { puntos_otorgados: puntosGanados }
    });

    console.log(`✅ Puntos procesados: Donador=${pedido.id_usuario} (+${puntosGanados}), ONG=${ongReceptora.id_usuario} (+${puntosGanados})`);
    
    return puntosGanados;
  } catch (error) {
    console.error('Error procesando puntos de donación:', error);
    throw error;
  }
};

// Endpoint para evaluar una donación y otorgar puntos
router.post('/evaluar-donacion', auth, async (req, res) => {
  try {
    const { idPedidoDonacion, estadoEvaluacion, descripcionVoluntariado, horasDonadas } = req.body;

    if (!idPedidoDonacion || !estadoEvaluacion) {
      return res.status(400).json({ error: 'idPedidoDonacion y estadoEvaluacion son requeridos' });
    }

    // Verificar que el usuario sea una ONG
    const usuario = await prisma.Usuario.findUnique({
      where: { id_usuario: req.user.id_usuario },
      select: { id_tipo_usuario: true }
    });

    if (!usuario || usuario.id_tipo_usuario !== 2) {
      return res.status(403).json({ error: 'Solo las ONGs pueden evaluar donaciones' });
    }

    // Actualizar el pedido de donación
    const pedidoActualizado = await prisma.PedidoDonacion.update({
      where: { id_pedido: parseInt(idPedidoDonacion) },
      data: {
        estado_evaluacion: estadoEvaluacion,
        id_ong_evaluadora: req.user.id_usuario,
        fecha_evaluacion: new Date(),
        descripcion_voluntariado: descripcionVoluntariado,
        horas_donadas: horasDonadas ? parseInt(horasDonadas) : null
      }
    });

    // Si la evaluación es aprobada, procesar los puntos
    if (estadoEvaluacion === 'aprobada') {
      await procesarPuntosDonacion(parseInt(idPedidoDonacion));
    }

    res.json({ 
      message: 'Donación evaluada exitosamente',
      pedido: pedidoActualizado
    });

  } catch (error) {
    console.error('Error evaluando donación:', error);
    res.status(500).json({ error: 'Error evaluando donación', details: error.message });
  }
});

// Función para recalcular y actualizar rankings
const recalcularRankings = async () => {
  try {
    // Obtener todos los usuarios con sus puntos actuales
    const usuarios = await prisma.DetalleUsuario.findMany({
      include: {
        Usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true
          }
        }
      },
      orderBy: { puntosActuales: 'desc' }
    });

    // Crear o actualizar tipos de ranking (solo ONGs y Usuarios)
    const tipoRankingONG = await prisma.TipoRanking.upsert({
      where: { tipo_ranking: 'ONGs' },
      update: {},
      create: { tipo_ranking: 'ONGs' }
    });

    const tipoRankingUsuarios = await prisma.TipoRanking.upsert({
      where: { tipo_ranking: 'Usuarios' },
      update: {},
      create: { tipo_ranking: 'Usuarios' }
    });

    // Limpiar rankings existentes
    await prisma.Ranking.deleteMany({});

    // Crear rankings
    const rankings = [];
    let puestoONG = 1;
    let puestoUsuario = 1;

    for (const detalle of usuarios) {
      const usuario = detalle.Usuario;

      // Ranking por tipo de usuario
      if (usuario.id_tipo_usuario === 2) { // ONG
        rankings.push({
          id_tipo_ranking: tipoRankingONG.id_tipo_ranking,
          id_usuario: usuario.id_usuario,
          puesto: puestoONG,
          puntos: detalle.puntosActuales
        });
        puestoONG++;
      } else { // Usuario regular
        rankings.push({
          id_tipo_ranking: tipoRankingUsuarios.id_tipo_ranking,
          id_usuario: usuario.id_usuario,
          puesto: puestoUsuario,
          puntos: detalle.puntosActuales
        });
        puestoUsuario++;
      }
    }

    // Insertar todos los rankings
    if (rankings.length > 0) {
      await prisma.Ranking.createMany({ data: rankings });
    }

    console.log(`✅ Rankings recalculados: ${rankings.length} entradas creadas`);
    return rankings.length;

  } catch (error) {
    console.error('Error recalculando rankings:', error);
    throw error;
  }
};

// Endpoint para obtener rankings
router.get('/rankings', async (req, res) => {
  try {
    const { tipo = 'ONGs', limite = 50 } = req.query;

    if (!['ONGs', 'Usuarios'].includes(String(tipo))) {
      return res.status(400).json({ error: 'Tipo debe ser ONGs o Usuarios' });
    }

    const tipoRanking = await prisma.TipoRanking.findFirst({
      where: { tipo_ranking: tipo }
    });

    if (!tipoRanking) {
      return res.status(404).json({ error: 'Tipo de ranking no encontrado' });
    }

    const rankings = await prisma.Ranking.findMany({
      where: { id_tipo_ranking: tipoRanking.id_tipo_ranking },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            id_tipo_usuario: true,
            DetalleUsuario: {
              select: {
                puntosActuales: true,
                ultima_fecha_actualizacion: true
              }
            }
          }
        }
      },
      orderBy: { puesto: 'asc' },
      take: parseInt(limite)
    });

    // Multiplicador para ONGs (por ahora fijo en 1, escalable a futuro)
    const multiplicadorPorOngId = new Map();
    for (const r of rankings) {
      if (r.usuario.id_tipo_usuario === 2) {
        multiplicadorPorOngId.set(r.usuario.id_usuario, 1);
      }
    }

    res.json({
      tipo: tipoRanking.tipo_ranking,
      rankings: rankings.map(r => ({
        puesto: r.puesto,
        usuario: {
          id: r.usuario.id_usuario,
          nombre: r.usuario.nombre,
          apellido: r.usuario.apellido,
          tipo_usuario: r.usuario.id_tipo_usuario
        },
        puntos: r.puntos,
        multiplicador: r.usuario.id_tipo_usuario === 2 ? (multiplicadorPorOngId.get(r.usuario.id_usuario) || 1) : undefined,
        ultima_actualizacion: r.usuario.DetalleUsuario?.ultima_fecha_actualizacion
      }))
    });

  } catch (error) {
    console.error('Error obteniendo rankings:', error);
    res.status(500).json({ error: 'Error obteniendo rankings', details: error.message });
  }
});

// Endpoint para obtener el ranking de un usuario específico
router.get('/mi-ranking', auth, async (req, res) => {
  try {
    const rankings = await prisma.Ranking.findMany({
      where: { id_usuario: req.user.id_usuario },
      include: {
        tipoRanking: true,
        usuario: {
          select: {
            DetalleUsuario: {
              select: {
                puntosActuales: true,
                ultima_fecha_actualizacion: true
              }
            }
          }
        }
      }
    });

    const resultado = {};
    for (const ranking of rankings) {
      resultado[ranking.tipoRanking.tipo_ranking] = {
        puesto: ranking.puesto,
        puntos: ranking.puntos,
        ultima_actualizacion: ranking.usuario.DetalleUsuario?.ultima_fecha_actualizacion
      };
    }

    res.json(resultado);

  } catch (error) {
    console.error('Error obteniendo ranking del usuario:', error);
    res.status(500).json({ error: 'Error obteniendo ranking del usuario', details: error.message });
  }
});

// Endpoint para recalcular rankings (solo admin)
router.post('/recalcular', auth, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    const usuario = await prisma.Usuario.findUnique({
      where: { id_usuario: req.user.id_usuario },
      select: { id_tipo_usuario: true }
    });

    if (!usuario || usuario.id_tipo_usuario !== 3) {
      return res.status(403).json({ error: 'Solo los administradores pueden recalcular rankings' });
    }

    const cantidadRankings = await recalcularRankings();

    res.json({ 
      message: 'Rankings recalculados exitosamente',
      cantidad_rankings: cantidadRankings
    });

  } catch (error) {
    console.error('Error recalculando rankings:', error);
    res.status(500).json({ error: 'Error recalculando rankings', details: error.message });
  }
});

// Endpoint para obtener estadísticas de puntos
router.get('/estadisticas', auth, async (req, res) => {
  try {
    const { idUsuario } = req.query;
    const usuarioId = idUsuario ? parseInt(idUsuario) : req.user.id_usuario;

    // Verificar permisos (solo puede ver sus propias estadísticas o ser admin)
    if (idUsuario && req.user.id_usuario !== usuarioId) {
      const usuario = await prisma.Usuario.findUnique({
        where: { id_usuario: req.user.id_usuario },
        select: { id_tipo_usuario: true }
      });

      if (!usuario || usuario.id_tipo_usuario !== 3) {
        return res.status(403).json({ error: 'No tienes permisos para ver estas estadísticas' });
      }
    }

    // Obtener estadísticas del usuario
    const detalleUsuario = await prisma.DetalleUsuario.findUnique({
      where: { id_usuario: usuarioId },
      include: {
        Usuario: {
          select: {
            nombre: true,
            apellido: true,
            id_tipo_usuario: true
          }
        }
      }
    });

    if (!detalleUsuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener donaciones realizadas
    const donacionesRealizadas = await prisma.PedidoDonacion.findMany({
      where: { 
        id_usuario: usuarioId,
        estado_evaluacion: 'aprobada'
      },
      include: {
        tipoDonacion: true
      }
    });

    // Obtener donaciones recibidas (para ONGs)
    const donacionesRecibidas = await prisma.PedidoDonacion.findMany({
      where: {
        publicacionEtiqueta: {
          publicacion: {
            id_usuario: usuarioId
          }
        },
        estado_evaluacion: 'aprobada'
      },
      include: {
        tipoDonacion: true,
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    const totalPuntosDonaciones = donacionesRealizadas.reduce((sum, d) => sum + (d.puntos_otorgados || 0), 0);
    const totalPuntosRecibidos = donacionesRecibidas.reduce((sum, d) => sum + (d.puntos_otorgados || 0), 0);

    res.json({
      usuario: {
        id: usuarioId,
        nombre: detalleUsuario.Usuario.nombre,
        apellido: detalleUsuario.Usuario.apellido,
        tipo_usuario: detalleUsuario.Usuario.id_tipo_usuario
      },
      puntos: {
        actuales: detalleUsuario.puntosActuales,
        por_donaciones: totalPuntosDonaciones,
        por_donaciones_recibidas: totalPuntosRecibidos,
        ultima_actualizacion: detalleUsuario.ultima_fecha_actualizacion
      },
      estadisticas: {
        donaciones_realizadas: donacionesRealizadas.length,
        donaciones_recibidas: donacionesRecibidas.length,
        total_donaciones_realizadas: donacionesRealizadas.reduce((sum, d) => sum + d.cantidad, 0),
        total_donaciones_recibidas: donacionesRecibidas.reduce((sum, d) => sum + d.cantidad, 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas', details: error.message });
  }
});

export default router; 
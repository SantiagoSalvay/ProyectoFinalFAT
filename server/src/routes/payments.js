import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../../lib/encryption-service.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

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

router.post('/mp/create', auth, async (req, res) => {
  try {
    const { ongId, description, amount, quantity = 1 } = req.body || {};
    if (!ongId || amount === undefined || amount === null || !description) {
      return res.status(400).json({ error: 'ongId, amount y description son requeridos' });
    }
    const qty = Number.isFinite(Number(quantity)) ? parseInt(quantity, 10) : 1;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'amount debe ser un número mayor a 0' });
    }

    const ongUser = await prisma.usuario.findUnique({
      where: { id_usuario: parseInt(ongId) },
      select: { id_usuario: true, id_tipo_usuario: true }
    });

    if (!ongUser || ongUser.id_tipo_usuario !== 2) {
      return res.status(404).json({ error: 'ONG no válida' });
    }

    const detalle = await prisma.detalleUsuario.findFirst({
      where: { id_usuario: parseInt(ongId) },
      select: { mp_enabled: true, mp_token_cipher: true, mp_token_iv: true, mp_token_tag: true }
    });

    if (!detalle || !detalle.mp_enabled || !detalle.mp_token_cipher) {
      return res.status(400).json({ error: 'La ONG no está habilitada para recibir donaciones monetarias' });
    }

    // Validar que todos los campos de encriptación estén presentes
    if (!detalle.mp_token_iv || !detalle.mp_token_tag) {
      return res.status(400).json({ 
        error: 'La configuración de pagos de la ONG está incompleta. La ONG debe reconfigurar su token de MercadoPago.' 
      });
    }

    let accessToken;
    try {
      accessToken = decryptSecret({
        cipher: detalle.mp_token_cipher,
        iv: detalle.mp_token_iv,
        tag: detalle.mp_token_tag
      });
    } catch (decryptError) {
      console.error('Error al desencriptar token de MP:', decryptError.message);
      return res.status(500).json({ 
        error: 'Error al acceder a la configuración de pagos de la ONG',
        details: decryptError.message,
        hint: 'La ONG debe reconfigurar su token de MercadoPago. Esto puede ocurrir si la clave de encriptación del servidor cambió.'
      });
    }

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);

    const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
    const apiBaseUrl = process.env.API_BASE_URL || req.protocol + '://' + req.get('host');
    // URLs de back_urls deben apuntar al endpoint del backend que procesa y luego redirige al frontend
    const successUrl = process.env.MP_SUCCESS_URL || `${apiBaseUrl}/api/payments/mp/process-payment`;
    const failureUrl = process.env.MP_FAILURE_URL || `${apiBaseUrl}/api/payments/mp/process-payment`;
    const pendingUrl = process.env.MP_PENDING_URL || `${apiBaseUrl}/api/payments/mp/process-payment`;

    const body = {
      items: [
        {
          title: description,
          unit_price: amt,
          quantity: qty,
          currency_id: 'ARS'
        }
      ],
      metadata: {
        ongId: String(ongId),
        donorId: String(req.user.id_usuario)
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      }
    };

    const prefResult = await preference.create({ body });

    // Registrar pedido de donación inmediatamente al crear la preferencia
    try {
      const dineroTipo = await prisma.tipoDonacion.findFirst({
        where: { tipo_donacion: 'Dinero' },
        select: { id_tipo_donacion: true }
      });

      if (dineroTipo) {
        // Asegurar etiqueta y publicación "contenedor" para donaciones monetarias de esta ONG
        let etiqueta = await prisma.etiqueta.findFirst({ where: { etiqueta: 'Donaciones Monetarias' } });
        if (!etiqueta) {
          etiqueta = await prisma.etiqueta.create({ data: { etiqueta: 'Donaciones Monetarias' } });
        }

        let publicacion = await prisma.publicacion.findFirst({
          where: { id_usuario: parseInt(ongId), titulo: 'Donación Monetaria Directa' }
        });
        if (!publicacion) {
          publicacion = await prisma.publicacion.create({
            data: {
              id_usuario: parseInt(ongId),
              titulo: 'Donación Monetaria Directa',
              descripcion_publicacion: 'Registro de donaciones monetarias directas',
              ubicacion: null,
              imagenes: null
            }
          });
        }

        let pubEtiqueta = await prisma.publicacionEtiqueta.findFirst({
          where: { id_publicacion: publicacion.id_publicacion, id_etiqueta: etiqueta.id_etiqueta }
        });
        if (!pubEtiqueta) {
          pubEtiqueta = await prisma.publicacionEtiqueta.create({
            data: { id_publicacion: publicacion.id_publicacion, id_etiqueta: etiqueta.id_etiqueta }
          });
        }

        await prisma.pedidoDonacion.create({
          data: {
            id_publicacion_etiqueta: pubEtiqueta.id_publicacion_etiqueta,
            id_usuario: req.user.id_usuario,
            id_tipo_donacion: dineroTipo.id_tipo_donacion,
            cantidad: Math.round(amt)
          }
        });

        console.log(`✅ pedidoDonacion creado: usuario=${req.user.id_usuario}, cantidad=${Math.round(amt)}, ONG=${ongId}`);
      }
    } catch (logErr) {
      console.warn('No se pudo registrar pedidoDonacion:', logErr?.message || logErr);
    }

    return res.json({ id: prefResult.id, init_point: prefResult.init_point });
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    res.status(500).json({ error: 'Error creando preferencia', details: error.message });
  }
});

// Función auxiliar para procesar el pago desde MercadoPago
async function processPaymentFromMP(paymentId, accessToken) {
  try {
    const mpClient = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(mpClient);
    
    // Obtener el pago desde MercadoPago
    const paymentData = await payment.get({ id: paymentId });
    
    if (!paymentData || !paymentData.metadata) {
      throw new Error('No se pudo obtener el pago o no tiene metadata');
    }

    const { ongId, donorId } = paymentData.metadata;
    if (!ongId || !donorId) {
      throw new Error('El pago no tiene los metadata necesarios (ongId, donorId)');
    }

    const paymentStatus = paymentData.status; // 'approved', 'pending', 'rejected', etc.
    
    // Buscar el pedido de donación usando los metadata
    const pedidoDonacion = await prisma.pedidoDonacion.findFirst({
      where: {
        id_usuario: parseInt(donorId),
        fecha_donacion: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas para ser más preciso
        },
        publicacionEtiqueta: {
          publicacion: {
            id_usuario: parseInt(ongId)
          }
        },
        estado_evaluacion: 'pendiente'
      },
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
      },
      orderBy: { fecha_donacion: 'desc' }
    });

    if (!pedidoDonacion) {
      console.warn(`⚠️ No se encontró pedidoDonacion para paymentId=${paymentId}, ongId=${ongId}, donorId=${donorId}`);
      return { success: false, message: 'Pedido de donación no encontrado' };
    }

    // Solo procesar si el estado del pago es 'approved'
    if (paymentStatus === 'approved' && pedidoDonacion.estado_evaluacion === 'pendiente') {
      const puntosGanados = pedidoDonacion.cantidad * pedidoDonacion.tipoDonacion.puntos;

      // Actualizar el pedido de donación
      await prisma.pedidoDonacion.update({
        where: { id_pedido: pedidoDonacion.id_pedido },
        data: {
          estado_evaluacion: 'aprobada',
          fecha_evaluacion: new Date(),
          puntos_otorgados: puntosGanados
        }
      });

      // Actualizar puntos del donador
      const existingDetalleDonador = await prisma.detalleUsuario.findFirst({
        where: { id_usuario: pedidoDonacion.id_usuario },
        select: { id_detalle_usuario: true }
      });

      if (existingDetalleDonador) {
        await prisma.detalleUsuario.update({
          where: { id_detalle_usuario: existingDetalleDonador.id_detalle_usuario },
          data: {
            puntosActuales: { increment: puntosGanados },
            ultima_fecha_actualizacion: new Date()
          }
        });
      } else {
        await prisma.detalleUsuario.create({
          data: {
            id_usuario: pedidoDonacion.id_usuario,
            puntosActuales: puntosGanados,
            ultima_fecha_actualizacion: new Date()
          }
        });
      }

      // Actualizar puntos de la ONG receptora
      const ongReceptora = pedidoDonacion.publicacionEtiqueta.publicacion.usuario;
      const existingDetalleOng = await prisma.detalleUsuario.findFirst({
        where: { id_usuario: ongReceptora.id_usuario },
        select: { id_detalle_usuario: true }
      });

      if (existingDetalleOng) {
        await prisma.detalleUsuario.update({
          where: { id_detalle_usuario: existingDetalleOng.id_detalle_usuario },
          data: {
            puntosActuales: { increment: puntosGanados },
            ultima_fecha_actualizacion: new Date()
          }
        });
      } else {
        await prisma.detalleUsuario.create({
          data: {
            id_usuario: ongReceptora.id_usuario,
            puntosActuales: puntosGanados,
            ultima_fecha_actualizacion: new Date()
          }
        });
      }

      console.log(`✅ Pago procesado correctamente: paymentId=${paymentId}, pedidoDonacion=${pedidoDonacion.id_pedido}, puntos=${puntosGanados}`);
      return { success: true, pedidoDonacion, puntosGanados };
    } else if (paymentStatus === 'pending') {
      console.log(`⏳ Pago pendiente: paymentId=${paymentId}`);
      return { success: true, status: 'pending' };
    } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
      console.log(`❌ Pago rechazado/cancelado: paymentId=${paymentId}, status=${paymentStatus}`);
      return { success: true, status: 'rejected' };
    }

    return { success: true, status: paymentStatus, alreadyProcessed: pedidoDonacion.estado_evaluacion !== 'pendiente' };
  } catch (error) {
    console.error('Error procesando pago desde MP:', error);
    throw error;
  }
}

// Endpoint para procesar cuando el usuario regresa de MercadoPago (GET con query params)
router.get('/mp/process-payment', async (req, res) => {
  try {
    const { payment_id, collection_id, collection_status, preference_id, status } = req.query;
    
    // MercadoPago puede enviar payment_id o collection_id
    const paymentId = payment_id || collection_id;
    
    if (!paymentId) {
      return res.status(400).json({ error: 'payment_id o collection_id es requerido' });
    }

    // Obtener el preference para obtener los metadata (ongId, donorId)
    // Primero necesitamos el accessToken de la ONG
    // Como no tenemos el preference_id de manera confiable, necesitamos otra estrategia
    // Buscar pedidosDonacion recientes y encontrar el que corresponde
    
    // Buscar pedidosDonacion recientes pendientes
    const pedidosRecientes = await prisma.pedidoDonacion.findMany({
      where: {
        fecha_donacion: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas
        },
        estado_evaluacion: 'pendiente'
      },
      include: {
        publicacionEtiqueta: {
          include: {
            publicacion: {
              include: {
                    usuario: {
                      include: {
                        DetalleUsuario: {
                          select: {
                            mp_enabled: true,
                            mp_token_cipher: true,
                            mp_token_iv: true,
                            mp_token_tag: true
                          }
                        }
                      }
                    }
              }
            }
          }
        }
      },
      orderBy: { fecha_donacion: 'desc' },
      take: 10 // Limitar búsqueda a los 10 más recientes
    });

    let processed = false;
    let errorMessage = 'No se pudo procesar el pago';

    // Intentar procesar con cada ONG hasta encontrar la correcta
    for (const pedido of pedidosRecientes) {
      const ong = pedido.publicacionEtiqueta?.publicacion?.usuario;
      if (!ong) continue;

      // DetalleUsuario es un array en el schema, tomar el primero
      const detalle = Array.isArray(ong.DetalleUsuario) ? ong.DetalleUsuario[0] : ong.DetalleUsuario;
      if (!detalle || !detalle.mp_enabled || !detalle.mp_token_cipher || !detalle.mp_token_iv || !detalle.mp_token_tag) {
        continue;
      }

      try {
        const accessToken = decryptSecret({
          cipher: detalle.mp_token_cipher,
          iv: detalle.mp_token_iv,
          tag: detalle.mp_token_tag
        });

        const result = await processPaymentFromMP(paymentId, accessToken);
        
        if (result.success) {
          processed = true;
          
          // Redirigir según el estado
          const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
          if (result.status === 'approved' || !result.status) {
            return res.redirect(`${baseUrl}/donaciones/exito`);
          } else if (result.status === 'pending') {
            return res.redirect(`${baseUrl}/donaciones/pendiente`);
          } else {
            return res.redirect(`${baseUrl}/donaciones/error`);
          }
        }
      } catch (err) {
        // Continuar con la siguiente ONG si falla
        console.warn(`Error procesando con ONG ${ong.id_usuario}:`, err.message);
        continue;
      }
    }

    if (!processed) {
      console.error(`No se pudo procesar payment ${paymentId}`);
      const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
      return res.redirect(`${baseUrl}/donaciones/error`);
    }
  } catch (error) {
    console.error('Error procesando pago desde query params:', error);
    const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
    return res.redirect(`${baseUrl}/donaciones/error`);
  }
});

// Endpoint para procesar callback/webhook de MercadoPago
router.post('/mp/callback', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.warn('⚠️ Callback recibido sin paymentId');
        return res.status(400).json({ error: 'payment_id es requerido' });
      }

      console.log(`📥 Webhook recibido: paymentId=${paymentId}, type=${type}`);

      // Obtener el preference para obtener los metadata (ongId, donorId)
      // Buscar pedidosDonacion recientes pendientes
      const pedidosRecientes = await prisma.pedidoDonacion.findMany({
        where: {
          fecha_donacion: {
            gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas
          },
          estado_evaluacion: 'pendiente'
        },
        include: {
          publicacionEtiqueta: {
            include: {
              publicacion: {
                include: {
                    usuario: {
                      include: {
                        DetalleUsuario: {
                          select: {
                            mp_enabled: true,
                            mp_token_cipher: true,
                            mp_token_iv: true,
                            mp_token_tag: true
                          }
                        }
                      }
                    }
                }
              }
            }
          }
        },
        orderBy: { fecha_donacion: 'desc' },
        take: 10 // Limitar búsqueda a los 10 más recientes
      });

      let processed = false;

      // Intentar procesar con cada ONG hasta encontrar la correcta
      for (const pedido of pedidosRecientes) {
        const ong = pedido.publicacionEtiqueta?.publicacion?.usuario;
        if (!ong) continue;

        const detalle = ong.DetalleUsuario;
        if (!detalle || !detalle.mp_enabled || !detalle.mp_token_cipher || !detalle.mp_token_iv || !detalle.mp_token_tag) {
          continue;
        }

        try {
          const accessToken = decryptSecret({
            cipher: detalle.mp_token_cipher,
            iv: detalle.mp_token_iv,
            tag: detalle.mp_token_tag
          });

          const result = await processPaymentFromMP(paymentId, accessToken);
          
          if (result.success) {
            processed = true;
            break;
          }
        } catch (err) {
          // Continuar con la siguiente ONG si falla
          console.warn(`Error procesando webhook con ONG ${ong.id_usuario}:`, err.message);
          continue;
        }
      }

      if (!processed) {
        console.warn(`⚠️ No se pudo procesar webhook para payment ${paymentId}`);
      }
    }
    
    // Siempre responder 200 para que MP no reintente
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando callback de MP:', error);
    // Responder 200 para que MP no reintente indefinidamente
    res.status(200).json({ error: 'Error procesando callback' });
  }
});

export default router;

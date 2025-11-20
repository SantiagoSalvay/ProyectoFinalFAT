import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../../lib/encryption-service.js';

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

    // PASO 1: Crear PedidoDonacion ANTES de generar preferencia MP
    let pedidoDonacion = null;
    try {
      const dineroTipo = await prisma.tipoDonacion.findFirst({
        where: { tipo_donacion: 'Dinero' },
        select: { id_tipo_donacion: true }
      });

      if (!dineroTipo) {
        return res.status(500).json({ error: 'Tipo de donación "Dinero" no configurado en la base de datos' });
      }

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

      // CREAR PedidoDonacion en estado "pendiente"
      pedidoDonacion = await prisma.pedidoDonacion.create({
        data: {
          id_publicacion_etiqueta: pubEtiqueta.id_publicacion_etiqueta,
          id_usuario: req.user.id_usuario,
          id_tipo_donacion: dineroTipo.id_tipo_donacion,
          cantidad: Math.round(amt),
          estado_evaluacion: 'pendiente'
        }
      });

      console.log(`✅ PedidoDonacion creado ANTES de MP: id_pedido=${pedidoDonacion.id_pedido}, usuario=${req.user.id_usuario}, monto=${amt}`);
    } catch (createErr) {
      console.error('Error creando PedidoDonacion:', createErr?.message);
      return res.status(500).json({ 
        error: 'Error creando registro de donación',
        details: createErr?.message 
      });
    }

    // PASO 2: Crear preferencia MP con el ID del PedidoDonacion en metadata
    const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
    const apiBaseUrl = process.env.API_BASE_URL || req.protocol + '://' + req.get('host');
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
        donorId: String(req.user.id_usuario),
        pedidoId: String(pedidoDonacion.id_pedido)
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      }
    };

    // Llamada directa a la API de MercadoPago para crear la preferencia
    const prefResp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const prefResult = await prefResp.json();
    if (!prefResp.ok) {
      console.error('Error creando preferencia en MercadoPago:', prefResult);
      return res.status(502).json({ error: 'Error creando preferencia en MercadoPago', details: prefResult });
    }

    return res.json({ id: prefResult.id, init_point: prefResult.init_point });
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    const debugEnabled = process.env.DEBUG_MP === 'true' || process.env.NODE_ENV !== 'production';
    const resp = { error: 'Error creando preferencia', details: error.message };
    if (debugEnabled) resp.stack = error.stack;
    res.status(500).json(resp);
  }
});

// Función auxiliar para procesar el pago desde MercadoPago
async function processPaymentFromMP(paymentId, accessToken) {
  try {
    // Obtener el pago desde la API de MercadoPago
    const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const paymentData = await paymentResp.json();
    if (!paymentResp.ok) {
      console.error('Error consultando pago en MercadoPago:', paymentData);
      throw new Error('No se pudo obtener el pago desde MercadoPago');
    }

    if (!paymentData || !paymentData.metadata) {
      throw new Error('El pago no contiene metadata');
    }

    const { ongId, donorId, pedidoId } = paymentData.metadata;
    if (!ongId || !donorId || !pedidoId) {
      throw new Error('El pago no tiene los metadata necesarios (ongId, donorId, pedidoId)');
    }

    const paymentStatus = paymentData.status; // 'approved', 'pending', 'rejected', etc.
    
    // Buscar el pedido de donación usando el ID directo desde metadata (mucho más eficiente)
    const pedidoDonacion = await prisma.pedidoDonacion.findUnique({
      where: { id_pedido: parseInt(pedidoId) },
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

    if (!pedidoDonacion) {
      console.warn(`⚠️ No se encontró pedidoDonacion con id_pedido=${pedidoId}`);
      return { success: false, message: 'Pedido de donación no encontrado' };
    }

    // Validar que el pedido pertenece a los usuarios correctos
    if (pedidoDonacion.id_usuario !== parseInt(donorId) || 
        pedidoDonacion.publicacionEtiqueta.publicacion.id_usuario !== parseInt(ongId)) {
      console.warn(`⚠️ Validación fallida: pedido=${pedidoId}, donador=${pedidoDonacion.id_usuario} vs ${donorId}, ong=${pedidoDonacion.publicacionEtiqueta.publicacion.id_usuario} vs ${ongId}`);
      return { success: false, message: 'Validación de propietarios fallida' };
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

    console.log(`📥 GET process-payment recibido: paymentId=${paymentId}`);

    // Obtener todas las ONGs habilitadas para MP (necesitamos intentar con todas para encontrar el token correcto)
    const ongsConMP = await prisma.detalleUsuario.findMany({
      where: { 
        mp_enabled: true,
        mp_token_cipher: { not: null },
        mp_token_iv: { not: null },
        mp_token_tag: { not: null }
      },
      include: {
        usuario: {
          select: { id_usuario: true }
        }
      }
    });

    let processed = false;
    let lastError = null;

    // Intentar procesar con cada ONG hasta encontrar la correcta
    for (const detalle of ongsConMP) {
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
        lastError = err;
        console.warn(`Error procesando con ONG ${detalle.usuario.id_usuario}:`, err.message);
        continue;
      }
    }

    if (!processed) {
      console.error(`No se pudo procesar payment ${paymentId}:`, lastError?.message);
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
        return res.status(200).json({ message: 'OK' }); // Responder 200 para que MP no reintente
      }

      console.log(`📥 Webhook de MP recibido: paymentId=${paymentId}, type=${type}`);

      // Obtener todas las ONGs habilitadas para MP
      const ongsConMP = await prisma.detalleUsuario.findMany({
        where: { 
          mp_enabled: true,
          mp_token_cipher: { not: null },
          mp_token_iv: { not: null },
          mp_token_tag: { not: null }
        },
        include: {
          usuario: {
            select: { id_usuario: true }
          }
        }
      });

      let processed = false;

      // Intentar procesar con cada ONG hasta encontrar la correcta
      for (const detalle of ongsConMP) {
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
          console.warn(`Error procesando webhook con ONG ${detalle.usuario.id_usuario}:`, err.message);
          continue;
        }
      }

      if (!processed) {
        console.warn(`⚠️ No se pudo procesar webhook para payment ${paymentId}`);
      }
    }
    
    // Siempre responder 200 para que MP no reintente indefinidamente
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando callback de MP:', error);
    // Responder 200 para que MP no reintente indefinidamente
    res.status(200).json({ error: 'Error procesando callback' });
  }
});

export default router;

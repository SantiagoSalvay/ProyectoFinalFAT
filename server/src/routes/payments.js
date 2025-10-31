import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../../lib/encryption-service.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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

    const ongUser = await prisma.Usuario.findUnique({
      where: { id_usuario: parseInt(ongId) },
      select: { id_usuario: true, id_tipo_usuario: true, DetalleUsuario: true }
    });

    if (!ongUser || ongUser.id_tipo_usuario !== 2) {
      return res.status(404).json({ error: 'ONG no válida' });
    }

    const detalle = await prisma.DetalleUsuario.findFirst({
      where: { id_usuario: parseInt(ongId) },
      select: { mp_enabled: true, mp_token_cipher: true, mp_token_iv: true, mp_token_tag: true }
    });

    if (!detalle || !detalle.mp_enabled || !detalle.mp_token_cipher) {
      return res.status(400).json({ error: 'La ONG no está habilitada para recibir donaciones monetarias' });
    }

    const accessToken = decryptSecret({
      cipher: detalle.mp_token_cipher,
      iv: detalle.mp_token_iv,
      tag: detalle.mp_token_tag
    });

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);

    const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
    const successUrl = process.env.MP_SUCCESS_URL || `${baseUrl}/donaciones/exito`;
    const failureUrl = process.env.MP_FAILURE_URL || `${baseUrl}/donaciones/error`;
    const pendingUrl = process.env.MP_PENDING_URL || `${baseUrl}/donaciones/pendiente`;

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
      const dineroTipo = await prisma.TipoDonacion.findFirst({
        where: { tipo_donacion: 'Dinero' },
        select: { id_tipo_donacion: true }
      });

      if (dineroTipo) {
        // Asegurar etiqueta y publicación "contenedor" para donaciones monetarias de esta ONG
        let etiqueta = await prisma.Etiqueta.findFirst({ where: { etiqueta: 'Donaciones Monetarias' } });
        if (!etiqueta) {
          etiqueta = await prisma.Etiqueta.create({ data: { etiqueta: 'Donaciones Monetarias' } });
        }

        let publicacion = await prisma.Publicacion.findFirst({
          where: { id_usuario: parseInt(ongId), titulo: 'Donación Monetaria Directa' }
        });
        if (!publicacion) {
          publicacion = await prisma.Publicacion.create({
            data: {
              id_usuario: parseInt(ongId),
              titulo: 'Donación Monetaria Directa',
              descripcion_publicacion: 'Registro de donaciones monetarias directas',
              ubicacion: null,
              imagenes: null
            }
          });
        }

        let pubEtiqueta = await prisma.PublicacionEtiqueta.findFirst({
          where: { id_publicacion: publicacion.id_publicacion, id_etiqueta: etiqueta.id_etiqueta }
        });
        if (!pubEtiqueta) {
          pubEtiqueta = await prisma.PublicacionEtiqueta.create({
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

        console.log(`✅ PedidoDonacion creado: usuario=${req.user.id_usuario}, cantidad=${Math.round(amt)}, ONG=${ongId}`);
      }
    } catch (logErr) {
      console.warn('No se pudo registrar PedidoDonacion:', logErr?.message || logErr);
    }

    return res.json({ id: prefResult.id, init_point: prefResult.init_point });
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    res.status(500).json({ error: 'Error creando preferencia', details: error.message });
  }
});

// Endpoint para procesar callback de MercadoPago
router.post('/mp/callback', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Aquí deberías verificar el pago con MercadoPago
      // Por ahora, simulamos que el pago fue exitoso
      console.log(`Processing payment callback: ${paymentId}`);
      
      // Buscar el pedido de donación más reciente para este pago
      const pedidoReciente = await prisma.PedidoDonacion.findFirst({
        where: {
          fecha_donacion: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
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

      if (pedidoReciente && pedidoReciente.estado_evaluacion === 'pendiente') {
        // Marcar como aprobada automáticamente para donaciones monetarias
        await prisma.PedidoDonacion.update({
          where: { id_pedido: pedidoReciente.id_pedido },
          data: {
            estado_evaluacion: 'aprobada',
            fecha_evaluacion: new Date(),
            puntos_otorgados: pedidoReciente.cantidad * pedidoReciente.tipoDonacion.puntos
          }
        });

        // Actualizar puntos del donador y la ONG
        const puntosGanados = pedidoReciente.cantidad * pedidoReciente.tipoDonacion.puntos;
        
        // Donador
        await prisma.DetalleUsuario.upsert({
          where: { id_usuario: pedidoReciente.id_usuario },
          update: {
            puntosActuales: { increment: puntosGanados },
            ultima_fecha_actualizacion: new Date()
          },
          create: {
            id_usuario: pedidoReciente.id_usuario,
            puntosActuales: puntosGanados,
            ultima_fecha_actualizacion: new Date()
          }
        });

        // ONG receptora
        const ongReceptora = pedidoReciente.publicacionEtiqueta.publicacion.usuario;
        await prisma.DetalleUsuario.upsert({
          where: { id_usuario: ongReceptora.id_usuario },
          update: {
            puntosActuales: { increment: puntosGanados },
            ultima_fecha_actualizacion: new Date()
          },
          create: {
            id_usuario: ongReceptora.id_usuario,
            puntosActuales: puntosGanados,
            ultima_fecha_actualizacion: new Date()
          }
        });

        console.log(`✅ Puntos otorgados automáticamente: Donador=${pedidoReciente.id_usuario} (+${puntosGanados}), ONG=${ongReceptora.id_usuario} (+${puntosGanados})`);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando callback de MP:', error);
    res.status(500).json({ error: 'Error procesando callback' });
  }
});

export default router;

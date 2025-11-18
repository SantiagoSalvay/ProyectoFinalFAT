
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { emailService } from '../../lib/email-service.js';
import { passwordResetService } from '../../lib/password-reset-service.js';
import { searchONGByCUIT } from '../../lib/sisa-csv-service.js';
import { authenticateToken } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SISA_CSV_PATH = path.join(__dirname, '../../data/listado_sisa.csv');
import { 
  authLimiter, 
  registerLimiter, 
  passwordResetLimiter,
  strictLimiter 
} from '../middleware/rateLimiter.js';
import { 
  validateRequired, 
  validateEmail, 
  validateLength,
  validateIdParam 
} from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/smtp-health', async (req, res) => {
  try {
    await emailService.verifyTransporter();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
  }
});

// Resumen del dashboard para el usuario autenticado
router.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Donaciones del usuario (PedidoDonacion.id_usuario)
    const donaciones = await prisma.PedidoDonacion.findMany({
      where: { id_usuario: userId },
      select: {
        id_pedido: true,
        fecha_donacion: true,
        cantidad: true,
      },
      orderBy: { fecha_donacion: 'desc' },
      take: 10,
    });

    const donationsCount = await prisma.PedidoDonacion.count({ where: { id_usuario: userId } });
    const totalDonated = await prisma.PedidoDonacion.aggregate({
      _sum: { cantidad: true },
      where: { id_usuario: userId },
    });

    // Puntos actuales: suma de Ranking.puntos del usuario
    const puntosAgg = await prisma.Ranking.aggregate({
      _sum: { puntos: true },
      where: { id_usuario: userId },
    });
    const puntos = puntosAgg._sum.puntos || 0;

    // Actividad reciente: últimas donaciones y últimas respuestas de foro del usuario
    const respuestas = await prisma.RespuestaPublicacion.findMany({
      where: { id_usuario: userId },
      select: { id_respuesta: true, mensaje: true, fecha_respuesta: true, id_publicacion: true },
      orderBy: { fecha_respuesta: 'desc' },
      take: 10,
    });

    // Unificar actividad (tomar 5 últimos eventos combinados)
    const recentActivity = [
      ...donaciones.map(d => ({
        type: 'donation',
        id: `don-${d.id_pedido}`,
        date: d.fecha_donacion,
        amount: d.cantidad,
      })),
      ...respuestas.map(r => ({
        type: 'forum-reply',
        id: `rep-${r.id_respuesta}`,
        date: r.fecha_respuesta,
        message: r.mensaje,
        postId: r.id_publicacion,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    res.json({
      donationsCount,
      totalDonated: totalDonated._sum.cantidad || 0,
      puntos,
      recentActivity,
    });
  } catch (error) {
    console.error('Error en dashboard/summary:', error);
    res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
  }
});

// Historial de donaciones realizadas por el usuario autenticado
router.get('/donaciones/realizadas', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Busca las donaciones realizadas por el usuario
    const donaciones = await prisma.PedidoDonacion.findMany({
      where: { id_usuario: userId },
      include: {
        publicacionEtiqueta: {
          include: {
            publicacion: {
              include: {
                usuario: {
                  select: { nombre: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { fecha_donacion: 'desc' }
    });

    // Formatea la respuesta
    const result = donaciones.map(d => ({
      id: d.id_pedido,
      amount: d.cantidad,
      date: d.fecha_donacion,
      recipient: {
        name: d.publicacionEtiqueta?.publicacion?.usuario?.nombre || d.publicacionEtiqueta?.publicacion?.usuario?.usuario || '',
        organization: d.publicacionEtiqueta?.publicacion?.usuario?.usuario || undefined
      },
      message: d.descripcion_voluntariado || ''
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener donaciones realizadas:', error);
    res.status(500).json({ error: 'Error al obtener donaciones realizadas' });
  }
});

// Obtener datos de tipoONG, grupo_social y necesidades
router.get('/profile/tipoong', authenticateToken, async (req, res) => {
  try {
    // Buscar el registro TipoONG vinculado al usuario
  const tipoOng = await prisma.TipoONG.findFirst({
      where: { id_usuario: req.userId },
      select: {
        grupo_social: true,
        necesidad: true
      }
    });
    if (!tipoOng) {
      return res.json({ grupo_social: null, necesidad: null });
    }
    res.json(tipoOng);
  } catch (error) {
    console.error('Error al obtener tipoONG:', error);
    res.status(500).json({ error: 'Error al obtener tipoONG' });
  }
});

// Obtener datos de tipoONG por ID de usuario específico
router.get('/profile/tipoong/:id', 
  authenticateToken,
  validateIdParam('id'),
  async (req, res) => {
  try {
    const { id } = req.params;

    const tipoOng = await prisma.TipoONG.findFirst({
      where: { id_usuario: id }
    });

    res.json({ tipoONG: tipoOng });
  } catch (error) {
    console.error('Error al obtener tipoONG por ID:', error);
    res.status(500).json({ error: 'Error al obtener tipoONG' });
  }
});

// Guardar datos de tipoONG, grupo_social y necesidades
router.post('/profile/tipoong', authenticateToken, async (req, res) => {
  try {
    const { grupo_social, necesidad } = req.body;
    // Buscar si ya existe registro TipoONG para el usuario
  const existing = await prisma.TipoONG.findFirst({ where: { id_usuario: req.userId } });
    let tipoOng;
    if (existing) {
  tipoOng = await prisma.TipoONG.update({
        where: { id_tipo_ong: existing.id_tipo_ong },
        data: { grupo_social, necesidad }
      });
    } else {
  tipoOng = await prisma.TipoONG.create({
        data: { grupo_social, necesidad, id_usuario: req.userId }
      });
    }
    res.json({ message: 'Datos guardados exitosamente', grupo_social: tipoOng.grupo_social, necesidad: tipoOng.necesidad });
  } catch (error) {
    console.error('Error al guardar tipoONG:', error);
    res.status(500).json({ error: 'Error al guardar tipoONG' });
  }
});

// Obtener todos los usuarios tipo 2 (ONGs)
router.get('/ongs', async (req, res) => {
  try {
    const ongs = await prisma.Usuario.findMany({
      where: { id_tipo_usuario: 2 },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        ubicacion: true,
        DetalleUsuario: {
          select: {
            puntosActuales: true
          }
        }
      }
    });
    
    // Mapear los datos para incluir puntos y mantener compatibilidad
    const ongsWithPoints = ongs.map(ong => ({
      id: ong.id_usuario,
      name: ong.nombre,
      email: ong.email,
      location: ong.ubicacion || 'Sin ubicación',
      puntos: ong.DetalleUsuario?.puntosActuales || 0
    }));
    
    res.json({ ongs: ongsWithPoints });
  } catch (error) {
    console.error('Error al obtener ONGs:', error);
    res.status(500).json({ error: 'Error al obtener ONGs' });
  }
});

// Registro de usuario (ahora con verificación de email)
router.post('/register', 
  registerLimiter,
  validateRequired(['nombre', 'correo', 'contrasena', 'tipo_usuario']),
  validateEmail('correo'),
  validateLength('contrasena', 8, 100),
  async (req, res) => {
  try {
    console.log('Datos recibidos para registro:', req.body);

  const { nombre, apellido, correo, contrasena, usuario, ubicacion, coordenadas, tipo_usuario, cuit, matricula, tipoOrganizacion } = req.body;
  
  console.log('Campos extraídos:', {
    nombre: nombre ? 'presente' : 'faltante',
    apellido: apellido ? 'presente' : 'faltante',
    correo: correo ? 'presente' : 'faltante',
    contrasena: contrasena ? 'presente' : 'faltante',
    usuario: usuario ? 'presente' : 'faltante',
    ubicacion: ubicacion ? 'presente' : 'faltante',
    tipo_usuario: tipo_usuario ? 'presente' : 'faltante',
    cuit: cuit ? 'presente' : 'faltante',
    tipoOrganizacion: tipoOrganizacion ? 'presente' : 'faltante'
  });
  
  console.log('Valores específicos:', {
    nombre: nombre,
    apellido: apellido,
    usuario: usuario,
    tipo_usuario: tipo_usuario,
    isONG: parseInt(tipo_usuario) === 2,
    cuit: cuit
  });

    // Validar que todos los campos requeridos estén presentes
    // Para ONGs (id_tipo_usuario = 2), el apellido puede estar vacío
    const isONG = parseInt(tipo_usuario) === 2;
    if (!nombre || (!apellido && !isONG) || !correo || !contrasena || !tipo_usuario) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // VERIFICACIÓN DE ONGs (Solo SISA)
    if (isONG) {
      console.log('🏢 [REGISTRO-ONG] Iniciando verificación de ONG en SISA');
      
      // Validar que tenga CUIT
      if (!cuit) {
        return res.status(400).json({
          error: 'Las ONGs deben proporcionar CUIT para verificación'
        });
      }

      let verificacionExitosa = false;
      let datosVerificacion = null;

      // ========================================
      // VERIFICAR EN SISA (CSV)
      // ========================================
      try {
        console.log('🔍 [REGISTRO-SISA] Buscando en registro SISA (CSV)...');
        
        const sisaResult = await searchONGByCUIT(cuit, SISA_CSV_PATH);

        if (sisaResult) {
          console.log('✅ [REGISTRO-SISA] ONG encontrada en SISA:', sisaResult.nombre);
          console.log('📋 [REGISTRO-SISA] Datos:', sisaResult);
          
          verificacionExitosa = true;
          datosVerificacion = sisaResult;
        } else {
          console.log('❌ [REGISTRO-SISA] ONG no encontrada en SISA');
        }
      } catch (sisaError) {
        console.error('❌ [REGISTRO-SISA] Error al buscar en SISA:', sisaError);
      }

      // ========================================
      // RESULTADO FINAL
      // ========================================
      if (verificacionExitosa) {
        console.log('✅ [REGISTRO-ONG] ONG verificada exitosamente en SISA');
        console.log('📊 [REGISTRO-ONG] Datos de verificación:', datosVerificacion);
      } else {
        console.log('❌ [REGISTRO-ONG] ONG no encontrada en SISA');
        
        // Crear solicitud de revisión manual
        try {
          const solicitud = await prisma.solicitudRevisionIPJ.create({
            data: {
              email: correo,
              nombre: nombre,
              nombre_legal: apellido || nombre,
              cuit: cuit,
              matricula: null,
              tipo_organizacion: 'no_especificado',
              ubicacion: ubicacion || '',
              razon: 'ONG no encontrada en el registro SISA de Córdoba',
              estado: 'pendiente'
            }
          });

          console.log('📝 [REGISTRO-ONG] Solicitud de revisión manual creada:', solicitud.id);
          
          return res.status(404).json({
            error: 'ONG_NOT_FOUND',
            message: 'La organización no fue encontrada en el registro SISA de Córdoba. Se ha enviado una solicitud de revisión manual a nuestro equipo de soporte.',
            requiresManualReview: true,
            solicitudId: solicitud.id
          });
        } catch (solicitudError) {
          console.error('❌ [REGISTRO-ONG] Error al crear solicitud de revisión:', solicitudError);
          
          return res.status(404).json({
            error: 'ONG_NOT_FOUND',
            message: 'La organización no fue encontrada en el registro SISA. Por favor, contacta a soporte para verificación manual.',
            requiresManualReview: true
          });
        }
      }
    }
    
    // Asignar un valor por defecto a usuario si no viene (para compatibilidad con RegistroPendiente)
    const usuarioValue = usuario || correo.split('@')[0];

    // Verificar si el usuario ya existe (solo por email)
    const existingUser = await prisma.Usuario.findFirst({
      where: { 
        email: correo
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'El correo ya está registrado'
      });
    }

    // Verificar si ya hay un registro pendiente con este correo
    const existingPendingRegistration = await prisma.RegistroPendiente.findFirst({
      where: { correo }
    });

    if (existingPendingRegistration) {
      console.log('🔄 [REGISTRO] Eliminando registro pendiente anterior para:', correo);
      // Eliminar el registro pendiente anterior
      try {
        await prisma.RegistroPendiente.delete({
          where: { id: existingPendingRegistration.id }
        });
        console.log('✅ [REGISTRO] Registro pendiente anterior eliminado');
      } catch (deleteError) {
        console.error('❌ [REGISTRO] Error al eliminar registro pendiente anterior:', deleteError);
        // Continuar de todas formas
      }
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Generar token de verificación
    const verificationToken = uuidv4();
    // Token no expira hasta que sea usado (365 días como medida de seguridad)
    const tokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 días
    
    console.log('🔑 [REGISTRO] Generando registro con token:', {
      token: verificationToken,
      correo: correo,
      nota: 'Token válido hasta que sea usado'
    });

    // Verificar que el tipo_usuario existe, si no, usar uno por defecto
    let tipoUsuarioFinal = parseInt(tipo_usuario, 10);
    
    const tipoUsuarioExiste = await prisma.TipoUsuario.findUnique({
      where: { id_tipo_usuario: tipoUsuarioFinal }
    });
    
    if (!tipoUsuarioExiste) {
      console.log('⚠️ [REGISTRO] Tipo de usuario no existe:', tipoUsuarioFinal);
      
      // Buscar el primer tipo de usuario disponible
      let tipoUsuarioDefault = await prisma.TipoUsuario.findFirst();
      
      if (!tipoUsuarioDefault) {
        console.log('📝 [REGISTRO] No hay tipos de usuario, creando uno por defecto...');
        
        // Crear un tipo de usuario por defecto
        tipoUsuarioDefault = await prisma.TipoUsuario.create({
          data: {
            tipo_usuario: 'Usuario Regular'
          }
        });
        console.log('✅ [REGISTRO] Tipo de usuario por defecto creado:', tipoUsuarioDefault);
      }
      
      tipoUsuarioFinal = tipoUsuarioDefault.id_tipo_usuario;
      console.log('🔄 [REGISTRO] Usando tipo de usuario:', tipoUsuarioFinal);
    }
    
    // Guardar datos del registro pendiente
    let nuevoRegistro;
    try {
      nuevoRegistro = await prisma.RegistroPendiente.create({
        data: {
          nombre,
          apellido,
          usuario: usuarioValue,
          correo,
          contrasena: hashedPassword,
          ubicacion: ubicacion || "",
          coordenadas: coordenadas ? JSON.stringify(coordenadas) : null,
          tipo_usuario: tipoUsuarioFinal,
          verification_token: verificationToken,
          token_expiry: tokenExpiry
        }
      });
    } catch (createError) {
      console.error('❌ [REGISTRO] Error al crear registro pendiente:', createError);
      
      // Si es un error de correo duplicado, intentar limpiar y recrear
      if (createError.code === 'P2002' && createError.meta?.target?.includes('correo')) {
        console.log('🔄 [REGISTRO] Intentando limpiar registros duplicados...');
        
        try {
          // Eliminar todos los registros pendientes con este correo
          await prisma.RegistroPendiente.deleteMany({
            where: { correo }
          });
          
          // Intentar crear nuevamente
          nuevoRegistro = await prisma.RegistroPendiente.create({
            data: {
              nombre,
              apellido,
              usuario: usuarioValue,
              correo,
              contrasena: hashedPassword,
              ubicacion: ubicacion || "",
              coordenadas: coordenadas ? JSON.stringify(coordenadas) : null,
              tipo_usuario: tipoUsuarioFinal,
              verification_token: verificationToken,
              token_expiry: tokenExpiry
            }
          });
          console.log('✅ [REGISTRO] Registro recreado exitosamente después de limpieza');
        } catch (retryError) {
          console.error('❌ [REGISTRO] Error en segundo intento:', retryError);
          return res.status(500).json({ 
            error: 'Error al procesar el registro. Por favor, intenta nuevamente.' 
          });
        }
      } else {
        return res.status(500).json({ 
          error: 'Error interno del servidor: ' + createError.message 
        });
      }
    }

    console.log('✅ [REGISTRO] Registro pendiente creado:', {
      id: nuevoRegistro.id,
      correo: nuevoRegistro.correo,
      token: nuevoRegistro.verification_token,
      tokenGuardado: nuevoRegistro.verification_token === verificationToken
    });

    // Enviar email de verificación
    try {
      await emailService.sendVerificationEmail(correo, verificationToken);
      
      const successResponse = {
        message: 'Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.',
        requiresVerification: true
      };
      
      res.status(200).json(successResponse);
    } catch (emailError) {
      console.error('Error al enviar email de verificación:', emailError);
      
      // Eliminar el registro pendiente si no se pudo enviar el email
      await prisma.RegistroPendiente.delete({
        where: { verification_token: verificationToken }
      });
      
      res.status(500).json({ 
        error: 'Error al enviar el correo de verificación. Por favor, intenta nuevamente.' 
      });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Login de usuario
router.post('/login', 
  authLimiter,
  validateRequired(['correo', 'contrasena']),
  validateEmail('correo'),
  async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario por correo
    const user = await prisma.Usuario.findFirst({
      where: { email: correo },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        contrasena: true,
        ubicacion: true,
        id_tipo_usuario: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está baneado (Infracciones activas de tipo 'Ban')
    const banType = await prisma.tipoInfraccion.upsert({
      where: { id_tipo_infraccion: 9999 },
      update: {},
      create: { id_tipo_infraccion: 9999, tipo_infraccion: 'Ban', severidad: 'Crítica' }
    });
    const activeBan = await prisma.infracciones.findFirst({
      where: {
        id_usuario: user.id_usuario,
        id_tipo_infraccion: banType.id_tipo_infraccion,
        OR: [
          { fecha_expiracion: null },
          { fecha_expiracion: { gt: new Date() } }
        ]
      }
    });
    if (activeBan) {
      const isPermanent = activeBan.fecha_expiracion === null;
      const message = isPermanent 
        ? 'Tu cuenta ha sido baneada permanentemente por los administradores. No puedes acceder a la plataforma.'
        : `Tu cuenta está suspendida hasta el ${new Date(activeBan.fecha_expiracion).toLocaleDateString('es-AR')}. Razón: ${activeBan.contenido || 'Violación de normas de la comunidad'}.`;
      
      return res.status(403).json({
        error: message,
        userBanned: true,
        reason: activeBan.contenido || 'Ban administrativo',
        permanent: isPermanent,
        bannedUntil: activeBan.fecha_expiracion
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id_usuario, email: user.email, tipo_usuario: user.id_tipo_usuario },
      process.env.JWT_SECRET || 'tu-secreto-jwt',
      { expiresIn: '7d' }
    );

    // Omitir contraseña de la respuesta y mapear id_tipo_usuario a tipo_usuario
    const { contrasena: _, id_tipo_usuario, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      tipo_usuario: id_tipo_usuario
    };

    // Enviar email de notificación de inicio de sesión
    try {
      console.log('📧 [LOGIN] Enviando email de notificación de login...');
      
      // Obtener información del cliente
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Desconocida';
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const currentDateTime = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const loginInfo = {
        dateTime: currentDateTime,
        ipAddress: ipAddress,
        userAgent: userAgent,
        location: 'Argentina' // Podrías integrar con una API de geolocalización
      };

      await emailService.sendLoginNotificationEmail(user.email, user.nombre, loginInfo);
      console.log('✅ [LOGIN] Email de notificación de login enviado exitosamente');
    } catch (emailError) {
      console.error('⚠️ [LOGIN] Error al enviar email de notificación de login (no crítico):', emailError);
      // No fallar el login si el email falla
    }

    res.json({
      message: 'Login exitoso',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error detallado en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: req.userId },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        biografia: true,
        id_tipo_usuario: true,
        createdAt: true
      }
    });

    console.log('Datos del usuario encontrados:', user);
    console.log('🔍 [DEBUG] Campo createdAt del servidor:', user?.createdAt);
    console.log('🔍 [DEBUG] Tipo de createdAt del servidor:', typeof user?.createdAt);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si es persona y no tiene ubicación, incluir advertencia
    let warnings = [];
    if (user.id_tipo_usuario === 1 && (!user.ubicacion || user.ubicacion === '')) {
      warnings.push({
        type: 'warning',
        title: 'Completa tu ubicación',
        message: 'No tienes una ubicación registrada. Haz clic en "Acceder" para completar tu perfil.',
        link: '/profile'
      });
    }

    res.json({ user, warnings });
  } catch (error) {
    console.error('Error detallado al obtener perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Solicitar reset de contraseña
router.post('/request-password-reset', 
  passwordResetLimiter,
  validateRequired(['correo']),
  validateEmail('correo'),
  async (req, res) => {
  try {
    const { correo } = req.body;

    console.log('🔍 [RESET REQUEST] Solicitud de reset para:', correo);

    // Verificar si el usuario existe
    const user = await prisma.Usuario.findFirst({
      where: { email: correo }
    });

    if (!user) {
      // Por seguridad, no revelamos si el correo existe o no
      console.log('⚠️ [RESET REQUEST] Usuario no encontrado');
      return res.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
    }

    // Invalidar tokens anteriores del usuario
    await prisma.PasswordResetToken.updateMany({
      where: { 
        id_usuario: user.id_usuario,
        used: false
      },
      data: { used: true }
    });

    // Generar nuevo token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

    console.log('🔑 [RESET REQUEST] Nuevo token generado:', resetToken);
    console.log('⏰ [RESET REQUEST] Token expira:', resetTokenExpiry);

    // Guardar token en la base de datos
    await prisma.PasswordResetToken.create({
      data: {
        id_usuario: user.id_usuario,
        token: resetToken,
        expiry: resetTokenExpiry
      }
    });

    // Enviar email usando el servicio
    try {
      console.log('📧 [RESET REQUEST] Enviando email de recuperación...');
      await passwordResetService.sendPasswordResetEmail(correo, resetToken);
      console.log('✅ [RESET REQUEST] Email de recuperación enviado exitosamente');
    } catch (emailError) {
      console.error('❌ [RESET REQUEST] Error al enviar email:', emailError);
      // No retornamos error para no revelar si el email existe
    }

    res.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error('❌ [RESET REQUEST] Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Resetear contraseña con token
router.post('/reset-password/:token', 
  strictLimiter,
  validateRequired(['nuevaContrasena']),
  validateLength('nuevaContrasena', 8, 100),
  async (req, res) => {
  try {
    const { token } = req.params;
    const { nuevaContrasena } = req.body;

    console.log('🔍 [RESET PASSWORD] Iniciando reset de contraseña...');
    console.log('🔍 [RESET PASSWORD] Token recibido:', token);
    console.log('🔍 [RESET PASSWORD] Nueva contraseña recibida:', nuevaContrasena ? 'SÍ' : 'NO');

    // Buscar token válido en la tabla PasswordResetToken
    const resetToken = await prisma.PasswordResetToken.findUnique({
      where: { token },
      include: { Usuario: true }
    });

    if (!resetToken) {
      console.log('❌ [RESET PASSWORD] Token no encontrado');
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Verificar si el token ya fue usado
    if (resetToken.used) {
      console.log('❌ [RESET PASSWORD] Token ya fue usado');
      return res.status(400).json({ error: 'Este token ya fue utilizado' });
    }

    // Verificar si el token expiró
    if (new Date() > resetToken.expiry) {
      console.log('❌ [RESET PASSWORD] Token expirado');
      return res.status(400).json({ error: 'El token ha expirado. Solicita un nuevo enlace de recuperación.' });
    }

    console.log('✅ [RESET PASSWORD] Token válido para usuario:', resetToken.usuario.email);

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar contraseña del usuario
    await prisma.Usuario.update({
      where: { id_usuario: resetToken.id_usuario },
      data: { contrasena: hashedPassword }
    });

    // Marcar el token como usado
    await prisma.PasswordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    console.log('✅ [RESET PASSWORD] Contraseña actualizada exitosamente');

    // Enviar email de notificación de cambio de contraseña
    try {
      console.log('📧 [RESET PASSWORD] Enviando email de notificación...');

      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Desconocida';
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const currentDateTime = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const changeInfo = {
        dateTime: currentDateTime,
        ipAddress: ipAddress,
        userAgent: userAgent
      };

      await emailService.sendPasswordChangeNotificationEmail(resetToken.usuario.email, resetToken.usuario.nombre, changeInfo);
      console.log('✅ [RESET PASSWORD] Email de notificación enviado');
    } catch (emailError) {
      console.error('⚠️ [RESET PASSWORD] Error al enviar email (no crítico):', emailError);
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('❌ [RESET PASSWORD] Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar email y completar registro
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('🔍 [VERIFICACIÓN] Iniciando verificación con token:', token);
    console.log('🔍 [VERIFICACIÓN] Longitud del token:', token ? token.length : 0);
    console.log('🔍 [VERIFICACIÓN] Formato del token:', token ? (token.includes('-') ? 'UUID' : 'OTRO') : 'VACÍO');

    if (!token) {
      console.log('❌ [VERIFICACIÓN] Token no proporcionado');
      return res.status(400).json({ error: 'Token de verificación requerido' });
    }

    // Primero, verificar cuántos registros hay en total
    const totalRegistros = await prisma.RegistroPendiente.count();
    console.log('📊 [VERIFICACIÓN] Total de registros pendientes:', totalRegistros);
    
    // Buscar si el token existe (sin importar fecha de expiración)
    const pendingRegistration = await prisma.RegistroPendiente.findFirst({
      where: {
        verification_token: token
      }
    });
    
    if (pendingRegistration) {
      console.log('✅ [VERIFICACIÓN] Token encontrado en BD:', {
        id: pendingRegistration.id,
        correo: pendingRegistration.correo,
        usuario: pendingRegistration.usuario,
        tokenEncontrado: pendingRegistration.verification_token,
        tokenBuscado: token,
        tokensCoinciden: pendingRegistration.verification_token === token
      });
    } else {
      console.log('❌ [VERIFICACIÓN] Token NO existe en la base de datos');
      console.log('❌ [VERIFICACIÓN] Token buscado:', token);
      
      // Verificar si el usuario ya fue registrado previamente con este token
      // El campo verification_token solo existe en RegistroPendiente, no en Usuario
      // Si quieres verificar si el token ya fue usado, deberías buscar en RegistroPendiente o cambiar la lógica
      // Aquí simplemente buscamos si existe un registro pendiente con ese token
      const registroPendiente = await prisma.RegistroPendiente.findFirst({
        where: {
          verification_token: token
        }
      });
      // Si no existe en RegistroPendiente, asumimos que ya fue usado o es inválido
      if (!registroPendiente) {
        console.log('⚠️ [VERIFICACIÓN] Este token ya fue usado o es inválido.');
        return res.status(400).json({ 
          error: 'El token ya fue usado o es inválido.'
        });
      }
      
      // Mostrar los últimos 5 tokens para debugging
      const ultimosRegistros = await prisma.RegistroPendiente.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          correo: true,
          verification_token: true,
          createdAt: true
        }
      });
      
      console.log('📋 [VERIFICACIÓN] Últimos 5 registros pendientes:', ultimosRegistros);
      
      // Mostrar comparación detallada de tokens
      console.log('🔍 [VERIFICACIÓN] Comparación de tokens:');
      ultimosRegistros.forEach((reg, index) => {
        const coincidencia = reg.verification_token === token;
        console.log(`   ${index + 1}. Token: ${reg.verification_token} - Coincide: ${coincidencia ? '✅' : '❌'}`);
      });
    }
    
    // Si no encontramos el registro pendiente, ya retornamos error
    if (!pendingRegistration) {
      // El error ya se maneja arriba cuando verificamos si existe
      return res.status(400).json({ 
        error: 'Token de verificación inválido. Por favor, verifica que el enlace sea correcto.' 
      });
    }

    console.log('✅ [VERIFICACIÓN] Registro pendiente encontrado:', {
      id: pendingRegistration.id,
      correo: pendingRegistration.correo,
      usuario: pendingRegistration.usuario
    });

    // Verificar nuevamente que no exista un usuario con este correo
    console.log('🔍 [VERIFICACIÓN] Verificando si el usuario ya existe...');
    const existingUser = await prisma.Usuario.findFirst({
      where: { 
        email: pendingRegistration.correo
      }
    });

    if (existingUser) {
      console.log('⚠️ [VERIFICACIÓN] Usuario ya existe, eliminando registro pendiente...');
      // Eliminar el registro pendiente ya que el usuario ya existe
      await prisma.RegistroPendiente.delete({
        where: { id: pendingRegistration.id }
      });
      
      return res.status(400).json({ 
        error: 'Este correo ya está registrado. Puedes iniciar sesión.' 
      });
    }

    console.log('✅ [VERIFICACIÓN] Usuario no existe, procediendo con el registro...');

    // Usar el tipo_usuario guardado en RegistroPendiente
    let tipoUsuarioId = pendingRegistration.tipo_usuario;
    console.log('👤 [VERIFICACIÓN] Verificando tipo_usuario:', tipoUsuarioId);
    
    // Verificar que el tipo_usuario existe en la tabla TipoUsuario
    const tipoUsuarioExiste = await prisma.TipoUsuario.findUnique({
      where: { id_tipo_usuario: tipoUsuarioId }
    });
    
    if (!tipoUsuarioExiste) {
      console.log('❌ [VERIFICACIÓN] Tipo de usuario no existe:', tipoUsuarioId);
      
      // Buscar o crear un tipo de usuario por defecto
      let tipoUsuarioDefault = await prisma.TipoUsuario.findFirst();
      
      if (!tipoUsuarioDefault) {
        console.log('📝 [VERIFICACIÓN] No hay tipos de usuario, creando uno por defecto...');
        
        // Crear un tipo de usuario por defecto
        tipoUsuarioDefault = await prisma.TipoUsuario.create({
          data: {
            tipo_usuario: 'Usuario Regular'
          }
        });
        console.log('✅ [VERIFICACIÓN] Tipo de usuario por defecto creado:', tipoUsuarioDefault);
      }
      
      console.log('🔄 [VERIFICACIÓN] Usando tipo de usuario por defecto:', tipoUsuarioDefault.tipo_usuario);
      tipoUsuarioId = tipoUsuarioDefault.tipo_usuario;
    }
    
    console.log('👤 [VERIFICACIÓN] Creando usuario definitivo con tipo_usuario:', tipoUsuarioId);
    const newUser = await prisma.Usuario.create({
      data: {
        nombre: pendingRegistration.nombre,
        apellido: pendingRegistration.apellido,
        email: pendingRegistration.correo,
        contrasena: pendingRegistration.contrasena,
        id_tipo_usuario: tipoUsuarioId,
        ubicacion: pendingRegistration.ubicacion,
        coordenadas: pendingRegistration.coordenadas,
        DetalleUsuario: {
          create: {
            email_verified: true
          }
        }
      }
    });

    // Eliminar el registro pendiente
    console.log('🧹 [VERIFICACIÓN] Eliminando registro pendiente...');
    await prisma.RegistroPendiente.delete({
      where: { id: pendingRegistration.id }
    });

    console.log('✅ [VERIFICACIÓN] Usuario verificado y registrado exitosamente:', {
      id: newUser.id_usuario,
      email: newUser.email,
      nombre: newUser.nombre
    });

    // Enviar email de bienvenida solo para usuarios registrados por formulario (auth_provider = "email")
    try {
      console.log('📧 [VERIFICACIÓN] Enviando email de bienvenida...');
      await emailService.sendWelcomeEmail(newUser.email, newUser.nombre);
      console.log('✅ [VERIFICACIÓN] Email de bienvenida enviado exitosamente');
    } catch (emailError) {
      console.error('⚠️ [VERIFICACIÓN] Error al enviar email de bienvenida (no crítico):', emailError);
      // No fallar la verificación si el email de bienvenida falla
    }

    // Generar token JWT para login automático
    const authToken = jwt.sign(
      { userId: newUser.id_usuario, email: newUser.email, tipo_usuario: newUser.id_tipo_usuario },
      process.env.JWT_SECRET || 'tu-secreto-jwt',
      { expiresIn: '7d' }
    );

    // Omitir contraseña de la respuesta y mapear id_tipo_usuario a tipo_usuario
    const { contrasena: _, id_tipo_usuario, ...userWithoutPassword } = newUser;
    const userResponse = {
      ...userWithoutPassword,
      tipo_usuario: id_tipo_usuario
    };

    const successResponse = {
      message: '¡Email verificado exitosamente! Tu cuenta ha sido activada.',
      user: userResponse,
      token: authToken,
      verified: true
    };

    console.log('🚀 [VERIFICACIÓN] Enviando respuesta exitosa:', {
      message: successResponse.message,
      verified: successResponse.verified,
      usuario: userResponse.nombre,
      tokenLength: authToken.length
    });

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('💥 [VERIFICACIÓN] Error al verificar email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reenviar email de verificación
router.post('/resend-verification', async (req, res) => {
  try {
    const { correo } = req.body;
    console.log('📧 [REENVÍO] Solicitud de reenvío de verificación para:', correo);

    if (!correo) {
      return res.status(400).json({ error: 'El correo es requerido' });
    }

    // Buscar registro pendiente
    const pendingRegistration = await prisma.RegistroPendiente.findFirst({
      where: { correo }
    });

    if (!pendingRegistration) {
      // Verificar si el usuario ya está registrado
      const existingUser = await prisma.Usuario.findFirst({
        where: { email: correo }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Este correo ya está verificado. Puedes iniciar sesión.' 
        });
      }

      return res.status(404).json({ 
        error: 'No se encontró ningún registro pendiente para este correo.' 
      });
    }

    // Generar nuevo token de verificación
    const newVerificationToken = uuidv4();
    const newTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 días

    // Actualizar el registro pendiente con el nuevo token
    await prisma.RegistroPendiente.update({
      where: { id: pendingRegistration.id },
      data: {
        verification_token: newVerificationToken,
        token_expiry: newTokenExpiry
      }
    });

    console.log('🔄 [REENVÍO] Token actualizado para:', correo);

    // Reenviar email de verificación
    try {
      await emailService.sendVerificationEmail(correo, newVerificationToken);
      console.log('✅ [REENVÍO] Email de verificación reenviado exitosamente');
      
      res.status(200).json({
        message: 'Se ha reenviado el correo de verificación. Por favor, revisa tu bandeja de entrada.',
        success: true
      });
    } catch (emailError) {
      console.error('❌ [REENVÍO] Error al reenviar email:', emailError);
      res.status(500).json({ 
        error: 'Error al enviar el correo de verificación. Por favor, intenta nuevamente más tarde.' 
      });
    }
  } catch (error) {
    console.error('💥 [REENVÍO] Error al procesar reenvío:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nombre, apellido, ubicacion, bio, redes_sociales, telefono } = req.body;

    // Filtrar campos undefined para evitar errores
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
    if (bio !== undefined) updateData.biografia = bio;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (redes_sociales !== undefined) {
      // Guardar como JSON string
      updateData.redes_sociales = typeof redes_sociales === 'string' 
        ? redes_sociales 
        : JSON.stringify(redes_sociales);
      console.log('🌐 Redes sociales recibidas:', redes_sociales);
      console.log('🌐 Redes sociales a guardar:', updateData.redes_sociales);
    }

    console.log('Datos a actualizar:', updateData);

    const user = await prisma.Usuario.update({
      where: { id_usuario: req.userId },
      data: updateData,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        biografia: true,
        redes_sociales: true,
        telefono: true,
        id_tipo_usuario: true,
        createdAt: true
      }
    });

    // Mapear id_tipo_usuario a tipo_usuario para compatibilidad con frontend
    const userResponse = {
      ...user,
      tipo_usuario: user.id_tipo_usuario
    };
    delete userResponse.id_tipo_usuario;

    res.json({ message: 'Perfil actualizado exitosamente', user: userResponse });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// Ruta para obtener información del usuario autenticado (GET /me)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.userId },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        biografia: true,
        telefono: true,
        redes_sociales: true,
        id_tipo_usuario: true,
        createdAt: true,
        DetalleUsuario: {
          select: {
            auth_provider: true,
            profile_picture: true,
            email_verified: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ [AUTH/ME] Usuario no encontrado con ID:', req.userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Aplanar la estructura para mantener compatibilidad con el frontend
    console.log('🔍 [AUTH/ME] Redes sociales en BD:', user.redes_sociales);
    
    const userResponse = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      ubicacion: user.ubicacion,
      biografia: user.biografia,
      telefono: user.telefono,
      redes_sociales: user.redes_sociales,
      createdAt: user.createdAt,
      tipo_usuario: user.id_tipo_usuario,
      auth_provider: user.DetalleUsuario?.auth_provider || 'email',
      profile_picture: user.DetalleUsuario?.profile_picture || null,
      email_verified: user.DetalleUsuario?.email_verified || false
    };
    
    console.log('📤 [AUTH/ME] Redes sociales enviadas:', userResponse.redes_sociales);

    // Si es persona y no tiene ubicación, incluir advertencia
    let warnings = [];
    if (user.id_tipo_usuario === 1 && (!user.ubicacion || user.ubicacion === '')) {
      warnings.push({
        type: 'missing_location',
        message: 'Tu perfil de persona no tiene una ubicación definida. Considera agregarla para mejorar tu experiencia.'
      });
    }

    res.json({ user: userResponse, warnings });
  } catch (error) {
    console.error('💥 [AUTH/ME] Error al obtener perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { emailService } from '../../lib/email-service.js';
import { passwordResetService } from '../../lib/password-reset-service.js';

const router = express.Router();
const prisma = new PrismaClient();

// Historial de donaciones realizadas por el usuario autenticado
router.get('/donaciones/realizadas', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const userId = decoded.userId;

    // Busca las donaciones realizadas por el usuario
    const donaciones = await prisma.PedidoDonacion.findMany({
      where: { usuarioId: userId },
      include: {
        destinatario: {
          select: { nombre: true, usuario: true, correo: true }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    // Formatea la respuesta
    const result = donaciones.map(d => ({
      id: d.id,
      amount: d.monto,
      date: d.fecha,
      recipient: {
        name: d.destinatario?.nombre || d.destinatario?.usuario || d.destinatario?.correo || '',
        organization: d.destinatario?.usuario || undefined
      },
      message: d.mensaje || ''
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener donaciones realizadas:', error);
    res.status(500).json({ error: 'Error al obtener donaciones realizadas' });
  }
});

// Obtener datos de tipoONG, grupo_social y necesidades
router.get('/profile/tipoong', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    // Buscar el registro TipoONG vinculado al usuario
  const tipoOng = await prisma.TipoONG.findFirst({
      where: { usuarioId: decoded.userId },
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

// Guardar datos de tipoONG, grupo_social y necesidades
router.post('/profile/tipoong', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const { grupo_social, necesidad } = req.body;
    // Buscar si ya existe registro TipoONG para el usuario
  const existing = await prisma.TipoONG.findFirst({ where: { usuarioId: decoded.userId } });
    let tipoOng;
    if (existing) {
  tipoOng = await prisma.TipoONG.update({
        where: { ID_tipo: existing.ID_tipo },
        data: { grupo_social, necesidad }
      });
    } else {
  tipoOng = await prisma.TipoONG.create({
        data: { grupo_social, necesidad, usuarioId: decoded.userId }
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
    const ongs = await prisma.usuario.findMany({
      where: { tipo_usuario: 2 },
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        ubicacion: true,
        usuario: true
      }
    });
    res.json({ ongs });
  } catch (error) {
    console.error('Error al obtener ONGs:', error);
    res.status(500).json({ error: 'Error al obtener ONGs' });
  }
});

// Registro de usuario (ahora con verificación de email)
router.post('/register', async (req, res) => {
  try {
    console.log('Datos recibidos para registro:', req.body);

  const { nombre, apellido, correo, contrasena, usuario, ubicacion, tipo_usuario } = req.body;
  
  console.log('Campos extraídos:', {
    nombre: nombre ? 'presente' : 'faltante',
    apellido: apellido ? 'presente' : 'faltante',
    correo: correo ? 'presente' : 'faltante',
    contrasena: contrasena ? 'presente' : 'faltante',
    usuario: usuario ? 'presente' : 'faltante',
    ubicacion: ubicacion ? 'presente' : 'faltante',
    tipo_usuario: tipo_usuario ? 'presente' : 'faltante'
  });
  
  console.log('Valores específicos:', {
    nombre: nombre,
    apellido: apellido,
    usuario: usuario,
    tipo_usuario: tipo_usuario,
    isONG: parseInt(tipo_usuario) === 2
  });

    // Validar que todos los campos requeridos estén presentes
    // Para ONGs (tipo_usuario = 2), el apellido puede estar vacío
    const isONG = parseInt(tipo_usuario) === 2;
    if (!nombre || (!apellido && !isONG) || !correo || !contrasena || !usuario || !tipo_usuario) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: { 
        OR: [
          { correo },
          { usuario }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.correo === correo 
          ? 'El correo ya está registrado' 
          : 'El nombre de usuario ya está registrado'
      });
    }

    // Verificar si ya hay un registro pendiente con este correo
    const existingPendingRegistration = await prisma.registroPendiente.findFirst({
      where: { correo }
    });

    if (existingPendingRegistration) {
      console.log('🔄 [REGISTRO] Eliminando registro pendiente anterior para:', correo);
      // Eliminar el registro pendiente anterior
      try {
        await prisma.registroPendiente.delete({
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
    
    const tipoUsuarioExiste = await prisma.tipoUsuario.findUnique({
      where: { tipo_usuario: tipoUsuarioFinal }
    });
    
    if (!tipoUsuarioExiste) {
      console.log('⚠️ [REGISTRO] Tipo de usuario no existe:', tipoUsuarioFinal);
      
      // Buscar el primer tipo de usuario disponible
      let tipoUsuarioDefault = await prisma.tipoUsuario.findFirst();
      
      if (!tipoUsuarioDefault) {
        console.log('📝 [REGISTRO] No hay tipos de usuario, creando uno por defecto...');
        
        // Crear un tipo de usuario por defecto
        tipoUsuarioDefault = await prisma.tipoUsuario.create({
          data: {
            nombre_tipo_usuario: 'Usuario Regular'
          }
        });
        console.log('✅ [REGISTRO] Tipo de usuario por defecto creado:', tipoUsuarioDefault);
      }
      
      tipoUsuarioFinal = tipoUsuarioDefault.tipo_usuario;
      console.log('🔄 [REGISTRO] Usando tipo de usuario:', tipoUsuarioFinal);
    }
    
    // Guardar datos del registro pendiente
    let nuevoRegistro;
    try {
      nuevoRegistro = await prisma.registroPendiente.create({
        data: {
          nombre,
          apellido,
          usuario,
          correo,
          contrasena: hashedPassword,
          ubicacion: ubicacion || "",
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
          await prisma.registroPendiente.deleteMany({
            where: { correo }
          });
          
          // Intentar crear nuevamente
          nuevoRegistro = await prisma.registroPendiente.create({
            data: {
              nombre,
              apellido,
              usuario,
              correo,
              contrasena: hashedPassword,
              ubicacion: ubicacion || "",
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
      await prisma.registroPendiente.delete({
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
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario por correo
    const user = await prisma.usuario.findFirst({
      where: { correo },
      select: {
        id_usuario: true,
        usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        contrasena: true,
        ubicacion: true,
        tipo_usuario: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id_usuario, email: user.correo },
      process.env.JWT_SECRET || 'tu-secreto-jwt',
      { expiresIn: '7d' }
    );

    // Omitir contraseña de la respuesta
    const { contrasena: _, ...userWithoutPassword } = user;

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

      await emailService.sendLoginNotificationEmail(user.correo, user.nombre, loginInfo);
      console.log('✅ [LOGIN] Email de notificación de login enviado exitosamente');
    } catch (emailError) {
      console.error('⚠️ [LOGIN] Error al enviar email de notificación de login (no crítico):', emailError);
      // No fallar el login si el email falla
    }

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error detallado en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    console.log('Token recibido:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    console.log('Token decodificado:', decoded);
    
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        usuario: true,
        correo: true,
        ubicacion: true,
        tipo_usuario: true,
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
    if (user.tipo_usuario === 1 && (!user.ubicacion || user.ubicacion === '')) {
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
router.post('/request-password-reset', async (req, res) => {
  try {
    const { correo } = req.body;

    // Verificar si el usuario existe
    const user = await prisma.usuario.findFirst({
      where: { correo }
    });

    if (!user) {
      // Por seguridad, no revelamos si el correo existe o no
      return res.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
    }

    // Limpiar tokens anteriores para este usuario
    console.log('🧹 [RESET REQUEST] Limpiando tokens anteriores para:', correo);
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        reset_token: null,
        reset_token_expiry: null
      }
    });

    // Generar token único
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

    console.log('🔑 [RESET REQUEST] Nuevo token generado:', resetToken);
    console.log('⏰ [RESET REQUEST] Token expira:', resetTokenExpiry);

    // Guardar token en la base de datos
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      }
    });

    // Enviar email usando el servicio
    try {
      console.log('📧 Intentando enviar email de recuperación a:', correo);
      console.log('🔑 Token generado:', resetToken);
      console.log('⚙️ Variables de entorno detalladas:', {
        SMTP_HOST: process.env.SMTP_HOST || 'NO_CONFIGURADO',
        SMTP_PORT: process.env.SMTP_PORT || 'NO_CONFIGURADO',
        SMTP_USER: process.env.SMTP_USER || 'NO_CONFIGURADO',
        SMTP_PASS: process.env.SMTP_PASS ? `CONFIGURADO (${process.env.SMTP_PASS.length} caracteres)` : 'NO_CONFIGURADO',

      });
      
      // Usar el servicio dedicado que funciona igual que la verificación
      await passwordResetService.sendPasswordResetEmail(correo, resetToken);
      console.log('✅ Email de recuperación enviado exitosamente');
    } catch (emailError) {
      console.error('❌ Error al enviar email de recuperación:', emailError);
      console.error('📋 Detalles del error:', emailError.message);
      // No retornamos error para no revelar si el email existe
    }

    res.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Error al solicitar reset de contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Resetear contraseña con token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { nuevaContrasena } = req.body;

    console.log('🔍 [RESET PASSWORD] Iniciando reset de contraseña...');
    console.log('🔍 [RESET PASSWORD] Token recibido:', token);
    console.log('🔍 [RESET PASSWORD] Longitud del token:', token ? token.length : 0);
    console.log('🔍 [RESET PASSWORD] Nueva contraseña recibida:', nuevaContrasena ? 'SÍ' : 'NO');

    // Buscar usuario con token válido
    const user = await prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date()
        }
      }
    });

    console.log('🔍 [RESET PASSWORD] Usuario encontrado:', user ? 'SÍ' : 'NO');
    if (user) {
      console.log('🔍 [RESET PASSWORD] Usuario:', user.correo);
      console.log('🔍 [RESET PASSWORD] Token en BD:', user.reset_token);
      console.log('🔍 [RESET PASSWORD] Tokens coinciden:', user.reset_token === token);
    }

    if (!user) {
      console.log('❌ [RESET PASSWORD] Token inválido o expirado');
      
      // Mostrar tokens disponibles para debugging
      const tokensDisponibles = await prisma.usuario.findMany({
        where: { reset_token: { not: null } },
        select: { correo: true, reset_token: true, reset_token_expiry: true }
      });
      
      console.log('📋 [RESET PASSWORD] Tokens disponibles en BD:', tokensDisponibles);
      
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar contraseña y limpiar token
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        contrasena: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    });

    // Enviar email de notificación de cambio de contraseña
    try {
      console.log('📧 [RESET PASSWORD] Enviando email de notificación de cambio de contraseña...');

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

      await emailService.sendPasswordChangeNotificationEmail(user.correo, user.nombre, changeInfo);
      console.log('✅ [RESET PASSWORD] Email de notificación de cambio de contraseña enviado exitosamente');
    } catch (emailError) {
      console.error('⚠️ [RESET PASSWORD] Error al enviar email de notificación de cambio de contraseña (no crítico):', emailError);
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
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
    const totalRegistros = await prisma.registroPendiente.count();
    console.log('📊 [VERIFICACIÓN] Total de registros pendientes:', totalRegistros);
    
    // Buscar si el token existe (sin importar fecha de expiración)
    const pendingRegistration = await prisma.registroPendiente.findFirst({
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
      const usuarioExistente = await prisma.usuario.findFirst({
        where: {
          verification_token: token
        }
      });
      
      if (usuarioExistente) {
        console.log('⚠️ [VERIFICACIÓN] Este token ya fue usado. Usuario ya registrado:', usuarioExistente.correo);
        return res.status(400).json({ 
          error: 'Este enlace ya fue utilizado. Tu cuenta ya está activa. Puedes iniciar sesión.',
          alreadyVerified: true
        });
      }
      
      // Mostrar los últimos 5 tokens para debugging
      const ultimosRegistros = await prisma.registroPendiente.findMany({
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
    const existingUser = await prisma.usuario.findFirst({
      where: { 
        OR: [
          { correo: pendingRegistration.correo },
          { usuario: pendingRegistration.usuario }
        ]
      }
    });

    if (existingUser) {
      console.log('⚠️ [VERIFICACIÓN] Usuario ya existe, eliminando registro pendiente...');
      // Eliminar el registro pendiente ya que el usuario ya existe
      await prisma.registroPendiente.delete({
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
    const tipoUsuarioExiste = await prisma.tipoUsuario.findUnique({
      where: { tipo_usuario: tipoUsuarioId }
    });
    
    if (!tipoUsuarioExiste) {
      console.log('❌ [VERIFICACIÓN] Tipo de usuario no existe:', tipoUsuarioId);
      
      // Buscar o crear un tipo de usuario por defecto
      let tipoUsuarioDefault = await prisma.tipoUsuario.findFirst();
      
      if (!tipoUsuarioDefault) {
        console.log('📝 [VERIFICACIÓN] No hay tipos de usuario, creando uno por defecto...');
        
        // Crear un tipo de usuario por defecto
        tipoUsuarioDefault = await prisma.tipoUsuario.create({
          data: {
            nombre_tipo_usuario: 'Usuario Regular'
          }
        });
        console.log('✅ [VERIFICACIÓN] Tipo de usuario por defecto creado:', tipoUsuarioDefault);
      }
      
      console.log('🔄 [VERIFICACIÓN] Usando tipo de usuario por defecto:', tipoUsuarioDefault.tipo_usuario);
      tipoUsuarioId = tipoUsuarioDefault.tipo_usuario;
    }
    
    console.log('👤 [VERIFICACIÓN] Creando usuario definitivo con tipo_usuario:', tipoUsuarioId);
    const newUser = await prisma.usuario.create({
      data: {
        nombre: pendingRegistration.nombre,
        apellido: pendingRegistration.apellido,
        usuario: pendingRegistration.usuario,
        correo: pendingRegistration.correo,
        contrasena: pendingRegistration.contrasena,
        tipo_usuario: tipoUsuarioId,
        ubicacion: pendingRegistration.ubicacion,
        email_verified: true
      }
    });

    // Eliminar el registro pendiente
    console.log('🧹 [VERIFICACIÓN] Eliminando registro pendiente...');
    await prisma.registroPendiente.delete({
      where: { id: pendingRegistration.id }
    });

    console.log('✅ [VERIFICACIÓN] Usuario verificado y registrado exitosamente:', {
      id: newUser.id_usuario,
      correo: newUser.correo,
      nombre: newUser.nombre
    });

    // Enviar email de bienvenida solo para usuarios registrados por formulario (auth_provider = "email")
    try {
      console.log('📧 [VERIFICACIÓN] Enviando email de bienvenida...');
      await emailService.sendWelcomeEmail(newUser.correo, newUser.nombre);
      console.log('✅ [VERIFICACIÓN] Email de bienvenida enviado exitosamente');
    } catch (emailError) {
      console.error('⚠️ [VERIFICACIÓN] Error al enviar email de bienvenida (no crítico):', emailError);
      // No fallar la verificación si el email de bienvenida falla
    }

    // Generar token JWT para login automático
    const authToken = jwt.sign(
      { userId: newUser.id_usuario, email: newUser.correo },
      process.env.JWT_SECRET || 'tu-secreto-jwt',
      { expiresIn: '7d' }
    );

    // Omitir contraseña de la respuesta
    const { contrasena: _, ...userWithoutPassword } = newUser;

    const successResponse = {
      message: '¡Email verificado exitosamente! Tu cuenta ha sido activada.',
      user: userWithoutPassword,
      token: authToken,
      verified: true
    };

    console.log('🚀 [VERIFICACIÓN] Enviando respuesta exitosa:', {
      message: successResponse.message,
      verified: successResponse.verified,
      usuario: userWithoutPassword.nombre,
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
    const pendingRegistration = await prisma.registroPendiente.findFirst({
      where: { correo }
    });

    if (!pendingRegistration) {
      // Verificar si el usuario ya está registrado
      const existingUser = await prisma.usuario.findFirst({
        where: { correo }
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
    await prisma.registroPendiente.update({
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
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    
    const { nombre, apellido, ubicacion } = req.body;

    // Filtrar campos undefined para evitar errores
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion;

    console.log('Datos a actualizar:', updateData);

    const user = await prisma.usuario.update({
      where: { id_usuario: decoded.userId },
      data: updateData,
      select: {
        id_usuario: true,
        usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        ubicacion: true,
        tipo_usuario: true,
        createdAt: true
      }
    });

    res.json({ message: 'Perfil actualizado exitosamente', user });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

export default router; 
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { emailService } from '../../lib/email-service.js';

const router = express.Router();
const prisma = new PrismaClient();

// Registro de usuario (ahora con verificación de email)
router.post('/register', async (req, res) => {
  try {
    console.log('Datos recibidos para registro:', req.body);

    const { nombre, apellido, correo, contrasena, usuario, ubicacion } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !apellido || !correo || !contrasena) {
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
      // Eliminar el registro pendiente anterior
      await prisma.registroPendiente.delete({
        where: { id: existingPendingRegistration.id }
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Generar token de verificación
    const verificationToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 86400000); // 24 horas

    // Guardar datos del registro pendiente
    await prisma.registroPendiente.create({
      data: {
        nombre,
        apellido,
        usuario,
        correo,
        contrasena: hashedPassword,
        ubicacion: ubicacion || "",
        verification_token: verificationToken,
        token_expiry: tokenExpiry
      }
    });

    console.log('Registro pendiente creado para:', correo);

    // Enviar email de verificación
    try {
      await emailService.sendVerificationEmail(correo, verificationToken);
      console.log('Email de verificación enviado exitosamente');
      
      const successResponse = {
        message: 'Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.',
        requiresVerification: true
      };
      
      console.log('Enviando respuesta de verificación:', successResponse);
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
    console.log('Datos de login recibidos:', { ...req.body, contrasena: '[PROTECTED]' });
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

    console.log('Usuario encontrado:', user ? { ...user, contrasena: '[PROTECTED]' } : null);

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

    console.log('Datos a enviar en respuesta:', { user: userWithoutPassword, token: token.substring(0, 20) + '...' });

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
    console.log('Headers recibidos:', req.headers);
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
        tipo_usuario: true
      }
    });
    
    console.log('Datos del usuario encontrados:', user);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
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

    // Generar token único
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

    // Guardar token en la base de datos
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      }
    });

    // Configurar el transporter de nodemailer (ajusta según tu proveedor de email)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // URL de reset (ajusta según tu dominio)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Enviar email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Recuperación de contraseña - DEMOS+',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="background-color: #2b555f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Recuperar contraseña
        </a>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Este enlace expirará en 1 hora.</p>
      `
    });

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

    // Buscar usuario con token válido
    const user = await prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
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

    if (!token) {
      console.log('❌ [VERIFICACIÓN] Token no proporcionado');
      return res.status(400).json({ error: 'Token de verificación requerido' });
    }

    // Buscar registro pendiente con token válido
    console.log('🔍 [VERIFICACIÓN] Buscando registro pendiente...');
    const pendingRegistration = await prisma.registroPendiente.findFirst({
      where: {
        verification_token: token,
        token_expiry: {
          gt: new Date()
        }
      }
    });

    if (!pendingRegistration) {
      console.log('❌ [VERIFICACIÓN] Token inválido o expirado');
      return res.status(400).json({ 
        error: 'Token inválido o expirado. Por favor, solicita un nuevo registro.' 
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

    // Obtener o crear el tipo de usuario normal
    let tipoUsuario = await prisma.tipoUsuario.findFirst({
      where: { nombre_tipo_usuario: 'normal' }
    });

    if (!tipoUsuario) {
      tipoUsuario = await prisma.tipoUsuario.create({
        data: {
          nombre_tipo_usuario: 'normal'
        }
      });
    }

    // Crear el usuario definitivo
    console.log('👤 [VERIFICACIÓN] Creando usuario definitivo...');
    const newUser = await prisma.usuario.create({
      data: {
        nombre: pendingRegistration.nombre,
        apellido: pendingRegistration.apellido,
        usuario: pendingRegistration.usuario,
        correo: pendingRegistration.correo,
        contrasena: pendingRegistration.contrasena,
        tipo_usuario: tipoUsuario.tipo_usuario,
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

export default router; 
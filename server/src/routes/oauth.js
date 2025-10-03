import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { emailService } from '../../lib/email-service.js';

const router = express.Router();
const prisma = new PrismaClient();

// Ruta para iniciar autenticación con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Ruta para iniciar autenticación con Twitter (solo si está configurado)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get('/twitter', passport.authenticate('twitter'));
}


// Callback de Google OAuth
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      console.log('🎉 Google OAuth exitoso para usuario:', req.user.email);
      
      // Obtener el detalle del usuario para acceder a auth_provider
      const userWithDetails = await prisma.usuario.findUnique({
        where: { id_usuario: req.user.id_usuario },
        include: { detalleUsuario: true }
      });
      
      // Enviar email de notificación de login para usuarios existentes
      try {
        console.log('📧 [GOOGLE OAUTH LOGIN] Enviando email de notificación de login...');

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
          location: 'Argentina'
        };

        const userName = `${req.user.nombre} ${req.user.apellido}`.trim();
        await emailService.sendLoginNotificationEmail(req.user.email, userName, loginInfo);
        console.log('✅ [GOOGLE OAUTH LOGIN] Email de notificación de login enviado');
      } catch (emailError) {
        console.error('⚠️ [GOOGLE OAUTH LOGIN] Error al enviar email de notificación de login (no crítico):', emailError);
      }
      
      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: req.user.id_usuario,
          email: req.user.email,
          provider: userWithDetails?.detalleUsuario?.auth_provider || 'google'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirigir al frontend con el token
      const redirectUrl = `http://localhost:3000/auth/callback?token=${token}&provider=google`;
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Error en callback de Google:', error);
      res.redirect('http://localhost:3000/login?error=token_generation_failed');
    }
  }
);

// Callback de Twitter OAuth (solo si está configurado)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get('/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('http://localhost:3000/login?error=user_not_found');
        }

        // Obtener el detalle del usuario para acceder a auth_provider
        const userWithDetails = await prisma.usuario.findUnique({
          where: { id_usuario: user.id_usuario },
          include: { detalleUsuario: true }
        });

        // Enviar email de notificación de login para usuarios existentes
        try {
          console.log('📧 [TWITTER OAUTH LOGIN] Enviando email de notificación de login...');

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
            location: 'Argentina'
          };

          const userName = `${user.nombre} ${user.apellido}`.trim();
          await emailService.sendLoginNotificationEmail(user.email, userName, loginInfo);
          console.log('✅ [TWITTER OAUTH LOGIN] Email de notificación de login enviado');
        } catch (emailError) {
          console.error('⚠️ [TWITTER OAUTH LOGIN] Error al enviar email de notificación de login (no crítico):', emailError);
        }

        // Generar JWT
        const authProvider = userWithDetails?.detalleUsuario?.auth_provider || 'twitter';
        const token = jwt.sign(
          { userId: user.id_usuario, email: user.email, provider: authProvider },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirigir al frontend con el token
        res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=${authProvider}`);
      } catch (error) {
        console.error('❌ Error al generar token JWT después de Twitter OAuth:', error);
        res.redirect('http://localhost:3000/login?error=token_generation_failed');
      }
    }
  );
}


// Ruta para obtener información del usuario autenticado
router.get('/me', async (req, res) => {
  try {
    console.log('🔍 [AUTH/ME] Headers recibidos:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ [AUTH/ME] No se proporcionó token de autorización');
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 [AUTH/ME] Token recibido:', token ? 'Presente' : 'Ausente');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH/ME] Token decodificado:', { userId: decoded.userId, email: decoded.email });
    
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        id_tipo_usuario: true,
        detalleUsuario: {
          select: {
            auth_provider: true,
            profile_picture: true,
            email_verified: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ [AUTH/ME] Usuario no encontrado con ID:', decoded.userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Aplanar la estructura para mantener compatibilidad con el frontend
    const userResponse = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      ubicacion: user.ubicacion,
      tipo_usuario: user.id_tipo_usuario,
      auth_provider: user.detalleUsuario?.auth_provider || 'email',
      profile_picture: user.detalleUsuario?.profile_picture || null,
      email_verified: user.detalleUsuario?.email_verified || false
    };

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

    console.log('✅ [AUTH/ME] Usuario encontrado:', userResponse);
    res.json({ user: userResponse, warnings });

  } catch (error) {
    console.error('❌ [AUTH/ME] Error al obtener usuario:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;

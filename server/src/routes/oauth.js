import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Ruta para iniciar autenticación con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback de Google OAuth
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      console.log('🎉 Google OAuth exitoso para usuario:', req.user.email);
      
      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: req.user.id_usuario,
          email: req.user.correo,
          provider: req.user.auth_provider
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
        correo: true,
        usuario: true,
        auth_provider: true,
        profile_picture: true,
        ubicacion: true,
        email_verified: true
      }
    });

    if (!user) {
      console.log('❌ [AUTH/ME] Usuario no encontrado con ID:', decoded.userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ [AUTH/ME] Usuario encontrado:', user);
    res.json({ user });

  } catch (error) {
    console.error('❌ [AUTH/ME] Error al obtener usuario:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;

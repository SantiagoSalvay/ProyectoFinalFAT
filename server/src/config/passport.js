import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Configurar estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth Profile:', profile);
    
    // Buscar usuario existente por google_id
    let user = await prisma.usuario.findUnique({
      where: { google_id: profile.id }
    });

    if (user) {
      console.log('✅ Usuario existente encontrado:', user.email);
      return done(null, user);
    }

    // Buscar usuario existente por email
    user = await prisma.usuario.findUnique({
      where: { correo: profile.emails[0].value }
    });

    if (user) {
      // Actualizar usuario existente con google_id
      user = await prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: {
          google_id: profile.id,
          auth_provider: 'google',
          profile_picture: profile.photos[0]?.value,
          email_verified: true // Los usuarios de Google ya tienen email verificado
        }
      });
      console.log('🔄 Usuario existente actualizado con Google ID');
      return done(null, user);
    }

    // Crear nuevo usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre: profile.name.givenName,
        apellido: profile.name.familyName || '',
        usuario: profile.emails[0].value.split('@')[0], // Usar parte antes del @ como username
        correo: profile.emails[0].value,
        google_id: profile.id,
        auth_provider: 'google',
        profile_picture: profile.photos[0]?.value,
        email_verified: true,
        tipo_usuario: 1, // Usuario regular por defecto
        ubicacion: null // Deberá completar en el perfil
      }
    });

    console.log('🆕 Nuevo usuario creado:', newUser.email);
    return done(null, newUser);

  } catch (error) {
    console.error('❌ Error en Google OAuth:', error);
    return done(error, null);
  }
}));

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id_usuario);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

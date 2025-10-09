import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { emailService } from '../../lib/email-service.js';

const prisma = new PrismaClient();

// Configurar estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth Profile:', profile);
    
    // Buscar Usuario existente por google_id en detalleUsuario
    let detalleUsuario = await prisma.detalleUsuario.findUnique({
      where: { google_id: profile.id },
      include: { usuario: true }
    });

    if (detalleUsuario) {
      console.log('✅ Usuario existente encontrado:', detalleUsuario.usuario.email);
      return done(null, detalleUsuario.usuario);
    }

    // Buscar Usuario existente por email
    let user = await prisma.Usuario.findUnique({
      where: { email: profile.emails[0].value },
      include: { detalleUsuario: true }
    });

    if (user) {
      // Si el Usuario existe pero no tiene DetalleUsuario, crearlo
  if (!user.detalleUsuario) {
        await prisma.detalleUsuario.create({
          data: {
            id_usuario: user.id_usuario,
            google_id: profile.id,
            auth_provider: 'google',
            profile_picture: profile.photos[0]?.value,
            email_verified: true
          }
        });
      } else {
        // Si ya tiene detalleUsuario, actualizar con google_id
        await prisma.detalleUsuario.update({
          where: { id_usuario: user.id_usuario },
          data: {
            google_id: profile.id,
            auth_provider: 'google',
            profile_picture: profile.photos[0]?.value,
            email_verified: true
          }
        });
      }
      console.log('🔄 Usuario existente actualizado con Google ID');
      return done(null, user);
    }

    // Crear nuevo Usuario con su detalle
    const newUser = await prisma.Usuario.create({
      data: {
        nombre: profile.name.givenName,
        apellido: profile.name.familyName || '',
        email: profile.emails[0].value,
        id_tipo_usuario: 1, // Usuario regular por defecto
        detalleUsuario: {
          create: {
            google_id: profile.id,
            auth_provider: 'google',
            profile_picture: profile.photos[0]?.value,
            email_verified: true
          }
        }
      }
    });

    console.log('🆕 Nuevo Usuario creado:', newUser.email);

    // Enviar emails de notificación para nuevo Usuario OAuth
    try {
      console.log('📧 [GOOGLE OAUTH] Enviando emails de notificación...');
      
      const userName = `${newUser.nombre} ${newUser.apellido}`.trim();
      
      // 1. Email de cuenta creada exitosamente
      await emailService.sendOAuthAccountCreatedEmail(newUser.email, userName, 'Google');
      console.log('✅ [GOOGLE OAUTH] Email de cuenta creada enviado');
      
      // 2. Email de bienvenida
      await emailService.sendWelcomeEmail(newUser.email, userName);
      console.log('✅ [GOOGLE OAUTH] Email de bienvenida enviado');
      
    } catch (emailError) {
      console.error('⚠️ [GOOGLE OAUTH] Error al enviar emails (no crítico):', emailError);
    }

    return done(null, newUser);

  } catch (error) {
    console.error('❌ Error en Google OAuth:', error);
    return done(error, null);
  }
}));

// Configurar estrategia de Twitter (solo si las credenciales están disponibles)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: 'http://localhost:3001/api/auth/twitter/callback'
  },
  async (token, tokenSecret, profile, done) => {
    try {
      console.log('🔍 Twitter OAuth Profile:', profile);

      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error('No email found in Twitter profile'), null);
      }

      // Buscar Usuario existente por twitter_id en detalleUsuario
      let detalleUsuario = await prisma.detalleUsuario.findUnique({
        where: { twitter_id: profile.id },
        include: { Usuario: true }
      });

      if (detalleUsuario) {
        console.log('🎉 Twitter OAuth exitoso para Usuario:', detalleUsuario.Usuario.email);
        return done(null, detalleUsuario.Usuario);
      }

      // Buscar Usuario existente por email
      let user = await prisma.Usuario.findUnique({
        where: { email: email },
        include: { DetalleUsuario: true }
      });

      if (user) {
        // Si el Usuario existe pero no tiene DetalleUsuario, crearlo
        if (!user.DetalleUsuario) {
          await prisma.detalleUsuario.create({
            data: {
              id_usuario: user.id_usuario,
              twitter_id: profile.id,
              auth_provider: 'twitter',
              profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email_verified: true
            }
          });
        } else {
          // Si ya tiene detalleUsuario, actualizar con twitter_id
          await prisma.detalleUsuario.update({
            where: { id_usuario: user.id_usuario },
            data: {
              twitter_id: profile.id,
              auth_provider: 'twitter',
              profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email_verified: true
            }
          });
        }
        console.log('🔗 Cuenta existente vinculada:', user.email);
        return done(null, user);
      }

      // Crear nuevo Usuario con su detalle
      const firstName = profile.displayName ? profile.displayName.split(' ')[0] : 'Usuario';
      const lastName = profile.displayName ? profile.displayName.split(' ').slice(1).join(' ') : 'Twitter';

      user = await prisma.Usuario.create({
        data: {
          nombre: firstName,
          apellido: lastName,
          email: email,
          id_tipo_usuario: 1, // Default to 'person'
          detalleUsuario: {
            create: {
              twitter_id: profile.id,
              auth_provider: 'twitter',
              profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email_verified: true
            }
          }
        }
      });
      console.log('🆕 Nuevo Usuario creado:', user.email);

      // Enviar emails de notificación para nuevo Usuario OAuth
      try {
        console.log('📧 [TWITTER OAUTH] Enviando emails de notificación...');
        
        const userName = `${user.nombre} ${user.apellido}`.trim();
        
        // 1. Email de cuenta creada exitosamente
        await emailService.sendOAuthAccountCreatedEmail(user.email, userName, 'Twitter');
        console.log('✅ [TWITTER OAUTH] Email de cuenta creada enviado');
        
        // 2. Email de bienvenida
        await emailService.sendWelcomeEmail(user.email, userName);
        console.log('✅ [TWITTER OAUTH] Email de bienvenida enviado');
        
      } catch (emailError) {
        console.error('⚠️ [TWITTER OAUTH] Error al enviar emails (no crítico):', emailError);
      }

      done(null, user);
    } catch (error) {
      console.error('❌ Error en Twitter OAuth:', error);
      done(error, null);
    }
  }));
  console.log('✅ Twitter OAuth configurado correctamente');
} else {
  console.log('⚠️ Twitter OAuth no configurado - faltan credenciales en .env');
}


// Serializar Usuario para la sesión
passport.serializeUser((user, done) => {
  // Asegurarse de que user existe y tiene id_usuario
  if (user && user.id_usuario) {
    done(null, user.id_usuario);
  } else if (user && user.id) {
    // fallback por si el campo es id
    done(null, user.id);
  } else {
    done(new Error('No se puede serializar usuario: id_usuario no encontrado'), null);
  }
});

// Deserializar Usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

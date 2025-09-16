import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
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

      let user = await prisma.usuario.findUnique({
        where: { twitter_id: profile.id }
      });

      if (!user) {
        user = await prisma.usuario.findUnique({
          where: { correo: email }
        });

        if (user) {
          // Link existing account
          user = await prisma.usuario.update({
            where: { id_usuario: user.id_usuario },
            data: {
              twitter_id: profile.id,
              auth_provider: 'twitter',
              profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email_verified: true // OAuth users are considered verified
            }
          });
          console.log('🔗 Cuenta existente vinculada:', user.correo);
        } else {
          // Create new user
          const firstName = profile.displayName ? profile.displayName.split(' ')[0] : 'Usuario';
          const lastName = profile.displayName ? profile.displayName.split(' ').slice(1).join(' ') : 'Twitter';
          const username = profile.username || email.split('@')[0];

          user = await prisma.usuario.create({
            data: {
              twitter_id: profile.id,
              nombre: firstName,
              apellido: lastName,
              correo: email,
              usuario: username,
              contrasena: null, // No password for OAuth users
              tipo_usuario: 1, // Default to 'person'
              ubicacion: null, // User must complete this later
              auth_provider: 'twitter',
              profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email_verified: true
            }
          });
          console.log('🆕 Nuevo usuario creado:', user.correo);
        }
      } else {
        console.log('🎉 Twitter OAuth exitoso para usuario:', user.correo);
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

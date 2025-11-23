import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { emailService } from '../../lib/mailersend-service.js';

const prisma = new PrismaClient();

// Configurar estrategia de Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth Profile:', profile);

      const email = profile.emails[0]?.value;
      const googleId = profile.id;
      const profilePicture = profile.photos[0]?.value;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Buscar Usuario existente por google_id en detalleUsuario (caso más común - login rápido)
      const detalleUsuario = await prisma.detalleUsuario.findUnique({
        where: { google_id: googleId },
        include: { Usuario: true }
      });

      if (detalleUsuario) {
        console.log('✅ Usuario existente encontrado por Google ID:', detalleUsuario.Usuario.email);
        // Incluir DetalleUsuario en el usuario para evitar consulta adicional en callback
        const userWithDetails = {
          ...detalleUsuario.Usuario,
          DetalleUsuario: {
            auth_provider: 'google',
            profile_picture: detalleUsuario.profile_picture,
            email_verified: detalleUsuario.email_verified
          }
        };
        return done(null, userWithDetails);
      }

      // Buscar Usuario existente por email (para vincular cuenta existente)
      const existingUser = await prisma.Usuario.findUnique({
        where: { email },
        include: { DetalleUsuario: true }
      });

      if (existingUser) {
        // Buscar DetalleUsuario existente por id_usuario (no es único, usar findFirst)
        const existingDetalle = await prisma.detalleUsuario.findFirst({
          where: { id_usuario: existingUser.id_usuario }
        });

        if (existingDetalle) {
          // Actualizar DetalleUsuario existente
          await prisma.detalleUsuario.update({
            where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
            data: {
              google_id: googleId,
              auth_provider: 'google',
              profile_picture: profilePicture,
              email_verified: true
            }
          });
        } else {
          // Crear nuevo DetalleUsuario
          await prisma.detalleUsuario.create({
            data: {
              id_usuario: existingUser.id_usuario,
              google_id: googleId,
              auth_provider: 'google',
              profile_picture: profilePicture,
              email_verified: true
            }
          });
        }

        console.log('🔄 Usuario existente actualizado con Google ID');

        // Retornar usuario con DetalleUsuario incluido
        const userWithDetails = {
          ...existingUser,
          DetalleUsuario: {
            auth_provider: 'google',
            profile_picture: profilePicture,
            email_verified: true
          }
        };
        return done(null, userWithDetails);
      }

      // Crear nuevo Usuario con su detalle (transacción única)
      const newUser = await prisma.Usuario.create({
        data: {
          nombre: profile.name.givenName || '',
          apellido: profile.name.familyName || '',
          email,
          id_tipo_usuario: 1, // Usuario regular por defecto
          DetalleUsuario: {
            create: {
              google_id: googleId,
              auth_provider: 'google',
              profile_picture: profilePicture,
              email_verified: true
            }
          }
        },
        include: {
          DetalleUsuario: true
        }
      });

      console.log('🆕 Nuevo Usuario creado:', newUser.email);

      // Enviar emails de forma asíncrona (no bloquear el flujo de autenticación)
      const userName = `${newUser.nombre} ${newUser.apellido}`.trim();
      emailService.sendOAuthAccountCreatedEmail(newUser.email, userName, 'Google')
        .then(() => console.log('✅ [GOOGLE OAUTH] Email de cuenta creada enviado'))
        .catch(err => console.error('⚠️ [GOOGLE OAUTH] Error al enviar email de cuenta creada (no crítico):', err));

      emailService.sendWelcomeEmail(newUser.email, userName)
        .then(() => console.log('✅ [GOOGLE OAUTH] Email de bienvenida enviado'))
        .catch(err => console.error('⚠️ [GOOGLE OAUTH] Error al enviar email de bienvenida (no crítico):', err));

      // Retornar usuario con DetalleUsuario incluido
      const userWithDetails = {
        ...newUser,
        DetalleUsuario: {
          auth_provider: 'google',
          profile_picture: newUser.DetalleUsuario?.profile_picture,
          email_verified: newUser.DetalleUsuario?.email_verified
        }
      };
      return done(null, userWithDetails);

    } catch (error) {
      console.error('❌ Error en Google OAuth:', error);
      return done(error, null);
    }
  }));
  console.log('✅ Google OAuth configurado correctamente');
} else {
  console.log('⚠️ Google OAuth no configurado - faltan credenciales en .env');
}

// Configurar estrategia de Twitter (solo si las credenciales están disponibles)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  // Importación dinámica para evitar fallos si 'passport-twitter' no está instalado
  const { Strategy: TwitterStrategy } = await import('passport-twitter');

  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/twitter/callback`
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
          // Buscar DetalleUsuario existente por id_usuario (puede ser array, usar findFirst)
          const existingDetalle = await prisma.detalleUsuario.findFirst({
            where: { id_usuario: user.id_usuario }
          });

          if (existingDetalle) {
            // Actualizar DetalleUsuario existente usando id_detalle_usuario (único)
            await prisma.detalleUsuario.update({
              where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
              data: {
                twitter_id: profile.id,
                auth_provider: 'twitter',
                profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                email_verified: true
              }
            });
          } else {
            // Crear nuevo DetalleUsuario
            await prisma.detalleUsuario.create({
              data: {
                id_usuario: user.id_usuario,
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
            DetalleUsuario: {
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

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware de autenticación centralizado
 * Verifica el JWT y adjunta la información del usuario a req.user
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Se requiere autenticación para acceder a este recurso'
      });
    }

    // Validar formato del header
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Formato de token inválido',
        message: 'El token debe estar en formato: Bearer <token>'
      });
    }

    const token = parts[1];
    
    // Verificar y decodificar el JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        });
      }
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }

    // Validar que el userId sea un número válido
    if (!decoded.userId || typeof decoded.userId !== 'number') {
      return res.status(401).json({ 
        error: 'Token malformado',
        message: 'El token no contiene información válida del usuario'
      });
    }

    // Buscar el usuario en la base de datos
    const usuario = await prisma.Usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        id_tipo_usuario: true,
      }
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe'
      });
    }

    // Verificar si el usuario está baneado
    const banType = await prisma.tipoInfraccion.upsert({
      where: { id_tipo_infraccion: 9999 },
      update: {},
      create: { id_tipo_infraccion: 9999, tipo_infraccion: 'Ban', severidad: 'Crítica' }
    });

    const activeBan = await prisma.infracciones.findFirst({
      where: {
        id_usuario: usuario.id_usuario,
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
        ? 'Tu cuenta ha sido baneada permanentemente'
        : `Tu cuenta está suspendida hasta el ${new Date(activeBan.fecha_expiracion).toLocaleDateString('es-ES')}`;
      
      return res.status(403).json({
        error: message,
        userBanned: true,
        permanent: isPermanent,
        bannedUntil: activeBan.fecha_expiracion
      });
    }

    // Adjuntar información del usuario a la request
    req.user = usuario;
    req.userId = usuario.id_usuario;
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al procesar la autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea administrador
 * Debe usarse después de authenticateToken
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    if (req.user.id_tipo_usuario < 3) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Se requieren privilegios de administrador para acceder a este recurso'
      });
    }

    next();
  } catch (error) {
    console.error('Error en requireAdmin:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea ONG (tipo 2) o superior
 * Debe usarse después de authenticateToken
 */
export const requireONG = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    if (req.user.id_tipo_usuario < 2) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Este recurso está disponible solo para organizaciones'
      });
    }

    next();
  } catch (error) {
    console.error('Error en requireONG:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Intenta autenticar pero no falla si no hay token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = parts[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
      
      if (decoded.userId && typeof decoded.userId === 'number') {
        const usuario = await prisma.Usuario.findUnique({
          where: { id_usuario: decoded.userId },
          select: {
            id_usuario: true,
            nombre: true,
            email: true,
            id_tipo_usuario: true,
          }
        });

        if (usuario) {
          req.user = usuario;
          req.userId = usuario.id_usuario;
        }
      }
    } catch (error) {
      // Token inválido, continuar sin usuario
    }
    
    next();
  } catch (error) {
    console.error('Error en optionalAuth:', error);
    req.user = null;
    req.userId = null;
    next();
  }
};


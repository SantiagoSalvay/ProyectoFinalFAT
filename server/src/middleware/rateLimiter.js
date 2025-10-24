import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para todas las rutas
 * Previene ataques de denegación de servicio (DoS)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 requests por ventana por IP
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Por favor, intenta nuevamente más tarde.'
  },
  standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit excedido por IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Por favor, intenta nuevamente más tarde.'
    });
  }
});

/**
 * Rate limiter estricto para autenticación
 * Previene ataques de fuerza bruta en login
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos de login por ventana por IP
  message: {
    error: 'Demasiados intentos de inicio de sesión',
    message: 'Has intentado iniciar sesión demasiadas veces. Por favor, espera 15 minutos antes de intentar nuevamente.'
  },
  skipSuccessfulRequests: true, // No contar requests exitosas
  handler: (req, res) => {
    console.warn(`⚠️ Múltiples intentos de login fallidos desde IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiados intentos de inicio de sesión',
      message: 'Has intentado iniciar sesión demasiadas veces. Por favor, espera 15 minutos antes de intentar nuevamente.'
    });
  }
});

/**
 * Rate limiter para registro de usuarios
 * Previene spam de cuentas
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 registros por hora por IP
  message: {
    error: 'Demasiados intentos de registro',
    message: 'Has intentado registrarte demasiadas veces. Por favor, espera 1 hora antes de intentar nuevamente.'
  },
  handler: (req, res) => {
    console.warn(`⚠️ Múltiples intentos de registro desde IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiados intentos de registro',
      message: 'Has intentado registrarte demasiadas veces. Por favor, espera 1 hora antes de intentar nuevamente.'
    });
  }
});

/**
 * Rate limiter para recuperación de contraseña
 * Previene spam de emails
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 solicitudes por hora por IP
  message: {
    error: 'Demasiadas solicitudes de recuperación',
    message: 'Has solicitado recuperación de contraseña demasiadas veces. Por favor, espera 1 hora antes de intentar nuevamente.'
  },
  handler: (req, res) => {
    console.warn(`⚠️ Múltiples solicitudes de reset de contraseña desde IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas solicitudes de recuperación',
      message: 'Has solicitado recuperación de contraseña demasiadas veces. Por favor, espera 1 hora antes de intentar nuevamente.'
    });
  }
});

/**
 * Rate limiter para creación de posts/comentarios
 * Previene spam
 */
export const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 posts/comentarios por ventana
  message: {
    error: 'Demasiadas publicaciones',
    message: 'Estás publicando demasiado rápido. Por favor, espera un momento antes de intentar nuevamente.'
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit de publicaciones excedido por IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas publicaciones',
      message: 'Estás publicando demasiado rápido. Por favor, espera un momento antes de intentar nuevamente.'
    });
  }
});

/**
 * Rate limiter para uploads de archivos
 * Previene abuso de almacenamiento
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // Máximo 50 uploads por hora
  message: {
    error: 'Demasiadas subidas de archivos',
    message: 'Has subido demasiados archivos. Por favor, espera antes de subir más.'
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit de uploads excedido por IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas subidas de archivos',
      message: 'Has subido demasiados archivos. Por favor, espera antes de subir más.'
    });
  }
});

/**
 * Rate limiter para búsquedas
 * Previene abuso de queries pesadas
 */
export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // Máximo 50 búsquedas por ventana
  message: {
    error: 'Demasiadas búsquedas',
    message: 'Estás realizando demasiadas búsquedas. Por favor, espera un momento.'
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit de búsquedas excedido por IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas búsquedas',
      message: 'Estás realizando demasiadas búsquedas. Por favor, espera un momento.'
    });
  }
});

/**
 * Rate limiter para APIs de administración
 * Más permisivo pero con logging
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Máximo 500 requests por ventana
  message: {
    error: 'Demasiadas solicitudes administrativas',
    message: 'Has excedido el límite de solicitudes. Por favor, espera un momento.'
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit administrativo excedido por IP: ${req.ip}, User: ${req.userId || 'unknown'}`);
    res.status(429).json({
      error: 'Demasiadas solicitudes administrativas',
      message: 'Has excedido el límite de solicitudes. Por favor, espera un momento.'
    });
  }
});

/**
 * Rate limiter muy estricto para operaciones sensibles
 * (cambio de contraseña, eliminación de cuenta, etc.)
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 operaciones por hora
  message: {
    error: 'Demasiadas operaciones sensibles',
    message: 'Has realizado demasiadas operaciones sensibles. Por favor, espera 1 hora antes de intentar nuevamente.'
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit estricto excedido por IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas operaciones sensibles',
      message: 'Has realizado demasiadas operaciones sensibles. Por favor, espera 1 hora antes de intentar nuevamente.'
    });
  }
});


/**
 * Middleware de validación y sanitización de inputs
 * Protege contra SQL injection, XSS y otros ataques
 */

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Eliminar caracteres de control y null bytes
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim espacios
  str = str.trim();
  
  return str;
};

/**
 * Sanitiza un objeto eliminando caracteres peligrosos de sus strings
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Middleware para sanitizar el body de las requests
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware para sanitizar los query params
 */
export const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Middleware para sanitizar los params de URL
 */
export const sanitizeParams = (req, res, next) => {
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Valida que un email tenga formato válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Expresión regular para validar emails
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Valida que un ID sea un número entero positivo
 */
export const isValidId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
};

/**
 * Middleware para validar parámetros de ID en la URL
 */
export const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!isValidId(id)) {
      return res.status(400).json({ 
        error: 'ID inválido',
        message: `El parámetro '${paramName}' debe ser un número entero positivo`
      });
    }
    
    // Convertir a número para uso posterior
    req.params[paramName] = parseInt(id, 10);
    
    next();
  };
};

/**
 * Middleware para validar campos requeridos en el body
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes',
        message: `Los siguientes campos son requeridos: ${missing.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware para validar email en el body
 */
export const validateEmail = (fieldName = 'correo') => {
  return (req, res, next) => {
    const email = req.body[fieldName];
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Email inválido',
        message: `El campo '${fieldName}' debe contener un email válido`
      });
    }
    
    next();
  };
};

/**
 * Middleware para validar longitud de strings
 */
export const validateLength = (fieldName, minLength = 0, maxLength = Infinity) => {
  return (req, res, next) => {
    const value = req.body[fieldName];
    
    if (typeof value !== 'string') {
      return res.status(400).json({ 
        error: 'Tipo de dato inválido',
        message: `El campo '${fieldName}' debe ser una cadena de texto`
      });
    }
    
    if (value.length < minLength) {
      return res.status(400).json({ 
        error: 'Longitud insuficiente',
        message: `El campo '${fieldName}' debe tener al menos ${minLength} caracteres`
      });
    }
    
    if (value.length > maxLength) {
      return res.status(400).json({ 
        error: 'Longitud excesiva',
        message: `El campo '${fieldName}' no puede tener más de ${maxLength} caracteres`
      });
    }
    
    next();
  };
};

/**
 * Detecta patrones comunes de SQL injection
 */
export const detectSQLInjection = (value) => {
  if (typeof value !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|"|`)(.*?)(OR|AND)(.*?)('|"|`)/gi,
    /(=|<|>).*?(OR|AND).*?(=|<|>)/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(value));
};

/**
 * Middleware para detectar intentos de SQL injection
 */
export const preventSQLInjection = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && detectSQLInjection(value)) {
          console.warn(`⚠️ Posible intento de SQL injection detectado en ${currentPath}:`, value);
          return res.status(400).json({ 
            error: 'Entrada inválida',
            message: 'Se detectó contenido potencialmente peligroso en la solicitud'
          });
        }
        
        if (typeof value === 'object' && value !== null) {
          const result = checkObject(value, currentPath);
          if (result) return result;
        }
      }
    }
  };
  
  // Verificar body, query y params
  if (req.body) {
    const result = checkObject(req.body, 'body');
    if (result) return result;
  }
  
  if (req.query) {
    const result = checkObject(req.query, 'query');
    if (result) return result;
  }
  
  if (req.params) {
    const result = checkObject(req.params, 'params');
    if (result) return result;
  }
  
  next();
};

/**
 * Detecta patrones de XSS (Cross-Site Scripting)
 */
export const detectXSS = (value) => {
  if (typeof value !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(value));
};

/**
 * Middleware para prevenir ataques XSS
 */
export const preventXSS = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && detectXSS(value)) {
          console.warn(`⚠️ Posible intento de XSS detectado en ${currentPath}:`, value);
          return res.status(400).json({ 
            error: 'Entrada inválida',
            message: 'Se detectó contenido potencialmente peligroso en la solicitud'
          });
        }
        
        if (typeof value === 'object' && value !== null) {
          const result = checkObject(value, currentPath);
          if (result) return result;
        }
      }
    }
  };
  
  if (req.body) {
    const result = checkObject(req.body, 'body');
    if (result) return result;
  }
  
  if (req.query) {
    const result = checkObject(req.query, 'query');
    if (result) return result;
  }
  
  next();
};

/**
 * Middleware combinado de seguridad
 * Aplica sanitización y prevención de ataques comunes
 */
export const securityMiddleware = [
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  preventSQLInjection,
  preventXSS
];


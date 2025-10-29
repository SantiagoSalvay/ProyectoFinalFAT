/**
 * Utilidades de validación y sanitización para el frontend
 * Protege contra XSS, SQL injection y otros ataques
 */

/**
 * Valida que un email tenga formato válido
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Valida que una contraseña cumpla con requisitos mínimos de seguridad
 */
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'La contraseña es requerida' }
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
  }
  
  if (password.length > 100) {
    return { valid: false, message: 'La contraseña es demasiado larga' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra minúscula' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número' }
  }
  
  return { valid: true }
}

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos
 */
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return ''
  
  // Eliminar caracteres de control y null bytes
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Trim espacios
  str = str.trim()
  
  return str
}

/**
 * Detecta patrones comunes de SQL injection
 */
export const detectSQLInjection = (value: string): boolean => {
  if (typeof value !== 'string') return false
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|"|`)(.*?)(OR|AND)(.*?)('|"|`)/gi,
    /(=|<|>).*?(OR|AND).*?(=|<|>)/gi,
  ]
  
  return sqlPatterns.some(pattern => pattern.test(value))
}

/**
 * Detecta patrones de XSS (Cross-Site Scripting)
 */
export const detectXSS = (value: string): boolean => {
  if (typeof value !== 'string') return false
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ]
  
  return xssPatterns.some(pattern => pattern.test(value))
}

/**
 * Valida y sanitiza un input
 */
export const validateAndSanitizeInput = (
  value: string,
  options: {
    required?: boolean
    minLength?: number
    maxLength?: number
    allowHTML?: boolean
  } = {}
): { valid: boolean; value: string; message?: string } => {
  const { required = false, minLength = 0, maxLength = Infinity, allowHTML = false } = options
  
  // Verificar si es requerido
  if (required && (!value || value.trim() === '')) {
    return { valid: false, value: '', message: 'Este campo es requerido' }
  }
  
  if (!value) {
    return { valid: true, value: '' }
  }
  
  // Sanitizar
  let sanitized = sanitizeString(value)
  
  // Detectar SQL injection
  if (detectSQLInjection(sanitized)) {
    console.warn('⚠️ Posible intento de SQL injection detectado')
    return { 
      valid: false, 
      value: '', 
      message: 'Se detectó contenido potencialmente peligroso en el input' 
    }
  }
  
  // Detectar XSS (solo si no se permite HTML)
  if (!allowHTML && detectXSS(sanitized)) {
    console.warn('⚠️ Posible intento de XSS detectado')
    return { 
      valid: false, 
      value: '', 
      message: 'Se detectó contenido potencialmente peligroso en el input' 
    }
  }
  
  // Validar longitud
  if (sanitized.length < minLength) {
    return { 
      valid: false, 
      value: sanitized, 
      message: `Debe tener al menos ${minLength} caracteres` 
    }
  }
  
  if (sanitized.length > maxLength) {
    return { 
      valid: false, 
      value: sanitized, 
      message: `No puede tener más de ${maxLength} caracteres` 
    }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Valida que un ID sea válido
 */
export const isValidId = (id: any): boolean => {
  const numId = parseInt(id, 10)
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId)
}

/**
 * Valida que una URL sea válida y segura
 */
export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    // Solo permitir http y https
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Previene ataques de timing al comparar strings sensibles
 */
export const safeCompare = (a: string, b: string): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }
  
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Valida datos de formulario
 */
export const validateFormData = (
  data: Record<string, any>,
  rules: Record<string, {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    validator?: (value: any) => boolean
    message?: string
  }>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // Verificar si es requerido
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rule.message || 'Este campo es requerido'
      continue
    }
    
    // Si no hay valor y no es requerido, continuar
    if (!value) continue
    
    // Validar con validador personalizado
    if (rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || 'Valor inválido'
      continue
    }
    
    // Validar strings
    if (typeof value === 'string') {
      // Detectar ataques
      if (detectSQLInjection(value) || detectXSS(value)) {
        errors[field] = 'Se detectó contenido potencialmente peligroso'
        continue
      }
      
      // Validar longitud
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message || `Debe tener al menos ${rule.minLength} caracteres`
        continue
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message || `No puede tener más de ${rule.maxLength} caracteres`
        continue
      }
      
      // Validar patrón
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || 'Formato inválido'
        continue
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}


/**
 * Sistema de Moderación de Contenido
 * Filtra palabras ofensivas, spam y contenido inapropiado
 */

// Lista de palabras prohibidas - EXPANDIDA
const PALABRAS_PROHIBIDAS = [
  // Insultos comunes
  'idiota', 'estúpido', 'estupido', 'imbécil', 'imbecil', 'tonto', 'tonta',
  'pendejo', 'pendeja', 'pelotudo', 'pelotuda', 'boludo', 'boluda', 'gil', 'tarado', 'tarada',
  'cretino', 'cretina', 'subnormal', 'mongólico', 'mongolico', 'mogólico', 'mogolico',
  
  // Insultos relacionados con discapacidad (discriminatorios)
  'retrasado', 'retrasada', 'retardado', 'retardada', 'retard',
  'retrasado mental', 'retardado mental', 'discapacitado mental',
  'autista', 'autistic', 'down', 'síndrome de down', 'sindrome de down',
  'deficiente', 'deficiente mental', 'anormal', 'loco', 'loca', 'demente',
  
  // Insultos machistas y sexistas
  'puta', 'puto', 'putita', 'putito', 'zorra', 'zorro', 'prostituta', 'ramera',
  'golfa', 'cualquiera', 'furcia', 'guarra', 'guarro', 'guarrilla',
  'hijo de puta', 'hdp', 'hija de puta', 'hp', 'hijo de su puta madre',
  'cabrón', 'cabron', 'cabrona', 'cabronazo', 'cornudo', 'cornuda',
  
  // Insultos vulgares fuertes
  'mierda', 'mierd@', 'm1erda', 'cagada', 'carajo', 'coño', 'cono', 'joder',
  'jodete', 'jódete', 'chingar', 'chingas', 'chingada', 'chingado',
  'verga', 'vrga', 'v3rga', 'pija', 'pij@', 'p1ja',
  'concha', 'conchudo', 'conchuda', 'culiao', 'culiado', 'culero', 'culera',
  'marica', 'maricon', 'maricón', 'maricona', 'maricones',
  'mariconazo', 'maricada', 'mamaguevo', 'malparido', 'malparida',
  
  // Insultos racistas, xenófobos y antisemitas
  'negro de mierda', 'sudaca', 'indio', 'india', 'cholo', 'chola',
  'negro', 'negra', 'negrito', 'negrita', 'morenito', 'morenita',
  'racista', 'nazi', 'nazis', 'fascista', 'fascistas', 'facho',
  'terrorista', 'terroristas', 'mono', 'mona', 'simio',
  'judio', 'judío', 'judia', 'judía', 'judios', 'judíos', 'judias', 'judías',
  'judio de mierda', 'judío de mierda',
  
  // Insultos de inteligencia
  'burro', 'burra', 'bruto', 'bruta', 'ignorante', 'analfabeto', 'analfabeta',
  'inútil', 'inutil', 'incompetente', 'mediocre', 'fracasado', 'fracasada',
  'perdedor', 'perdedora', 'loser', 'looser',
  
  // Insultos de apariencia
  'feo', 'fea', 'horrible', 'asqueroso', 'asquerosa', 'repugnante',
  'gordo', 'gorda', 'gordo de mierda', 'gorda de mierda',
  'flaco', 'flaca', 'enano', 'enana', 'petiso', 'petisa',
  
  // Insultos homofóbicos
  'maricón', 'maricon', 'puto', 'puta', 'marica', 'gay de mierda',
  'lesbiana de mierda', 'travesti', 'trolo', 'trola', 'putito',
  'sodomita', 'invertido', 'invertida',
  
  // Insultos a la familia
  'tu madre', 'tu mamá', 'tu mama', 'tu vieja', 'tu viejo',
  'la puta que te parió', 'la concha de tu madre', 'la concha de tu hermana',
  
  // Amenazas y violencia
  'te mato', 'te voy a matar', 'matarte', 'morir', 'muérete', 'muere',
  'ojalá te mueras', 'ojalá mueras', 'te rompo', 'te parto',
  'te violo', 'violarte', 'te cagas', 'cállate', 'callate', 'cierra el pico',
  
  // Spam común
  'compra ahora', 'haz clic aquí', 'haz clic aqui', 'click here', 'click aqui',
  'gana dinero', 'ganar dinero facil', 'dinero fácil', 'dinero facil',
  'oferta limitada', 'promoción exclusiva', 'promocion exclusiva',
  'compra ya', 'oferta única', 'oferta unica', 'no te lo pierdas',
  
  // Palabras relacionadas con contenido sexual
  'porno', 'pornografia', 'pornografía', 'xxx', 'sexo gratis',
  'pene', 'vagina', 'tetas', 'culo', 'trasero',
  'masturbación', 'masturbacion', 'pajero', 'pajera',
  
  // Variantes con símbolos y números (evasión)
  'p3ndejo', 'p3ndejas', 'put@', 'put0', 'c0ño', 'mierda',
  'idiót@', 'idiot@', 'est00pido', 'ret@rd@do',
  
  // Insultos en inglés
  'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'bastard',
  'motherfucker', 'cunt', 'dick', 'pussy', 'whore', 'slut',
  'stupid', 'idiot', 'moron', 'dumb', 'retard', 'retarded',
  
  // Otras palabras ofensivas
  'maldito', 'maldita', 'desgraciado', 'desgraciada', 'miserable',
  'basura', 'escoria', 'parásito', 'parasito', 'rata', 'cucaracha',
  
  // Insultos argentinos y modismos ofensivos
  'boludo', 'boluda', 'boludito', 'boludita', 'boludazo', 'boludaza',
  'pelotudo', 'pelotuda', 'pelotudito', 'pelotudita', 'pelotudazo',
  'gil', 'gila', 'gilastro', 'gilazo', 'gilada',
  'tarado', 'tarada', 'taradito', 'taradita', 'taradazo',
  'mogólico', 'mogolico', 'mongolon', 'mongui',
  'garca', 'garcón', 'garcha', 'garchado', 'garchada',
  'forro', 'forra', 'forrito', 'forrazo', 'forraso',
  'chupapija', 'chupaverga', 'chupamedias', 'lameculos',
  'la concha de tu madre', 'la concha de tu hermana', 'la concha de la lora',
  'andate a la mierda', 'andate al carajo', 'rajá de acá', 'raja de aca',
  'la puta que te parió', 'la puta que te pario', 'la re puta madre',
  'hijo de puta', 'hijo de mil putas', 'hijo de re mil putas',
  'la re concha de tu madre', 'la reconcha', 're concha',
  'sorete', 'soretito', 'soretazo', 'soreteada',
  'choto', 'chota', 'chotazo', 'al pedo',
  'la concha de dios', 'me cago en dios', 'la puta madre',
  'chupame', 'chupamela', 'chupate esta', 'chupenla',
  'mamita', 'mamadera', 'mamerto', 'mamón', 'mamon',
  'turro', 'turra', 'turrito', 'turraso', 'turrón',
  'negro villero', 'negrada', 'negros de mierda',
  'planero', 'planera', 'vago', 'vaga', 'vago de mierda',
  
  // Insultos específicos cordobeses - EXPANDIDO
  'culiado', 'culia', 'culiau', 'culiada', 'culiá', 'culiadazo', 'culiadita',
  'la puta', 'la pucha', 'qué culiado', 'que culiado', 'culiado loco',
  'nabo', 'nabito', 'nabaso', 're nabo', 'nabazo',
  'chamuyero', 'chamuyera', 'chanta', 'chantazo', 'chantada', 'chantún',
  'botón', 'boton', 'buchón', 'buchon', 'cagón', 'cagon', 'buchón de mierda',
  'ortiva', 'ortibas', 'ortibón', 'ortibon', 'ortivo',
  'pecho frío', 'pecho frio', 'pechofrío', 'pechofrio',
  'gato', 'gata', 'gatubi', 'minusa', 'minuza', 'gatito', 'gatote',
  'groncho', 'groncha', 'gronchada', 'grasa', 'grasada', 'grasoso',
  'cagaste', 'te cagaron', 'la cagaste', 'cagador', 'cagadora',
  'pedorro', 'pedorra', 'pedorrito', 'pedorrazo', 'pedo', 'pedazo',
  'chupame un huevo', 'me importa un carajo', 'me chupa un huevo',
  'andate a cagar', 'andate al chori', 'rajá gil', 'raja gil',
  'la concha bien de tu madre', 'recontra', 're contra', 'recontra puta',
  'malparido', 'malparida', 'malnacido', 'malnacida', 'malparidazo',
  'trolaso', 'trola', 'trolo', 'trollo', 'trollito', 'trollaso',
  'careta', 'caretazo', 'careteada', 'careteo',
  'gil de goma', 'gilaso', 'gilún', 'gilastra', 'gilipollas',
  'rompero ortos', 'rompeculos', 'rompehuevos', 'rompebolas',
  'choro', 'chorito', 'chorra', 'chorro', 'chorizada',
  'boludo culiado', 'culiado boludo', 'la re culia',
  'qué culiado que sos', 'que culiado que sos', 'sos un culiado',
  'termo culiado', 'termo', 'terma', 'termín', 'termazo',
  'salame', 'salamín', 'salamin', 'salamazo', 'salame culiado',
  'cabeza de termo', 'cabeza de tacho', 'termo', 'termo culiado',
  'la re mil', 'la re putísima', 're putísima', 'la re culiada',
  'villero', 'villera', 'villa miseria', 'negro villero', 'villero culiado',
  'cabeza', 'cabecita', 'cabecita negra', 'cabeza de tacho',
  'choriplanero', 'choriplanera', 'ñoqui', 'ñoquis', 'chori',
  'vende patria', 'vendepatria', 'cipayo', 'gorila', 'cipayo culiado',
  'zurdo', 'zurdito', 'comunista de mierda', 'peroncho', 'peroncha',
  'kirchnerista', 'k', 'macrista', 'choriplaneros', 'kirchnerista culiado',
]

// Patrones sospechosos
const PATRONES_SPAM = [
  /https?:\/\/[^\s]+/gi, // URLs (se pueden permitir con moderación)
  /\b\d{10,}\b/g, // Números de teléfono largos
  /(.)\1{4,}/g, // Repetición excesiva de caracteres (aaaaa)
  /[A-Z]{5,}/g, // Muchas mayúsculas consecutivas
]

// Palabras que requieren contexto (no siempre son malas)
// NOTA: Estas palabras solo se permiten en contextos específicos
const PALABRAS_CONTEXTUALES: string[] = [
  // Ya no incluimos palabras discriminatorias aquí - todas se bloquean
]

export interface ModerationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedContent?: string
  severity: 'none' | 'low' | 'medium' | 'high'
}

/**
 * Valida y modera el contenido de texto
 */
export function moderateContent(content: string, strict: boolean = false): ModerationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let severity: 'none' | 'low' | 'medium' | 'high' = 'none'

  // Normalizar el contenido
  const normalizedContent = content.toLowerCase().trim()

  // 1. Validar longitud
  if (normalizedContent.length === 0) {
    errors.push('El contenido no puede estar vacío')
    return { isValid: false, errors, warnings, severity: 'high' }
  }

  if (normalizedContent.length < 3) {
    errors.push('El contenido es demasiado corto (mínimo 3 caracteres)')
    severity = 'medium'
  }

  if (normalizedContent.length > 5000) {
    errors.push('El contenido es demasiado largo (máximo 5000 caracteres)')
    severity = 'high'
  }

  // 2. Detectar palabras prohibidas
  const palabrasEncontradas: string[] = []
  
  PALABRAS_PROHIBIDAS.forEach(palabra => {
    // Buscar la palabra completa (con límites de palabra)
    const regex = new RegExp(`\\b${palabra}\\b`, 'gi')
    if (regex.test(normalizedContent)) {
      palabrasEncontradas.push(palabra)
    }
  })

  if (palabrasEncontradas.length > 0) {
    // Verificar si son palabras contextuales
    const palabrasGraves = palabrasEncontradas.filter(
      p => !PALABRAS_CONTEXTUALES.includes(p.toLowerCase())
    )

    if (palabrasGraves.length > 0) {
      errors.push(`Contenido inapropiado detectado. Por favor, usa un lenguaje respetuoso.`)
      severity = 'high'
    } else if (!strict) {
      warnings.push('Se detectaron palabras que podrían ser inapropiadas. Por favor, mantén un tono respetuoso.')
      severity = 'low'
    } else {
      errors.push('El contenido contiene lenguaje inapropiado')
      severity = 'medium'
    }
  }

  // 3. Detectar patrones de spam
  let spamDetected = false

  // URLs excesivas
  const urlMatches = content.match(/https?:\/\/[^\s]+/gi)
  if (urlMatches && urlMatches.length > 2) {
    warnings.push('Demasiados enlaces detectados. Esto podría ser considerado spam.')
    severity = severity === 'none' ? 'low' : severity
    spamDetected = true
  }

  // Repetición excesiva de caracteres
  if (/(.)\1{6,}/.test(content)) {
    errors.push('Evita la repetición excesiva de caracteres')
    severity = 'medium'
    spamDetected = true
  }

  // Mayúsculas excesivas (más del 50% del texto)
  const uppercaseCount = (content.match(/[A-Z]/g) || []).length
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length
  if (letterCount > 20 && uppercaseCount / letterCount > 0.5) {
    warnings.push('Evita escribir todo en mayúsculas. Puede interpretarse como gritar.')
    severity = severity === 'none' ? 'low' : severity
  }

  // 4. Detectar contenido vacío o sin sentido
  const palabras = content.split(/\s+/).filter(p => p.length > 0)
  if (palabras.length < 2 && content.length > 10) {
    warnings.push('El contenido parece incompleto')
    severity = 'low'
  }

  // 5. Detectar números de teléfono o emails (potencial spam)
  const phonePattern = /\b\d{8,}\b/g
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  
  if (phonePattern.test(content)) {
    warnings.push('Se detectó un posible número de teléfono. Evita compartir información personal pública.')
  }

  if (emailPattern.test(content) && !content.includes('@demos')) {
    warnings.push('Se detectó un email. Evita compartir información personal pública.')
  }

  // Resultado final
  const isValid = errors.length === 0

  return {
    isValid,
    errors,
    warnings,
    sanitizedContent: isValid ? content.trim() : undefined,
    severity
  }
}

/**
 * Sanitiza el contenido removiendo o reemplazando palabras prohibidas
 */
export function sanitizeContent(content: string): string {
  let sanitized = content

  PALABRAS_PROHIBIDAS.forEach(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'gi')
    sanitized = sanitized.replace(regex, '***')
  })

  return sanitized
}

/**
 * Verifica si el contenido es spam
 */
export function isSpam(content: string): boolean {
  const normalizedContent = content.toLowerCase()

  // Palabras clave de spam
  const spamKeywords = [
    'compra ahora',
    'haz clic',
    'gana dinero',
    'oferta limitada',
    'promoción exclusiva',
    'click here',
    'buy now'
  ]

  const hasSpamKeywords = spamKeywords.some(keyword => 
    normalizedContent.includes(keyword)
  )

  // URLs múltiples
  const urlCount = (content.match(/https?:\/\//g) || []).length
  const hasMultipleUrls = urlCount > 2

  // Repetición excesiva
  const hasExcessiveRepetition = /(.{3,})\1{3,}/.test(content)

  return hasSpamKeywords || hasMultipleUrls || hasExcessiveRepetition
}

/**
 * Verifica si el usuario está haciendo flood (múltiples mensajes rápidos)
 */
interface FloodCheck {
  userId: string
  timestamp: number
}

const recentMessages: FloodCheck[] = []

export function checkFlood(userId: string, maxMessages: number = 1, timeWindow: number = 10000): boolean {
  const now = Date.now()
  
  // Limpiar mensajes antiguos
  const validMessages = recentMessages.filter(
    msg => now - msg.timestamp < timeWindow
  )
  
  // Actualizar array
  recentMessages.length = 0
  recentMessages.push(...validMessages)
  
  // Contar mensajes del usuario
  const userMessages = recentMessages.filter(msg => msg.userId === userId)
  
  if (userMessages.length >= maxMessages) {
    return true // Es flood
  }
  
  // Agregar mensaje actual
  recentMessages.push({ userId, timestamp: now })
  
  return false
}

/**
 * Obtiene el tiempo restante del cooldown en segundos
 */
export function getCooldownRemaining(userId: string, timeWindow: number = 10000): number {
  const now = Date.now()
  
  // Buscar el último mensaje del usuario
  const userMessages = recentMessages.filter(
    msg => msg.userId === userId && now - msg.timestamp < timeWindow
  )
  
  if (userMessages.length === 0) {
    return 0 // No hay cooldown
  }
  
  // Obtener el timestamp del último mensaje
  const lastMessage = userMessages[userMessages.length - 1]
  const timeElapsed = now - lastMessage.timestamp
  const timeRemaining = timeWindow - timeElapsed
  
  return Math.ceil(timeRemaining / 1000) // Convertir a segundos
}

/**
 * Obtiene sugerencias para mejorar el contenido
 */
export function getContentSuggestions(content: string): string[] {
  const suggestions: string[] = []
  
  if (content.length < 10) {
    suggestions.push('Intenta ser más descriptivo en tu mensaje')
  }
  
  if (!/[.!?]$/.test(content.trim())) {
    suggestions.push('Considera terminar tu mensaje con puntuación apropiada')
  }
  
  const uppercaseCount = (content.match(/[A-Z]/g) || []).length
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length
  if (letterCount > 0 && uppercaseCount / letterCount > 0.3) {
    suggestions.push('Evita el uso excesivo de mayúsculas')
  }
  
  return suggestions
}

/**
 * Valida el título de una publicación
 */
export function validateTitle(title: string): ModerationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!title || title.trim().length === 0) {
    errors.push('El título no puede estar vacío')
    return { isValid: false, errors, warnings, severity: 'high' }
  }
  
  if (title.trim().length < 5) {
    errors.push('El título debe tener al menos 5 caracteres')
  }
  
  if (title.length > 200) {
    errors.push('El título es demasiado largo (máximo 200 caracteres)')
  }
  
  // Verificar palabras prohibidas en el título
  const contentCheck = moderateContent(title, true)
  
  return {
    isValid: errors.length === 0 && contentCheck.isValid,
    errors: [...errors, ...contentCheck.errors],
    warnings: [...warnings, ...contentCheck.warnings],
    sanitizedContent: contentCheck.isValid ? title.trim() : undefined,
    severity: contentCheck.severity
  }
}



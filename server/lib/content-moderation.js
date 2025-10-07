/**
 * Sistema de Moderación de Contenido - Backend
 * Filtra palabras ofensivas, spam y contenido inapropiado
 */

// Lista de palabras prohibidas - EXPANDIDA (sincronizada con frontend)
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
  'basura', 'escoria', 'parásito', 'parasito', 'rata', 'cucaracha'
];

// Palabras que requieren contexto
// NOTA: Lista reducida - somos más estrictos ahora
const PALABRAS_CONTEXTUALES = [
  // Ya no incluimos palabras discriminatorias aquí - todas se bloquean
];

/**
 * Valida el contenido de texto
 */
function moderateContent(content, strict = false) {
  const errors = [];
  const warnings = [];
  let severity = 'none';

  // Normalizar el contenido
  const normalizedContent = content.toLowerCase().trim();

  // 1. Validar longitud
  if (normalizedContent.length === 0) {
    errors.push('El contenido no puede estar vacío');
    return { isValid: false, errors, warnings, severity: 'high' };
  }

  if (normalizedContent.length < 3) {
    errors.push('El contenido es demasiado corto (mínimo 3 caracteres)');
    severity = 'medium';
  }

  if (normalizedContent.length > 5000) {
    errors.push('El contenido es demasiado largo (máximo 5000 caracteres)');
    severity = 'high';
  }

  // 2. Detectar palabras prohibidas
  const palabrasEncontradas = [];
  
  PALABRAS_PROHIBIDAS.forEach(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'gi');
    if (regex.test(normalizedContent)) {
      palabrasEncontradas.push(palabra);
    }
  });

  if (palabrasEncontradas.length > 0) {
    const palabrasGraves = palabrasEncontradas.filter(
      p => !PALABRAS_CONTEXTUALES.includes(p.toLowerCase())
    );

    if (palabrasGraves.length > 0) {
      errors.push('Contenido inapropiado detectado. Por favor, usa un lenguaje respetuoso.');
      severity = 'high';
    } else if (!strict) {
      warnings.push('Se detectaron palabras que podrían ser inapropiadas.');
      severity = 'low';
    } else {
      errors.push('El contenido contiene lenguaje inapropiado');
      severity = 'medium';
    }
  }

  // 3. Detectar patrones de spam
  // URLs excesivas
  const urlMatches = content.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches && urlMatches.length > 2) {
    warnings.push('Demasiados enlaces detectados.');
    severity = severity === 'none' ? 'low' : severity;
  }

  // Repetición excesiva de caracteres
  if (/(.)\1{6,}/.test(content)) {
    errors.push('Evita la repetición excesiva de caracteres');
    severity = 'medium';
  }

  // Mayúsculas excesivas
  const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 20 && uppercaseCount / letterCount > 0.5) {
    warnings.push('Evita escribir todo en mayúsculas.');
    severity = severity === 'none' ? 'low' : severity;
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    sanitizedContent: isValid ? content.trim() : null,
    severity
  };
}

/**
 * Verifica si el contenido es spam
 */
function isSpam(content) {
  const normalizedContent = content.toLowerCase();

  const spamKeywords = [
    'compra ahora',
    'haz clic',
    'gana dinero',
    'oferta limitada',
    'promoción exclusiva',
    'click here',
    'buy now'
  ];

  const hasSpamKeywords = spamKeywords.some(keyword => 
    normalizedContent.includes(keyword)
  );

  const urlCount = (content.match(/https?:\/\//g) || []).length;
  const hasMultipleUrls = urlCount > 2;

  const hasExcessiveRepetition = /(.{3,})\1{3,}/.test(content);

  return hasSpamKeywords || hasMultipleUrls || hasExcessiveRepetition;
}

/**
 * Middleware de moderación para Express
 */
function moderationMiddleware(options = {}) {
  const { 
    fieldName = 'mensaje', 
    strict = false,
    checkSpam = true 
  } = options;

  return (req, res, next) => {
    const content = req.body[fieldName];

    if (!content) {
      return res.status(400).json({ 
        error: 'El contenido es requerido' 
      });
    }

    // Validar contenido
    const result = moderateContent(content, strict);

    if (!result.isValid) {
      return res.status(400).json({ 
        error: result.errors[0] || 'Contenido inválido',
        errors: result.errors,
        warnings: result.warnings,
        severity: result.severity
      });
    }

    // Verificar spam
    if (checkSpam && isSpam(content)) {
      return res.status(400).json({ 
        error: 'El contenido fue detectado como spam'
      });
    }

    // Si pasa la validación, continuar
    next();
  };
}

/**
 * Middleware específico para validar títulos
 */
function titleModerationMiddleware(fieldName = 'titulo') {
  return (req, res, next) => {
    const title = req.body[fieldName];

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'El título no puede estar vacío' 
      });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({ 
        error: 'El título debe tener al menos 5 caracteres' 
      });
    }

    if (title.length > 200) {
      return res.status(400).json({ 
        error: 'El título es demasiado largo (máximo 200 caracteres)' 
      });
    }

    // Verificar palabras prohibidas en el título
    const result = moderateContent(title, true);

    if (!result.isValid) {
      return res.status(400).json({ 
        error: result.errors[0] || 'Título inválido',
        errors: result.errors
      });
    }

    next();
  };
}

// Sistema de rate limiting simple para prevenir flood
const userMessageTimestamps = new Map();

/**
 * Middleware para prevenir flood (múltiples mensajes rápidos)
 */
function antiFloodMiddleware(options = {}) {
  const {
    maxMessages = 5,
    timeWindow = 60000, // 1 minuto
    message = 'Estás enviando mensajes demasiado rápido. Por favor, espera un momento.'
  } = options;

  return (req, res, next) => {
    const userId = req.user?.id_usuario;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const now = Date.now();
    const userKey = userId.toString();

    // Obtener timestamps del usuario
    let timestamps = userMessageTimestamps.get(userKey) || [];

    // Filtrar timestamps dentro de la ventana de tiempo
    timestamps = timestamps.filter(ts => now - ts < timeWindow);

    // Verificar si excede el límite
    if (timestamps.length >= maxMessages) {
      return res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil((timestamps[0] + timeWindow - now) / 1000)
      });
    }

    // Agregar nuevo timestamp
    timestamps.push(now);
    userMessageTimestamps.set(userKey, timestamps);

    // Limpiar timestamps antiguos periódicamente
    if (Math.random() < 0.1) { // 10% de probabilidad
      cleanOldTimestamps(timeWindow);
    }

    next();
  };
}

/**
 * Limpia timestamps antiguos del Map
 */
function cleanOldTimestamps(timeWindow) {
  const now = Date.now();
  for (const [key, timestamps] of userMessageTimestamps.entries()) {
    const validTimestamps = timestamps.filter(ts => now - ts < timeWindow);
    if (validTimestamps.length === 0) {
      userMessageTimestamps.delete(key);
    } else {
      userMessageTimestamps.set(key, validTimestamps);
    }
  }
}

export {
  moderateContent,
  isSpam,
  moderationMiddleware,
  titleModerationMiddleware,
  antiFloodMiddleware
};


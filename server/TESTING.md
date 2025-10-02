# Guía de Testing - Demos+ Backend

## Configuración de Testing

Este proyecto utiliza **Jest** y **Supertest** para realizar tests unitarios y de integración de las APIs.

### Dependencias de Testing

- **Jest**: Framework de testing principal
- **Supertest**: Para testing de APIs HTTP
- **@jest/globals**: Funciones globales de Jest para ES modules
- **jest-environment-node**: Entorno Node.js para Jest
- **cross-env**: Para configurar variables de entorno multiplataforma

### Estructura de Tests

```
server/
├── src/
│   ├── __tests__/
│   │   ├── setup.js          # Configuración global de mocks
│   │   ├── auth.test.js       # Tests de autenticación
│   │   ├── forum.test.js      # Tests del foro
│   │   ├── oauth.test.js      # Tests de OAuth
│   │   └── mercadopago.test.js # Tests de MercadoPago
│   └── routes/
│       └── ongs.test.js       # Tests de ONGs (mejorado)
├── jest.config.js             # Configuración de Jest
└── TESTING.md                 # Esta guía
```

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar tests con coverage (cobertura de código)
npm run test:coverage

# Ejecutar tests con output detallado
npm run test:verbose
```

## Archivos de Test Creados

### 1. `src/__tests__/setup.js`
- Configuración global de mocks para Prisma, servicios de email, JWT, bcrypt, etc.
- Se ejecuta antes de cada test para limpiar mocks
- Define variables globales para acceder a los mocks

### 2. `src/__tests__/auth.test.js`
Tests completos para rutas de autenticación:
- ✅ Registro de usuarios (personas y ONGs)
- ✅ Login con validación de credenciales
- ✅ Obtener perfil de usuario autenticado
- ✅ Solicitar reset de contraseña
- ✅ Resetear contraseña con token
- ✅ Verificación de email
- ✅ Reenvío de email de verificación
- ✅ Actualización de perfil

### 3. `src/__tests__/forum.test.js`
Tests para funcionalidad del foro:
- ✅ Obtener categorías
- ✅ Obtener publicaciones formateadas
- ✅ Crear publicaciones (solo ONGs)
- ✅ Obtener publicación específica
- ✅ Manejo de ubicaciones JSON
- ✅ Validación de permisos

### 4. `src/__tests__/oauth.test.js`
Tests para autenticación OAuth:
- ✅ Endpoint `/me` para usuarios autenticados
- ✅ Validación de tokens JWT
- ✅ Manejo de advertencias para usuarios sin ubicación
- ✅ Diferentes proveedores OAuth (Google, Twitter)

### 5. `src/__tests__/mercadopago.test.js`
Tests para integración con MercadoPago:
- ✅ Crear preferencias de pago
- ✅ Manejo de errores de MercadoPago
- ✅ Validación de datos de entrada
- ✅ Conversión de tipos de datos
- ✅ Configuración de access token

### 6. `src/routes/ongs.test.js` (Mejorado)
Tests mejorados para API de ONGs:
- ✅ Obtener lista de ONGs con formato correcto
- ✅ Filtros por ubicación y tipo
- ✅ Obtener ONG específica por ID
- ✅ Manejo de datos faltantes
- ✅ Validación de respuestas formateadas

## Mocking Strategy

### Prisma Client
Todos los métodos de Prisma están mockeados:
```javascript
global.mockPrisma.usuario.findMany.mockResolvedValue(mockData);
```

### Servicios Externos
- **Email Service**: Mockeado para evitar envíos reales
- **Password Reset Service**: Mockeado
- **JWT**: Tokens simulados
- **bcrypt**: Hash simulado
- **UUID**: IDs simulados

### Variables de Entorno
```javascript
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
```

## Cobertura de Testing

Los tests cubren:

### ✅ Casos Exitosos
- Flujos principales de cada endpoint
- Respuestas correctas con datos válidos
- Autenticación y autorización

### ✅ Casos de Error
- Datos faltantes o inválidos
- Errores de base de datos
- Tokens inválidos o expirados
- Permisos insuficientes

### ✅ Casos Edge
- Datos null/undefined
- Strings vacíos
- Caracteres especiales
- Diferentes tipos de usuario

## Ejecutar Tests

1. **Instalar dependencias** (si no están instaladas):
```bash
cd server
npm install
```

2. **Ejecutar todos los tests**:
```bash
npm test
```

3. **Ver cobertura de código**:
```bash
npm run test:coverage
```

## Mejoras Futuras

### Tests de Integración
- Tests E2E con base de datos real
- Tests de OAuth con proveedores reales
- Tests de email con servicios reales

### Tests de Performance
- Tests de carga para endpoints críticos
- Tests de concurrencia
- Benchmarking de consultas

### Tests de Seguridad
- Tests de inyección SQL
- Tests de validación de entrada
- Tests de rate limiting

## Troubleshooting

### Error: "Cannot find module"
Asegúrate de que todas las dependencias estén instaladas:
```bash
npm install
```

### Error: "Jest encountered an unexpected token"
Verifica que la configuración de Jest en `jest.config.js` esté correcta para ES modules.

### Tests fallan por timeout
Aumenta el timeout en `jest.config.js`:
```javascript
testTimeout: 15000 // 15 segundos
```

### Mocks no funcionan
Verifica que `setup.js` se esté ejecutando correctamente y que los mocks estén definidos antes de importar los módulos.

## Contribuir

Al agregar nuevas funcionalidades:

1. **Crear tests** para nuevos endpoints
2. **Actualizar mocks** si se agregan nuevas dependencias
3. **Mantener cobertura** alta (>80%)
4. **Documentar** casos especiales en los tests

---

Para más información sobre Jest: https://jestjs.io/docs/getting-started
Para más información sobre Supertest: https://github.com/ladjs/supertest


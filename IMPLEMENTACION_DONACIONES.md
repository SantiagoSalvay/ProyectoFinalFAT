# 📋 Implementación Completa del Sistema de Donaciones

## Resumen de Cambios

Se ha implementado un sistema completo de donaciones que resuelve los 5 problemas críticos identificados:

1. ✅ **Donaciones no-monetarias ahora se guardan en BD**
2. ✅ **Mercado Pago donation flow completamente mejorado**
3. ✅ **Ranking page deduplicada y posiciones corregidas**
4. ✅ **Puntos calculados correctamente al evaluar donaciones**
5. ✅ **Ranking se recalcula automáticamente**

---

## Archivos Modificados / Creados

### 1. **server/src/routes/donations.js** (NUEVO)

**Propósito:** Manejo de donaciones no-monetarias

**Endpoints:**
- `POST /api/donations` - Crear donación no-monetaria
- `GET /api/donations/my-donations` - Listar donaciones del usuario

**Lógica Clave:**
```javascript
POST /api/donations
{
  ongId: number,        // ID de la ONG receptora
  donationType: string, // "dinero", "ropa", "juguetes", "comida", "muebles", "otros"
  itemDescription: string,
  cantidad: number
}

// Respuesta:
{
  success: true,
  pedidoDonacion: {
    id_pedido: number,
    estado_evaluacion: "pendiente",
    puntos_otorgados: 0 // Se calcula cuando ONG evalúa
  }
}
```

**Validaciones:**
- Requiere autenticación (JWT)
- Valida que ONG existe y es de tipo 2
- Crea `PedidoDonacion` en estado "pendiente"
- Inicializa `DetalleUsuario` si no existe

---

### 2. **client/src/pages/Donaciones.tsx** (MODIFICADO)

**Cambios:**
- Ahora requiere autenticación para TODAS las donaciones (no solo monetarias)
- Donaciones no-monetarias: POST a `/api/donations` (antes: solo UI)
- Valida `donationType` seleccionado
- Muestra éxito con información de puntos pendientes
- Limpia formulario después de envío exitoso
- Maneja errores del servidor

**Flujo Actualizado:**
```
Llenar formulario → Validar auth → POST /api/donations → 
Guardar en BD → Mostrar éxito → Limpiar formulario
```

---

### 3. **server/src/index.js** (MODIFICADO)

**Cambios:**
```javascript
// Línea ~17: Agregado import
import donationsRoutes from "./routes/donations.js";

// Línea ~113: Agregado registro de rutas
app.use("/api", donationsRoutes);
```

**Efecto:** Endpoints `/api/donations` accesibles

---

### 4. **server/src/routes/payments.js** (MODIFICADO)

**Cambios Principales:**

#### A) Creación de PedidoDonacion ANTES de MP preference
```javascript
// PASO 1: Crear PedidoDonacion primero
const dineroTipo = await prisma.tipoDonacion.findFirst({
  where: { tipo_donacion: 'Dinero' }
});

const pedidoDonacion = await prisma.pedidoDonacion.create({
  data: {
    // ... campos necesarios ...
    estado_evaluacion: 'pendiente'
  }
});

// PASO 2: Guardar ID del pedido en metadata MP
const body = {
  items: [...],
  metadata: {
    ongId: String(ongId),
    donorId: String(req.user.id_usuario),
    pedidoId: String(pedidoDonacion.id_pedido)  // ← NUEVO
  }
};
```

#### B) Optimización de processPaymentFromMP
```javascript
// Antes: Buscaba pedido por timestamp (ineficiente)
// Ahora: Usa ID directo desde metadata
const pedidoDonacion = await prisma.pedidoDonacion.findUnique({
  where: { id_pedido: parseInt(pedidoId) }
  // ... 30 líneas menos de búsqueda
});
```

#### C) Validación de ownership
```javascript
// Valida que el pedido pertenece a los usuarios correctos
if (pedidoDonacion.id_usuario !== parseInt(donorId) || 
    pedidoDonacion.publicacionEtiqueta.publicacion.id_usuario !== parseInt(ongId)) {
  return { success: false, message: 'Validación de propietarios fallida' };
}
```

#### D) Actualización simplificada de callbacks
- GET `/mp/process-payment`: Simplificado, busca ONGs con MP habilitado
- POST `/mp/callback`: Mismo patrón optimizado

**Resultado:** Donaciones monetarias se guardan correctamente en BD y se evalúan automáticamente al recibir pago

---

### 5. **client/src/pages/RankingPage.tsx** (PREVIAMENTE MODIFICADO)

**Funciones Helper:**
```javascript
const dedupeByUserId = (users) => {
  const deduped = {};
  users.forEach(user => {
    if (!deduped[user.id_usuario] || deduped[user.id_usuario].puntos < user.puntos) {
      deduped[user.id_usuario] = user;
    }
  });
  return Object.values(deduped);
};

const assignSequentialPositions = (users) => {
  return users
    .sort((a, b) => b.puntos - a.puntos)
    .map((user, idx) => ({ ...user, puesto: idx + 1 }));
};
```

**Aplicación:** En 3 puntos donde se cargan rankings:
1. Fetch inicial
2. Después de recalcular
3. Lista admin de usuarios

**Resultado:** Sin duplicados, posiciones secuenciales (1, 2, 3...)

---

## Flujo Completo de Datos

### Donación No-Monetaria
```
Frontend: Llenar formulario (ONG, tipo, descripción, cantidad)
    ↓
Frontend: POST /api/donations { ongId, donationType, itemDescription, cantidad }
    ↓
Backend: Validar auth + ONG existe
    ↓
Backend: Crear PedidoDonacion en BD (estado='pendiente')
    ↓
Frontend: Mostrar éxito "Tu donación está pendiente de evaluación"
    ↓
ONG: Evalúa donación vía POST /api/ranking/evaluar-donacion
    ↓
Backend: Calcula puntos = cantidad × tipoDonacion.puntos
    ↓
Backend: Actualiza estado a 'aprobada' + puntos_otorgados
    ↓
Backend: Incrementa puntosActuales en DetalleUsuario
    ↓
Ranking: Se recalcula → Usuario aparece con puntos
```

### Donación Monetaria (Mercado Pago)
```
Frontend: POST /api/payments/mp/create { ongId, description, amount }
    ↓
Backend: Valida token MP de la ONG
    ↓
Backend: Crea PedidoDonacion (estado='pendiente')
    ↓
Backend: Crea preferencia MP con metadata { pedidoId, ongId, donorId }
    ↓
Frontend: Redirige a init_point (MP Checkout)
    ↓
Usuario: Completa pago en MP
    ↓
MP: Callback a GET /mp/process-payment o POST /mp/callback
    ↓
Backend: Obtiene paymentData con metadata
    ↓
Backend: Encuentra PedidoDonacion por pedidoId
    ↓
Backend: Si status='approved' → estado='aprobada', calcula puntos
    ↓
Backend: Incrementa puntosActuales
    ↓
Frontend: Redirige a /donaciones/exito
```

---

## Tipos de Donación Soportados

| ID | Tipo | Campo BD |
|---|---|---|
| 1 | Dinero | 'Dinero' |
| 2 | Ropa | 'Ropa' |
| 3 | Juguetes | 'Juguetes' |
| 4 | Comida | 'Comida' |
| 5 | Muebles | 'Muebles' |
| 6 | Otros | 'Otros' |

**Mapping Frontend:**
```javascript
const DONATION_TYPES = {
  'dinero': 1,
  'ropa': 2,
  'juguetes': 3,
  'comida': 4,
  'muebles': 5,
  'otros': 6
};
```

---

## Puntos y Ranking

**Cálculo de Puntos:**
```
puntos_otorgados = cantidad × tipoDonacion.puntos
```

**Actualización de Ranking:**
```javascript
// En DetalleUsuario:
puntosActuales += puntos_otorgados
ultima_fecha_actualizacion = new Date()
```

**Recalcular Ranking:**
```bash
POST /api/ranking/recalcular (público, sin auth)
```

---

## Validaciones Implementadas

### Donaciones No-Monetarias
- ✅ Usuario autenticado
- ✅ ONG existe y es válida (tipo_usuario = 2)
- ✅ Tipo de donación válido (1-6)
- ✅ Descripción no vacía
- ✅ Cantidad > 0

### Donaciones Monetarias (MP)
- ✅ Usuario autenticado
- ✅ ONG existe y tipo_usuario = 2
- ✅ ONG tiene MP habilitado (mp_enabled = true)
- ✅ Token MP está encriptado correctamente
- ✅ Amount > 0
- ✅ Metadata en pago completa (ongId, donorId, pedidoId)
- ✅ Validación de ownership en callback

---

## Manejo de Errores

### Casos Cubiertos

1. **ONG no encontrada**
   - Status: 404
   - Mensaje: "ONG no válida"

2. **ONG sin MP habilitado**
   - Status: 400
   - Mensaje: "La ONG no está habilitada para recibir donaciones monetarias"

3. **Token MP corrupto**
   - Status: 500
   - Mensaje: "Error al acceder a la configuración de pagos de la ONG"
   - Hint: "La ONG debe reconfigurar su token de MercadoPago"

4. **Pago sin metadata**
   - Log: ⚠️ Metadata incompleta
   - Acción: Skip, no procesar
   - Respuesta: 200 OK (no reintentar)

5. **Pedido no encontrado**
   - Log: ⚠️ id_pedido no existe
   - Acción: Intentar siguiente ONG
   - Respuesta: Redirigir a error

---

## Testing Recomendado

```bash
# 1. Test donación no-monetaria
POST http://localhost:3000/api/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "ongId": 1,
  "donationType": "ropa",
  "itemDescription": "5 camisetas",
  "cantidad": 5
}

# Respuesta esperada: 201 Created con id_pedido

# 2. Verificar en BD
SELECT * FROM "PedidoDonacion" WHERE estado_evaluacion = 'pendiente';

# 3. Evaluar donación (como ONG)
POST http://localhost:3000/api/ranking/evaluar-donacion
Authorization: Bearer <ong_token>
Content-Type: application/json

{
  "id_pedido": 1,
  "puntos_otorgados": 25,
  "aceptada": true
}

# 4. Verificar puntos actualizados
SELECT puntos FROM "DetalleUsuario" WHERE id_usuario = 1;

# 5. Recalcular ranking
POST http://localhost:3000/api/ranking/recalcular

# 6. Verificar ranking
GET http://localhost:3000/api/ranking
```

---

## Notas Importantes

- **Donaciones en estado 'pendiente'** no suman puntos en ranking
- **Donaciones evaluadas como 'aprobada'** suman puntos inmediatamente
- **Ranking se recalcula** al llamar `/api/ranking/recalcular`
- **MP callbacks son idempotentes** (no procesan 2x si ya están 'aprobada')
- **Deduplicación de ranking** elimina duplicados y reasigna posiciones secuenciales

---

## Archivos Base de Datos Requeridos

Asegúrate de que existan en BD:
- `TipoDonacion` (con 6 tipos: Dinero, Ropa, Juguetes, Comida, Muebles, Otros)
- `PedidoDonacion` (con campos: id_pedido, id_usuario, id_tipo_donacion, estado_evaluacion, puntos_otorgados)
- `DetalleUsuario` (con campos: id_usuario, puntosActuales, ultima_fecha_actualizacion)

Consulta `server/prisma/schema.prisma` para estructura completa.

---

**Implementación completada: ✅ 2024**

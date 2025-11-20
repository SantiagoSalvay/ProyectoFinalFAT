# 🚀 QUICK START - Sistema de Donaciones

## ⚡ TL;DR - Lo que cambió

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| Donaciones no-monetarias | Solo UI, no se guardaban | Se guardan en BD con `POST /api/donations` |
| Mercado Pago | Pedido creado después de preferencia | Pedido creado ANTES, ID en metadata |
| Búsqueda de pedidos en callback | Búsqueda por timestamp (lenta) | Búsqueda por ID desde metadata (rápida) |
| Puntos en ranking | No se calculaban | Se calculan automáticamente |
| Ranking | Duplicados + saltos | Deduplicado + posiciones secuenciales |
| Recalcular rankings | Solo admin | Público para todos |

---

## 📍 Archivos Nuevos

```
✅ server/src/routes/donations.js (150+ líneas)
✅ IMPLEMENTACION_DONACIONES.md (documentación técnica)
✅ TESTING_GUIDE.md (9 tests detallados)
✅ RESUMEN_EJECUCION.md (este archivo)
```

---

## 🔧 Archivos Modificados

```
✏️ client/src/pages/Donaciones.tsx (auth completa + POST /api/donations)
✏️ server/src/index.js (import + register donations route)
✏️ server/src/routes/payments.js (PedidoDonacion ANTES de MP)
✏️ README.md (nuevas secciones de donaciones)
```

---

## 🧪 Test Rápido (3 pasos)

### Paso 1: Token de usuario
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')
echo $TOKEN
```

### Paso 2: Crear donación
```bash
curl -X POST http://localhost:3000/api/donations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 1,
    "donationType": "ropa",
    "itemDescription": "10 camisetas",
    "cantidad": 10
  }'
```

### Paso 3: Verificar en BD
```bash
# En postgres:
SELECT * FROM "PedidoDonacion" ORDER BY fecha_donacion DESC LIMIT 1;
```

✅ **Si ves un registro con `estado_evaluacion = 'pendiente'` → ¡ÉXITO!**

---

## 🎯 Tipos de Donación

```
dinero      → Donación monetaria (vía MP)
ropa        → Prendas de vestir
juguetes    → Juguetes y entretenimiento
comida      → Alimentos
muebles     → Muebles y enseres
otros       → Otros artículos
```

---

## 📊 Flujo Visual

```
┌─────────────────┐
│  USUARIO DONA   │
└────────┬────────┘
         │
    ┌────▼────┐
    │¿Dinero? │
    └┬───────┬┘
  SÍ│       │NO
    │       └──────────────────┐
    │                          │
    ▼                          ▼
┌─────────────────┐    ┌────────────────┐
│ Crear pedido    │    │ POST /donations│
│ Preferencia MP  │    └────────┬────────┘
│ Usuario paga    │             │
└────────┬────────┘             ▼
         │             ┌─────────────────┐
         │             │ Crear pedido    │
         │             │ Estado: pending │
         │             └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Esperar evaluación │
         │  de la ONG          │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ ONG evalúa donación  │
         │ Estado: aprobada     │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Calcular puntos      │
         │ Sumar al usuario     │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Actualizar ranking   │
         │ Usuario aparece ↑    │
         └──────────────────────┘
```

---

## 🔑 Endpoints Principales

### No-monetarias
```
POST /api/donations
GET /api/donations/my-donations
```

### Monetarias (MP)
```
POST /api/payments/mp/create
GET /api/payments/mp/process-payment (callback)
POST /api/payments/mp/callback (webhook)
```

### Ranking
```
POST /api/ranking/recalcular (ahora público)
GET /api/ranking
```

---

## ✅ Validaciones

Cada donación valida:
- ✅ Usuario autenticado
- ✅ ONG existe y es válida
- ✅ Tipo de donación válido
- ✅ Cantidad > 0
- ✅ Descripción no vacía

---

## 🐛 Si Algo Falla

### "ONG no válida" (404)
```bash
# Verificar ONG existe:
SELECT id_usuario, nombre_usuario, id_tipo_usuario 
FROM "Usuario" WHERE id_tipo_usuario = 2;
```

### "No autorizado" (401)
```bash
# Regenerar token:
curl -X POST http://localhost:3000/api/auth/login ...
```

### No aparece en BD
```bash
# Ver logs:
tail -f server.log | grep -i donation
```

### Puntos no se calculan
```bash
# Verificar donación aprobada:
SELECT estado_evaluacion, puntos_otorgados 
FROM "PedidoDonacion" WHERE id_pedido = 1;
```

---

## 📚 Documentación Completa

1. **TESTING_GUIDE.md** ← 9 tests detallados con ejemplos
2. **IMPLEMENTACION_DONACIONES.md** ← Documentación técnica
3. **RESUMEN_EJECUCION.md** ← Estado final del proyecto
4. **README.md** ← Ejemplos en secciones "Sistema de Donaciones"

---

## 🚀 Próximos Pasos

1. **Test:** Ejecutar tests según TESTING_GUIDE.md
2. **Verificar:** Revisar logs y BD después de cada test
3. **Reportar:** Si algo falla, adjuntar:
   - Error message exacto
   - HTTP status code
   - Logs del servidor
   - Consulta SQL que hiciste

---

## 💡 Tips de Debugging

### Ver logs detallados
```bash
# Terminal del server:
# Busca estos logs:
✅ PedidoDonacion creado antes de MP: id_pedido=X
✅ Pago procesado correctamente: paymentId=Y
⚠️ Metadata incompleta en pago
```

### Verificar BD en tiempo real
```bash
# Terminal SQL:
SELECT * FROM "PedidoDonacion" ORDER BY fecha_donacion DESC;
SELECT id_usuario, puntosActuales FROM "DetalleUsuario";
SELECT * FROM "Usuario" WHERE id_tipo_usuario = 2;
```

### Logs de frontend
```javascript
// Browser console (F12):
// Mira requests a /api/donations en Network tab
```

---

## 📞 Contacto / Dudas

Si algo no funciona:
1. Leer TESTING_GUIDE.md (sección Troubleshooting)
2. Verificar logs del servidor
3. Consultar BD directamente
4. Revisar IMPLEMENTACION_DONACIONES.md (sección Validaciones)

---

**Última actualización:** 2024
**Status:** ✅ LISTO PARA TESTING

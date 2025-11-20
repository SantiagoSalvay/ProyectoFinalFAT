# 🧪 Guía de Testing - Sistema de Donaciones

## Pre-requisitos

1. Backend corriendo en `http://localhost:3000`
2. Frontend corriendo en `http://localhost:5173` (o el puerto que uses)
3. Base de datos PostgreSQL con migrations ejecutadas
4. Token JWT de usuario donante (regular user)
5. Token JWT de usuario ONG (tipo_usuario = 2)
6. Mercado Pago sandbox credenciales (opcional, para test MP)

---

## Test 1: Donación No-Monetaria (Ropa)

### Pasos:

1. **Obtener token de usuario regular:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "donor@test.com", "password": "password123"}'
   
   # Guardar token en variable:
   # TOKEN_DONOR="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Obtener ID de una ONG:**
   ```bash
   curl -X GET http://localhost:3000/api/users/search?tipo=2 \
     -H "Authorization: Bearer $TOKEN_DONOR"
   
   # Buscar ONG en response, tomar id_usuario (ej: ONG_ID=5)
   ```

3. **Enviar donación no-monetaria:**
   ```bash
   curl -X POST http://localhost:3000/api/donations \
     -H "Authorization: Bearer $TOKEN_DONOR" \
     -H "Content-Type: application/json" \
     -d '{
       "ongId": 5,
       "donationType": "ropa",
       "itemDescription": "10 camisetas azules talla M",
       "cantidad": 10
     }'
   ```

4. **Respuesta esperada:**
   ```json
   {
     "success": true,
     "message": "Donación registrada exitosamente",
     "pedidoDonacion": {
       "id_pedido": 1,
       "id_usuario": 2,
       "id_tipo_donacion": 2,
       "cantidad": 10,
       "estado_evaluacion": "pendiente",
       "puntos_otorgados": null,
       "fecha_donacion": "2024-01-15T10:30:00.000Z"
     }
   }
   ```

5. **Verificar en BD:**
   ```sql
   SELECT * FROM "PedidoDonacion" 
   WHERE id_usuario = 2 AND id_tipo_donacion = 2 
   ORDER BY fecha_donacion DESC LIMIT 1;
   
   -- Esperado: estado_evaluacion = 'pendiente', puntos_otorgados = NULL
   ```

6. **Verificar en frontend:**
   - Ir a `http://localhost:5173/donaciones`
   - Llenar formulario: ONG = "Nombre ONG", Tipo = "Ropa", Descripción = "10 camisetas", Cantidad = 10
   - Click "Donar"
   - Ver mensaje: "✅ Donación registrada! Tu donación está pendiente de evaluación por la ONG"

---

## Test 2: Donación No-Monetaria (Otros Tipos)

Repetir Test 1 con diferentes tipos:

```bash
# Donación de comida
curl -X POST http://localhost:3000/api/donations \
  -H "Authorization: Bearer $TOKEN_DONOR" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 5,
    "donationType": "comida",
    "itemDescription": "50 kg de arroz",
    "cantidad": 50
  }'

# Donación de juguetes
curl -X POST http://localhost:3000/api/donations \
  -H "Authorization: Bearer $TOKEN_DONOR" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 5,
    "donationType": "juguetes",
    "itemDescription": "Bloques de construcción x20",
    "cantidad": 20
  }'
```

---

## Test 3: Evaluación de Donación por ONG

### Pasos:

1. **Obtener token de ONG:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "ong@test.com", "password": "password123"}'
   
   # TOKEN_ONG="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Verificar donaciones pendientes:**
   ```bash
   curl -X GET http://localhost:3000/api/donations/my-donations \
     -H "Authorization: Bearer $TOKEN_ONG"
   ```

3. **Evaluar donación como aprobada:**
   ```bash
   curl -X POST http://localhost:3000/api/ranking/evaluar-donacion \
     -H "Authorization: Bearer $TOKEN_ONG" \
     -H "Content-Type: application/json" \
     -d '{
       "id_pedido": 1,
       "aceptada": true
     }'
   ```

4. **Respuesta esperada:**
   ```json
   {
     "success": true,
     "message": "Donación evaluada y puntos asignados",
     "puntos_asignados": 50
   }
   ```

5. **Verificar en BD:**
   ```sql
   SELECT * FROM "PedidoDonacion" WHERE id_pedido = 1;
   
   -- Esperado: 
   -- estado_evaluacion = 'aprobada'
   -- puntos_otorgados = 50 (o según cantidad × tipo.puntos)
   
   SELECT puntos FROM "DetalleUsuario" WHERE id_usuario = 2;
   -- Puntos debe aumentar en 50
   ```

---

## Test 4: Recalcular Ranking

### Pasos:

1. **Recalcular ranking (público):**
   ```bash
   curl -X POST http://localhost:3000/api/ranking/recalcular
   ```

2. **Respuesta esperada:**
   ```json
   {
     "message": "Rankings recalculados correctamente"
   }
   ```

3. **Verificar ranking:**
   ```bash
   curl -X GET http://localhost:3000/api/ranking
   ```

4. **Respuesta debe incluir:**
   ```json
   {
     "ranking": [
       {
         "id_usuario": 2,
         "nombre_usuario": "Donor Name",
         "puntos": 50,
         "puesto": 1
       },
       ...
     ]
   }
   ```

5. **En frontend:**
   - Ir a `http://localhost:5173/ranking`
   - Debe mostrarse usuario con 50 puntos en puesto #1
   - Sin duplicados
   - Posiciones secuenciales (1, 2, 3...)

---

## Test 5: Donación Monetaria (Mercado Pago)

> **Nota:** Requiere credenciales de sandbox de MP

### Pasos:

1. **Configurar ONG con token MP (opcionalmente desde admin):**
   ```bash
   # Saltar este paso si ONG ya tiene MP configurado
   ```

2. **Crear preferencia MP:**
   ```bash
   curl -X POST http://localhost:3000/api/payments/mp/create \
     -H "Authorization: Bearer $TOKEN_DONOR" \
     -H "Content-Type: application/json" \
     -d '{
       "ongId": 5,
       "description": "Donación monetaria para Proyecto X",
       "amount": 100,
       "quantity": 1
     }'
   ```

3. **Respuesta esperada:**
   ```json
   {
     "id": "987654321",
     "init_point": "https://www.mercadopago.com/mla/checkout/start?pref_id=987654321"
   }
   ```

4. **Verificar PedidoDonacion creado:**
   ```sql
   SELECT * FROM "PedidoDonacion" 
   WHERE id_usuario = 2 AND id_tipo_donacion = 1 
   ORDER BY fecha_donacion DESC LIMIT 1;
   
   -- Esperado: 
   -- estado_evaluacion = 'pendiente'
   -- cantidad = 100 (el monto)
   ```

5. **En frontend (simulado):**
   - Click "Donar dinero"
   - Completar datos
   - Click "Pagar con MP"
   - Redirige a MP Checkout
   - Completar pago (usar credenciales sandbox: 4235647728025682)
   - Redirige de vuelta a `/donaciones/exito` o `/donaciones/error`

6. **Después del pago (Sandbox):**
   ```sql
   -- El estado DEBE cambiar a 'aprobada'
   SELECT estado_evaluacion, puntos_otorgados FROM "PedidoDonacion" 
   WHERE id_pedido = 2;
   
   -- Los puntos DEBEN calcularse automáticamente
   SELECT puntos FROM "DetalleUsuario" WHERE id_usuario = 2;
   ```

---

## Test 6: Deduplicación de Ranking

### Pasos:

1. **Crear varios donantes con mismo ID (simular duplicado):**
   ```sql
   -- Insertar registros duplicados manualmente (para simular el bug anterior)
   -- Nota: Esto normalmente no pasaría con el nuevo código
   ```

2. **Recalcular ranking:**
   ```bash
   curl -X POST http://localhost:3000/api/ranking/recalcular
   ```

3. **Verificar deduplicación:**
   ```bash
   curl -X GET http://localhost:3000/api/ranking
   ```

4. **Respuesta debe tener:**
   - ✅ Cada `id_usuario` aparece una sola vez
   - ✅ Se mantiene el registro con mayor `puntos`
   - ✅ `puesto` es secuencial (1, 2, 3, 4...)
   - ✅ Ordenado por puntos descendente

---

## Test 7: Listado de Mis Donaciones

### Pasos:

1. **Obtener token de donante:**
   ```bash
   TOKEN_DONOR="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Listar donaciones del usuario:**
   ```bash
   curl -X GET http://localhost:3000/api/donations/my-donations \
     -H "Authorization: Bearer $TOKEN_DONOR"
   ```

3. **Respuesta esperada:**
   ```json
   {
     "donations": [
       {
         "id_pedido": 1,
         "tipoNombre": "Ropa",
         "descripcion": "10 camisetas azules",
         "cantidad": 10,
         "ongNombre": "Fundación XYZ",
         "estado": "aprobada",
         "puntos": 50,
         "fecha": "2024-01-15T10:30:00.000Z"
       },
       {
         "id_pedido": 2,
         "tipoNombre": "Dinero",
         "descripcion": "Donación monetaria",
         "cantidad": 100,
         "ongNombre": "Fundación ABC",
         "estado": "pendiente",
         "puntos": null,
         "fecha": "2024-01-15T11:45:00.000Z"
       }
     ]
   }
   ```

---

## Test 8: Validaciones de Error

### Test 8.1: ONG no válida
```bash
curl -X POST http://localhost:3000/api/donations \
  -H "Authorization: Bearer $TOKEN_DONOR" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 999,
    "donationType": "ropa",
    "itemDescription": "Test",
    "cantidad": 5
  }'

# Respuesta esperada: 404 Not Found
# "error": "ONG no encontrada"
```

### Test 8.2: Tipo de donación inválido
```bash
curl -X POST http://localhost:3000/api/donations \
  -H "Authorization: Bearer $TOKEN_DONOR" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 5,
    "donationType": "bitcoin",
    "itemDescription": "Test",
    "cantidad": 5
  }'

# Respuesta esperada: 400 Bad Request
# "error": "Tipo de donación no válido"
```

### Test 8.3: Sin autenticación
```bash
curl -X POST http://localhost:3000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 5,
    "donationType": "ropa",
    "itemDescription": "Test",
    "cantidad": 5
  }'

# Respuesta esperada: 401 Unauthorized
# "error": "No autorizado"
```

---

## Test 9: Flujo Completo de Usuario

### Escenario: Juan dona, se evalúa, aparece en ranking

1. **Juan (donante) dona ropa:**
   ```bash
   curl -X POST http://localhost:3000/api/donations \
     -H "Authorization: Bearer $JUAN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "ongId": 1,
       "donationType": "ropa",
       "itemDescription": "Bolsa de ropa",
       "cantidad": 15
     }'
   # Respuesta: id_pedido = 10
   ```

2. **María (ONG) evalúa donación:**
   ```bash
   curl -X POST http://localhost:3000/api/ranking/evaluar-donacion \
     -H "Authorization: Bearer $MARIA_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "id_pedido": 10,
       "aceptada": true
     }'
   # Puntos calculados = 15 × 5 = 75 (si ropa = 5 puntos)
   ```

3. **Recalcular ranking:**
   ```bash
   curl -X POST http://localhost:3000/api/ranking/recalcular
   ```

4. **Verificar Juan en ranking:**
   ```bash
   curl -X GET http://localhost:3000/api/ranking | grep -A 5 '"nombre_usuario": "Juan"'
   # Debe mostrar: puntos: 75, puesto: X
   ```

5. **Juan verifica sus donaciones:**
   ```bash
   curl -X GET http://localhost:3000/api/donations/my-donations \
     -H "Authorization: Bearer $JUAN_TOKEN"
   # Debe mostrar: id_pedido: 10, estado: "aprobada", puntos: 75
   ```

---

## Checklist de Validación

- [ ] Donación no-monetaria se guarda en BD
- [ ] Donación aparece en estado 'pendiente'
- [ ] ONG puede evaluar y cambiar a 'aprobada'
- [ ] Puntos se calculan correctamente (cantidad × tipo.puntos)
- [ ] Puntos se incrementan en DetalleUsuario
- [ ] Ranking se recalcula y usuario aparece
- [ ] Sin duplicados en ranking
- [ ] Posiciones secuenciales (1,2,3...)
- [ ] Donación monetaria se guarda con MP
- [ ] MP callback actualiza estado a 'aprobada'
- [ ] MP callback calcula puntos automáticamente
- [ ] Validaciones de error funcionan
- [ ] Usuarios no autenticados no pueden donar
- [ ] ONG sin MP no puede recibir donaciones monetarias

---

## Troubleshooting

### ❌ "ONG no válida" (404)
**Causas:**
- ONG no existe
- tipo_usuario ≠ 2
- ID incorrecto

**Solución:** Verificar en BD:
```sql
SELECT id_usuario, nombre_usuario, id_tipo_usuario 
FROM "Usuario" WHERE id_tipo_usuario = 2;
```

### ❌ "No autorizado" (401)
**Causas:**
- Token expirado
- Token inválido
- Sin header Authorization

**Solución:** Regenerar token con login fresco

### ❌ Donación no aparece en BD
**Causas:**
- Request falló (verificar status code)
- BD desconectada
- Prisma schema incorrecta

**Solución:**
```bash
# Ver logs del servidor
tail -f server.log | grep -i donation

# Verificar conexión BD
npm run db:seed # Si hay script
```

### ❌ Puntos no se calculan
**Causas:**
- Donación no está 'aprobada'
- TipoDonacion no tiene puntos configurados
- DetalleUsuario no existe

**Solución:**
```sql
-- Verificar puntos por tipo
SELECT * FROM "TipoDonacion";

-- Verificar donación
SELECT estado_evaluacion, puntos_otorgados 
FROM "PedidoDonacion" WHERE id_pedido = 1;

-- Crear DetalleUsuario si no existe
INSERT INTO "DetalleUsuario" (id_usuario, puntosActuales)
VALUES (2, 0);
```

---

## Logs Útiles

Buscar en servidor estos logs para debugging:

```
✅ PedidoDonacion creado antes de MP: id_pedido=X
✅ Pago procesado correctamente: paymentId=Y
⚠️ Metadata incompleta en pago
⚠️ No se encontró pedidoDonacion con id_pedido=Z
```

---

**Última actualización:** 2024

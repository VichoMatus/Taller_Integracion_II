# 📡 Endpoints Requeridos - Panel Admin

**Fecha:** 20 de octubre de 2025  
**Branch:** `frontend/fin-sprint`  
**Prioridad:** Alta

---

## 🎯 Resumen

Se requieren mejoras en la API de FastAPI para completar la funcionalidad del panel de administración:

1. ✅ **Complejos:** Crear endpoint para obtener complejos de un administrador
2. ✅ **Canchas:** Modificar endpoint para incluir canchas inactivas
3. ✅ **Reservas:** Verificar endpoints admin (algunos pueden estar faltando)
4. ✅ **Reseñas:** Verificar endpoints admin (algunos pueden estar faltando)

---

## 1️⃣ Endpoint: Obtener Complejos por Administrador

### ❌ Problema

El formulario de crear canchas requiere ingresar **manualmente el ID del complejo** (mala UX).

### ✅ Solución

Crear endpoint que devuelva solo los complejos del admin logueado.

### 📍 Especificación

**Ruta FastAPI:**
```
GET /complejos/duenio/{duenio_id}
```

**Parámetros:**
- `duenio_id` (int) - ID del administrador/dueño

**Autenticación:** Requerida (JWT)

**Query ejemplo:**
```python
@router.get("/complejos/duenio/{duenio_id}")
async def get_complejos_by_duenio(
    duenio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar permisos
    if current_user.id != duenio_id and current_user.rol != "super_admin":
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    # Obtener complejos
    complejos = db.query(Complejo).filter(
        Complejo.duenio_id == duenio_id
    ).all()
    
    if not complejos:
        raise HTTPException(status_code=404, detail="Sin complejos")
    
    return complejos
```

**Respuesta esperada:**
```json
[
  {
    "id_complejo": 1,
    "nombre": "Complejo SportHub Temuco",
    "direccion": "Av. Alemania 0945",
    "comuna": "Temuco",
    "duenio_id": 5,
    "activo": true
  }
]
```

**Códigos HTTP:**
- `200` - OK
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Sin complejos
- `500` - Error servidor

### 🔧 Estado BFF

✅ **El BFF ya está implementado** y esperando este endpoint:
- Ruta: `GET /api/complejos/admin/:adminId`
- Archivo: `backend/src/complejos/infrastructure/ComplejoApiRepository.ts`
- Línea: 107

### 🧪 Testing

```bash
# 1. Login como admin
POST /auth/login
Body: { "email": "dueno.cancha@gmail.com", "password": "..." }

# 2. Obtener complejos
GET /complejos/duenio/5
Headers: { "Authorization": "Bearer {token}" }

# Debe devolver array de complejos
```

---

## 2️⃣ Modificación: Listado de Canchas

### ❌ Problema

Cuando se marca una cancha como `activo = false`, **desaparece del panel admin** porque el endpoint filtra automáticamente las inactivas.

### ✅ Solución

Agregar parámetro opcional para incluir canchas inactivas.

### 📍 Especificación

**Modificar ruta:**
```
GET /canchas?incluir_inactivas=true
```

**Implementación:**
```python
@router.get("/canchas")
def list_canchas(
    db: Session = Depends(get_db),
    incluir_inactivas: bool = False  # ← Nuevo parámetro
):
    query = db.query(Cancha)
    
    # Solo filtrar por activo si NO se pidió incluir inactivas
    if not incluir_inactivas:
        query = query.filter(Cancha.activo == True)
    
    return query.all()
```

**Uso:**
```bash
GET /canchas                          # Solo activas (público)
GET /canchas?incluir_inactivas=true   # Todas (admin)
```

### 🧪 Testing

```bash
# 1. Sin parámetro (default)
GET /canchas
# Debe devolver solo activas

# 2. Con parámetro
GET /canchas?incluir_inactivas=true
# Debe devolver todas (activas + inactivas)

# 3. Crear cancha inactiva
PATCH /canchas/5
Body: { "activo": false }

# 4. Verificar que aparece con incluir_inactivas
GET /canchas?incluir_inactivas=true
# Debe incluir la cancha 5
```

---

## 📊 Base de Datos

### Verificar campo en tabla `complejos`:

```sql
-- Debe existir la columna duenio_id
ALTER TABLE complejos 
ADD COLUMN IF NOT EXISTS duenio_id INTEGER REFERENCES usuarios(id_usuario);

-- Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_complejos_duenio ON complejos(duenio_id);
```

### Verificar campo en tabla `canchas`:

```sql
-- Debe existir la columna activo
ALTER TABLE canchas 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_canchas_activo ON canchas(activo);
```

---

## 🎯 Usuario de Prueba

**Email:** `dueno.cancha@gmail.com`  
**ID esperado:** 5 (verificar en BD)  
**Debe tener:** Al menos 1 complejo con `duenio_id = 5`

---

## 3️⃣ Endpoints: Reservas (Verificación)

### 📍 Endpoints Actuales en FastAPI

Según la documentación de la API, existen los siguientes endpoints de reservas:

**✅ Endpoints que SÍ existen:**
```
GET    /api/v1/reservas/mias                      - Mis reservas
GET    /api/v1/reservas                           - Listado (admin: su complejo; superadmin: todas)
POST   /api/v1/reservas                           - Crear
GET    /api/v1/reservas/{id_reserva}              - Detalle
PATCH  /api/v1/reservas/{id_reserva}              - Reprogramar/editar
POST   /api/v1/reservas/cotizar                   - Cotizar
POST   /api/v1/reservas/{id_reserva}/confirmar    - Confirmar (admin/superadmin)
POST   /api/v1/reservas/{id_reserva}/cancelar     - Cancelar
```

### ⚠️ Posibles Endpoints Faltantes

Basándonos en la funcionalidad del BFF, estos endpoints podrían estar faltando:

```
❓ GET  /reservas/admin/cancha/{cancha_id}      - Reservas por cancha
❓ GET  /reservas/admin/usuario/{usuario_id}    - Reservas por usuario (admin)
❓ POST /reservas/admin/crear                   - Crear como admin (para cualquier usuario)
❓ POST /reservas/admin/{id}/cancelar           - Cancelar forzado (admin)
```

### 🔍 Verificación Necesaria

**Por favor confirmar en FastAPI:**

1. ✅ ¿Existe endpoint para obtener **reservas de una cancha específica**?
   - Ruta esperada: `/reservas/admin/cancha/{cancha_id}` o `/reservas/cancha/{cancha_id}`

2. ✅ ¿Existe endpoint para obtener **reservas de un usuario** (solo admin)?
   - Ruta esperada: `/reservas/admin/usuario/{usuario_id}` o `/reservas/usuario/{usuario_id}`

3. ✅ ¿Existe endpoint para **crear reserva como admin** (para cualquier usuario)?
   - Ruta esperada: `/reservas/admin/crear` o el POST normal con permisos admin

4. ✅ ¿Existe endpoint para **cancelación forzada por admin**?
   - Ruta esperada: `/reservas/admin/{id}/cancelar` o el cancelar normal con permisos admin

### 📊 Estado BFF

El BFF ya tiene implementados estos métodos esperando los endpoints:

```typescript
// backend/src/reservas/infrastructure/ReservaApiRepository.ts

✅ getReservasByCancha(canchaId)          → GET /reservas/admin/cancha/{canchaId}
✅ getReservasByUsuarioAdmin(usuarioId)   → GET /reservas/admin/usuario/{usuarioId}
✅ createReservaAdmin(input)              → POST /reservas/admin/crear
✅ cancelarReservaAdmin(id)               → POST /reservas/admin/{id}/cancelar
```

---

## 4️⃣ Endpoints: Reseñas (Verificación)

### 📍 Endpoints del BFF

El BFF tiene implementados los siguientes endpoints de reseñas:

**✅ Públicos:**
```
GET  /api/resenas/complejo/:complejoId      - Reseñas de un complejo
GET  /api/resenas/estadisticas/:complejoId  - Estadísticas de reseñas
GET  /api/resenas/:id                       - Detalle de reseña
```

**✅ Usuario autenticado:**
```
GET    /api/resenas/usuario/:usuarioId     - Reseñas de un usuario
POST   /api/resenas                        - Crear reseña
PATCH  /api/resenas/:id                    - Actualizar reseña (autor)
POST   /api/resenas/:id/like               - Dar like
DELETE /api/resenas/:id/like               - Quitar like
POST   /api/resenas/:id/reportar           - Reportar reseña
POST   /api/resenas/:id/responder          - Responder (dueño)
```

**✅ Admin:**
```
GET    /api/resenas                        - Lista todas (con filtros)
DELETE /api/resenas/:id                    - Eliminar reseña
```

### ⚠️ Verificación Necesaria en FastAPI

**Por favor confirmar:**

1. ✅ ¿Existe endpoint `/resenas/complejo/{complejo_id}` para obtener reseñas de un complejo?
2. ✅ ¿Existe endpoint `/resenas/estadisticas/{complejo_id}` para estadísticas?
3. ✅ ¿Existe endpoint `/resenas/{id}/responder` para que el dueño responda?
4. ✅ ¿El endpoint `GET /resenas` permite filtros admin (todas las reseñas)?

### 📊 Endpoints Esperados en FastAPI

```python
# Públicos
GET  /resenas/complejo/{complejo_id}           # Listar reseñas de complejo
GET  /resenas/estadisticas/{complejo_id}       # Estadísticas (promedio, total)
GET  /resenas/{id}                             # Detalle

# Usuario autenticado
POST   /resenas                                # Crear reseña
PATCH  /resenas/{id}                           # Actualizar (solo autor)
DELETE /resenas/{id}                           # Eliminar (solo autor o admin)
POST   /resenas/{id}/like                      # Dar like
DELETE /resenas/{id}/like                      # Quitar like
POST   /resenas/{id}/reportar                  # Reportar
POST   /resenas/{id}/responder                 # Responder (dueño del complejo)

# Admin
GET  /resenas                                  # Lista todas con filtros
```

---

## ⏱️ Prioridades

| Endpoint | Prioridad | Impacto | Estimación |
|----------|-----------|---------|------------|
| `GET /complejos/duenio/:id` | 🔴 **Alta** | Bloquea crear canchas | 2-4h |
| Modificar `GET /canchas` | 🟡 Media | Oculta canchas inactivas | 1-2h |
| Verificar Reservas Admin | 🟡 Media | Panel admin reservas | 2-3h |
| Verificar Reseñas | 🟢 Baja | Módulo pendiente | 3-5h |

---

## 📝 Checklist de Implementación

### FastAPI Backend:

**Complejos:**
- [ ] Crear endpoint `/complejos/duenio/{duenio_id}`
- [ ] Verificar columna `duenio_id` en tabla `complejos`

**Canchas:**
- [ ] Agregar parámetro `incluir_inactivas` a `/canchas`
- [ ] Verificar columna `activo` en tabla `canchas`

**Reservas:**
- [ ] Verificar endpoint `/reservas/admin/cancha/{cancha_id}` (o similar)
- [ ] Verificar endpoint `/reservas/admin/usuario/{usuario_id}` (o similar)
- [ ] Verificar endpoint POST `/reservas/admin/crear`
- [ ] Verificar endpoint POST `/reservas/admin/{id}/cancelar`

**Reseñas:**
- [ ] Verificar endpoint `/resenas/complejo/{complejo_id}`
- [ ] Verificar endpoint `/resenas/estadisticas/{complejo_id}`
- [ ] Verificar endpoint POST `/resenas/{id}/responder`
- [ ] Verificar endpoint GET `/resenas` (admin con filtros)
- [ ] Verificar endpoints de likes y reportes

**Testing:**
- [ ] Tests unitarios para nuevos endpoints
- [ ] Actualizar documentación Swagger
- [ ] Testing de permisos (admin vs user vs super_admin)

### BFF Node.js:
- [x] Ruta `/api/complejos/admin/:adminId` (ya implementada)
- [x] Rutas de reservas admin (ya implementadas)
- [x] Rutas de reseñas (ya implementadas)
- [ ] Actualizar llamada a `/canchas` para pasar `incluir_inactivas=true` cuando sea admin

### Frontend:
- [x] Servicio `complejosService.getComplejosByAdmin()` (ya implementado)
- [x] Formulario crear cancha esperando endpoint (ya implementado)
- [ ] Testing una vez endpoints disponibles

---

## 🚀 Próximos Pasos

1. **Backend:** Revisar y confirmar este documento
2. **Backend:** Implementar endpoints faltantes (complejos, canchas)
3. **Backend:** Verificar endpoints de reservas y reseñas
4. **Backend:** Notificar cuando esté listo en dev
5. **Frontend:** Testing y validación
6. **DevOps:** Deploy coordinado

---

## 📞 Contacto

**Dudas o aclaraciones:** Equipo Frontend  
**Documentación BFF:** 
- `backend/src/complejos/`
- `backend/src/reservas/`
- `backend/src/resenas/`

**Código Frontend:** 
- `sporthub-temuco/src/services/complejosService.ts`
- `sporthub-temuco/src/app/admin/`

---

**Última actualización:** 20 de octubre de 2025  
**Versión:** 2.0 (Incluye Reservas y Reseñas)

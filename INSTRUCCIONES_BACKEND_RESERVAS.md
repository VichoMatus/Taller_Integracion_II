# 🔧 Instrucciones para el Equipo de Backend - Módulo de Reservas

> **Fecha:** 27 de octubre de 2025  
> **Módulo:** Gestión de Reservas (Admin)  
> **Prioridad:** 🔴 CRÍTICA  
> **Tiempo estimado:** 2-4 horas

---

## 📋 Contexto

El frontend de gestión de reservas para administradores está **funcionalmente completo**, pero requiere **dos cambios críticos en el backend FastAPI** para funcionar correctamente en producción.

Actualmente, se han implementado **soluciones temporales en el BFF** (Backend For Frontend) que permiten que el módulo funcione, pero estas soluciones deben **revertirse** una vez que ustedes implementen los cambios correctos en FastAPI.

---

## 🎯 Cambios Requeridos

### ✅ Checklist Rápida

- [ ] **Cambio 1:** Actualizar formato de datos para crear reservas (admin)
- [ ] **Cambio 2:** Agregar campo `complejo_id` al endpoint `/auth/me`
- [ ] **Validación:** Probar con requests de ejemplo
- [ ] **Notificar:** Informar al equipo de frontend para revertir cambios temporales

---

## 🔧 CAMBIO 1: Formato para Crear Reservas (Admin)

### 📍 Problema

El endpoint `POST /reservas` (cuando lo llama un admin para crear reserva de otro usuario) está **rechazando** las requests del BFF con error **422 Validation Error**.

**Causa raíz:** El modelo Pydantic espera nombres de campos diferentes a los que el BFF está enviando.

### 🔍 Ejemplo del Error

**Request del BFF:**
```json
{
  "cancha_id": 17,           // ❌ FastAPI espera "id_cancha"
  "fecha_inicio": "2025-10-27T17:11:00Z",  // ❌ FastAPI espera "fecha" + "inicio"
  "fecha_fin": "2025-10-27T18:11:00Z",     // ❌ FastAPI espera "fecha" + "fin"
  "usuario_id": 34,          // ❌ FastAPI espera "id_usuario"
  "notas": "Reserva de prueba"
}
```

**Respuesta de FastAPI:**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "id_cancha"],
      "msg": "Field required"
    },
    {
      "type": "missing",
      "loc": ["body", "fecha"],
      "msg": "Field required"
    }
  ]
}
```

### ✅ Solución Paso a Paso

#### Paso 1: Ubicar el Modelo Pydantic

Busquen el archivo donde está definido el modelo para crear reservas (probablemente algo como `schemas/reserva.py` o `models/reserva.py`).

Busquen una clase similar a:
```python
class CreateReservaInput(BaseModel):
    # Modelo actual (puede variar)
    ...
```

#### Paso 2: Actualizar el Modelo

**Reemplazar con este modelo:**

```python
from pydantic import BaseModel, validator
from datetime import datetime, date, time
from typing import Optional

class CreateReservaAdminInput(BaseModel):
    """
    Modelo para crear reserva desde panel de administración.
    El admin crea reservas para otros usuarios.
    """
    id_cancha: int
    fecha: str          # Formato: "YYYY-MM-DD" (ej: "2025-10-27")
    inicio: str         # Formato: "HH:MM" (ej: "17:11")
    fin: str            # Formato: "HH:MM" (ej: "18:11")
    id_usuario: int     # ID del usuario para quien se crea la reserva
    notas: Optional[str] = None
    
    # Validador para parsear fecha si viene en otro formato
    @validator('fecha', pre=True)
    def parse_fecha(cls, v):
        if isinstance(v, str):
            # Validar formato YYYY-MM-DD
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                raise ValueError('Fecha debe estar en formato YYYY-MM-DD')
        return v
    
    # Validador para parsear hora de inicio
    @validator('inicio', 'fin', pre=True)
    def parse_hora(cls, v):
        if isinstance(v, str):
            # Validar formato HH:MM
            try:
                datetime.strptime(v, '%H:%M')
                return v
            except ValueError:
                raise ValueError('Hora debe estar en formato HH:MM')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "id_cancha": 17,
                "fecha": "2025-10-27",
                "inicio": "17:00",
                "fin": "18:00",
                "id_usuario": 34,
                "notas": "Reserva creada por administrador"
            }
        }
```

#### Paso 3: Actualizar el Endpoint

Ubiquen el endpoint `POST /reservas` (o similar) y actualicen la firma:

**ANTES:**
```python
@router.post("/reservas")
async def create_reserva(
    reserva_input: CreateReservaInput,  # ❌ Modelo antiguo
    current_user = Depends(get_current_user)
):
    ...
```

**DESPUÉS:**
```python
@router.post("/reservas")
async def create_reserva_admin(
    reserva_input: CreateReservaAdminInput,  # ✅ Nuevo modelo
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validar que el usuario actual sea admin
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden crear reservas para otros usuarios"
        )
    
    # Construir datetime completo combinando fecha + hora
    fecha_inicio = datetime.strptime(
        f"{reserva_input.fecha} {reserva_input.inicio}",
        "%Y-%m-%d %H:%M"
    )
    fecha_fin = datetime.strptime(
        f"{reserva_input.fecha} {reserva_input.fin}",
        "%Y-%m-%d %H:%M"
    )
    
    # Crear reserva (adaptar a su lógica de negocio)
    nueva_reserva = Reserva(
        id_cancha=reserva_input.id_cancha,
        id_usuario=reserva_input.id_usuario,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        estado="confirmada",  # O el estado que corresponda
        notas=reserva_input.notas
    )
    
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)
    
    return {
        "ok": True,
        "data": nueva_reserva
    }
```

#### Paso 4: Validar con Request de Prueba

Usen Thunder Client, Postman o curl para probar:

```bash
POST https://api-h1d7oi-a881cc-168-232-167-73.traefik.me/api/v1/reservas
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "id_cancha": 17,
  "fecha": "2025-10-27",
  "inicio": "17:11",
  "fin": "18:11",
  "id_usuario": 34,
  "notas": "Reserva de prueba desde backend"
}
```

**Respuesta esperada (201 Created):**
```json
{
  "ok": true,
  "data": {
    "id_reserva": 123,
    "id_cancha": 17,
    "id_usuario": 34,
    "fecha_inicio": "2025-10-27T17:11:00",
    "fecha_fin": "2025-10-27T18:11:00",
    "estado": "confirmada",
    "created_at": "2025-10-27T19:30:00",
    ...
  }
}
```

---

## 🔧 CAMBIO 2: Agregar `complejo_id` a `/auth/me`

### 📍 Problema

El endpoint `GET /auth/me` **no devuelve** el campo `complejo_id` para usuarios con rol `admin`. Esto causa que el frontend **no pueda filtrar** las reservas por el complejo que administra ese usuario.

**Resultado actual:** El admin ve **todas las reservas de todos los complejos** en lugar de solo las de su complejo.

---

## 🔧 CAMBIO 3: Incluir Datos Relacionados en GET /reservas (OPCIONAL PERO RECOMENDADO)

### 📍 Problema Adicional

Actualmente, el endpoint `GET /reservas` devuelve las reservas con los IDs de usuario y cancha, pero **NO incluye los datos relacionados** de `usuario` y `cancha`.

**Resultado actual:**
```json
{
  "id_reserva": 123,
  "usuario_id": 34,
  "cancha_id": 17,
  ...
  // ❌ FALTA: campo "usuario" con {nombre, email}
  // ❌ FALTA: campo "cancha" con {nombre, tipo}
}
```

**Impacto en el frontend:**
- El frontend muestra "Usuario #34" y "Cancha #17" en lugar de los nombres reales
- Se requieren consultas adicionales para obtener nombres de usuarios y canchas
- Experiencia de usuario deficiente

### ✅ Solución Recomendada

Modificar el endpoint para incluir datos relacionados mediante JOINs en la consulta SQL:

```python
# Ejemplo conceptual (adaptar a su ORM)
@router.get("/reservas")
async def list_reservas(...):
    query = db.query(Reserva).options(
        joinedload(Reserva.usuario),  # Cargar relación con usuario
        joinedload(Reserva.cancha)     # Cargar relación con cancha
    )
    ...
```

**Respuesta esperada:**
```json
{
  "id_reserva": 123,
  "usuario_id": 34,
  "cancha_id": 17,
  "usuario": {
    "id": 34,
    "email": "usuario@example.com",
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "cancha": {
    "id": 17,
    "nombre": "Cancha Principal",
    "tipo": "Fútbol 7"
  },
  ...
}
```

**Ventajas:**
- Menos consultas HTTP (mejor performance)
- Experiencia de usuario mejorada (muestra nombres reales)
- Código frontend más simple (no necesita consultas adicionales)

### 🔍 Ejemplo del Problema

**Request:**
```bash
GET /api/v1/auth/me
Authorization: Bearer <token_admin>
```

**Respuesta actual:**
```json
{
  "id_usuario": 34,
  "nombre": "Admin Complejo",
  "email": "admin@complejo.com",
  "rol": "admin",
  "telefono": "+56912345678",
  "avatar_url": "https://..."
  // ❌ FALTA: complejo_id
}
```

### ✅ Solución Paso a Paso

#### Paso 1: Ubicar el Modelo UserPublic

Busquen el archivo donde está definido el modelo de respuesta para usuarios (probablemente `schemas/user.py` o `models/user.py`).

Busquen una clase similar a:
```python
class UserPublic(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    rol: str
    ...
```

#### Paso 2: Agregar Campo complejo_id

**Actualizar el modelo:**

```python
from pydantic import BaseModel
from typing import Optional

class UserPublic(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    rol: str
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # ✅ NUEVO CAMPO
    complejo_id: Optional[int] = None  # Solo para usuarios rol "admin"
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id_usuario": 34,
                "nombre": "Admin Complejo",
                "email": "admin@complejo.com",
                "rol": "admin",
                "telefono": "+56912345678",
                "avatar_url": "https://example.com/avatar.jpg",
                "complejo_id": 5  # ✅ ID del complejo que administra
            }
        }
```

#### Paso 3: Actualizar el Endpoint /auth/me

Ubiquen el endpoint `GET /auth/me` y modifiquen la lógica:

**ANTES:**
```python
@router.get("/auth/me")
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    return UserPublic(
        id_usuario=current_user.id_usuario,
        nombre=current_user.nombre,
        email=current_user.email,
        rol=current_user.rol,
        telefono=current_user.telefono,
        avatar_url=current_user.avatar_url
    )
```

**DESPUÉS:**
```python
@router.get("/auth/me")
async def get_current_user_info(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Obtener complejo_id si el usuario es admin
    complejo_id = None
    
    if current_user.rol == "admin":
        # Consultar tabla complejos (adaptar según su modelo)
        complejo = db.query(Complejo).filter(
            Complejo.dueno_id == current_user.id_usuario
        ).first()
        
        if complejo:
            complejo_id = complejo.id_complejo
    
    return UserPublic(
        id_usuario=current_user.id_usuario,
        nombre=current_user.nombre,
        email=current_user.email,
        rol=current_user.rol,
        telefono=current_user.telefono,
        avatar_url=current_user.avatar_url,
        complejo_id=complejo_id  # ✅ Incluir en respuesta
    )
```

**Nota:** Adapten `Complejo` y `dueno_id` a los nombres reales de su modelo.

#### Paso 4: Validar con Request de Prueba

```bash
GET https://api-h1d7oi-a881cc-168-232-167-73.traefik.me/api/v1/auth/me
Authorization: Bearer <token_admin>
```

**Respuesta esperada:**
```json
{
  "id_usuario": 34,
  "nombre": "Admin Complejo",
  "email": "admin@complejo.com",
  "rol": "admin",
  "telefono": "+56912345678",
  "avatar_url": "https://...",
  "complejo_id": 5  // ✅ DEBE APARECER
}
```

#### Paso 5: (OPCIONAL) Filtrado Automático en Backend

Si quieren mayor seguridad, pueden implementar **filtrado automático** en el endpoint de listar reservas:

```python
@router.get("/reservas")
async def list_reservas(
    page: int = 1,
    page_size: int = 20,
    complejo_id: Optional[int] = None,  # Filtro opcional del frontend
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Reserva)
    
    # Si el usuario es admin, FORZAR filtro por su complejo
    if current_user.rol == "admin":
        complejo = db.query(Complejo).filter(
            Complejo.dueno_id == current_user.id_usuario
        ).first()
        
        if complejo:
            # Filtrar solo reservas de canchas de su complejo
            query = query.join(Cancha).filter(
                Cancha.id_complejo == complejo.id_complejo
            )
    
    # Aplicar paginación
    total = query.count()
    reservas = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "ok": True,
        "data": {
            "items": reservas,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }
```

Esto garantiza que un admin **nunca** pueda ver reservas de otros complejos, incluso si manipula el frontend.

---

## 🧹 Reversión de Cambios Temporales en BFF/Frontend

Una vez que implementen estos cambios, **notifíquenos** y nosotros revertiremos los siguientes archivos:

### Archivos del BFF (Backend Node.js)

1. **`backend/src/reservas/infrastructure/ReservaApiRepository.ts`**
   - Cambio temporal: Construcción manual de payload
   - Revertir a: Uso de `toSnake()` automático

2. **`backend/src/reservas/presentation/controllers/reservas.controller.ts`**
   - Cambio temporal: Logging adicional
   - Revertir a: Logging mínimo

3. **`backend/src/complejos/presentation/routes/complejos.routes.ts`**
   - Cambio temporal: Mapeo de parámetros
   - Revertir a: Versión original sin mapeo

### Archivos del Frontend (Next.js)

1. **`sporthub-temuco/src/app/admin/reservas/page.tsx`**
   - Cambio temporal: Consulta adicional a `/complejos/admin/:adminId`
   - Revertir a: Uso directo de `user.complejo_id` de `/auth/me`

---

## 📊 Prioridad y Estimación

| Cambio | Prioridad | Complejidad | Tiempo Estimado |
|--------|-----------|-------------|-----------------|
| **Formato crear reservas** | 🔴 CRÍTICA | 🟢 Baja | 30-60 min |
| **Campo complejo_id** | 🟡 ALTA | 🟡 Media | 1-2 horas |
| **Filtrado automático (opcional)** | 🟢 BAJA | 🟡 Media | 1 hora |

**Tiempo total estimado:** 2-4 horas

---

## ✅ Verificación Final

Antes de marcar como completado, verificar:

- [ ] Request de crear reserva con Postman/Thunder Client → 201 Created
- [ ] Response incluye todos los campos esperados
- [ ] Request a `/auth/me` con usuario admin → incluye `complejo_id`
- [ ] Frontend puede crear reservas sin errores 422
- [ ] Frontend muestra solo reservas del complejo del admin (no todas)
- [ ] Documentación de Swagger/OpenAPI actualizada
- [ ] Notificado al equipo de frontend para revertir cambios temporales

---

## 📞 Contacto

Para dudas o problemas durante la implementación, contactar al equipo de frontend:

- **Slack:** #frontend-team
- **Email:** frontend@sporthub.cl

---

## 📝 Notas Adicionales

### Nomenclatura de Campos

El backend FastAPI usa **snake_case** para nombres de campos:
- `id_cancha` (no `canchaId` ni `cancha_id`)
- `id_usuario` (no `usuarioId` ni `usuario_id`)
- `complejo_id` (no `complejoId`)

El BFF se encarga de convertir **camelCase → snake_case** automáticamente, pero es importante que el modelo Pydantic use los nombres exactos documentados aquí.

### Estructura de Respuestas

Todas las respuestas del backend deben seguir el formato:

```json
{
  "ok": true,  // o false en caso de error
  "data": {
    // Datos de respuesta
  }
}
```

En caso de error:
```json
{
  "ok": false,
  "error": {
    "code": 422,
    "message": "Validation error",
    "details": {
      // Detalles del error
    }
  }
}
```

---

**¡Muchas gracias por su colaboración!** 🚀

Una vez implementados estos cambios, el módulo de reservas estará **100% funcional** y podremos eliminar todas las soluciones temporales.

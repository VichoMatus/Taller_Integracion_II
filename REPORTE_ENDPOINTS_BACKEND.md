# � REPORTE UNIFICADO DE ENDPOINTS BACKEND
## Guía Completa para Implementación Backend (Canchas, Reservas y Reseñas)

### 🎯 RESUMEN EJECUTIVO
Este documento consolida los requerimientos de endpoints backend para tres módulos críticos del sistema de gestión de complejos deportivos:
- **Canchas**: Gestión de instalaciones deportivas
- **Reservas**: Sistema de reservaciones y horarios  
- **Reseñas**: Sistema de calificaciones y comentarios

### 📊 ESTADO DE IMPLEMENTACIÓN FRONTEND
| Módulo | Estado Frontend | CRUD Completo | Backend Integrado |
|--------|----------------|---------------|-------------------|
| Canchas | ✅ Completado | ✅ Sí | 🔄 Parcial |
| Reservas | ✅ Completado | ✅ Sí | 🔄 Parcial |
| Reseñas | ✅ Completado | ✅ Sí | 🔄 Parcial |

---

## 🏟️ MÓDULO CANCHAS

### 🔄 ENDPOINTS REQUERIDOS

#### 1. GET /api/canchas
**Propósito**: Listar canchas con filtros y paginación
```typescript
// Query Parameters
interface CanchaListQuery {
  page?: number;
  size?: number;
  tipo?: string;
  estado?: string;
  search?: string;
  complejo_id?: number;
}

// Response
interface CanchaListResponse {
  canchas: Cancha[];
  total: number;
  page: number;
  size: number;
}
```

#### 2. GET /api/canchas/:id
**Propósito**: Obtener cancha específica
```typescript
// Response
interface Cancha {
  id_cancha: number;
  nombre: string;
  tipo: string;
  descripcion?: string;
  capacidad: number;
  precio_por_hora: number;
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  servicios: string[];
  horarios_disponibles: string[];
  complejo_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

#### 3. POST /api/canchas
**Propósito**: Crear nueva cancha
```typescript
// Request Body
interface CanchaCreateRequest {
  nombre: string;
  tipo: string;
  descripcion?: string;
  capacidad: number;
  precio_por_hora: number;
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  servicios: string[];
  horarios_disponibles: string[];
  complejo_id: number;
}
```

#### 4. PUT /api/canchas/:id
**Propósito**: Actualizar cancha existente
```typescript
// Request Body
interface CanchaUpdateRequest {
  nombre?: string;
  tipo?: string;
  descripcion?: string;
  capacidad?: number;
  precio_por_hora?: number;
  estado?: 'activa' | 'inactiva' | 'mantenimiento';
  servicios?: string[];
  horarios_disponibles?: string[];
}
```

#### 5. DELETE /api/canchas/:id
**Propósito**: Eliminar cancha
```typescript
// Response
interface DeleteResponse {
  message: string;
  id_cancha: number;
}
```

### **Problema Específico Canchas:**
Las rutas de canchas están implementadas pero **NO REGISTRADAS** en el servidor.

### **Solución Requerida:**
Agregar esta línea en `backend/src/index.ts` después de las otras rutas registradas:
```typescript
app.use('/api/canchas', canchasRoutes);
```

---

## 📅 MÓDULO RESERVAS

### 🔄 ENDPOINTS REQUERIDOS

#### 1. GET /api/reservas
**Propósito**: Listar reservas con filtros
```typescript
// Query Parameters
interface ReservaListQuery {
  page?: number;
  size?: number;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cancha_id?: number;
  usuario_id?: number;
}

// Response
interface ReservaListResponse {
  reservas: Reserva[];
  total: number;
  page: number;
  size: number;
}
```

#### 2. GET /api/reservas/:id
**Propósito**: Obtener reserva específica
```typescript
// Response
interface Reserva {
  id_reserva: number;
  usuario_id: number;
  cancha_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  precio_total: number;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

#### 3. POST /api/reservas
**Propósito**: Crear nueva reserva
```typescript
// Request Body
interface ReservaCreateRequest {
  usuario_id: number;
  cancha_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones?: string;
}
```

#### 4. PUT /api/reservas/:id
**Propósito**: Actualizar reserva existente
```typescript
// Request Body
interface ReservaUpdateRequest {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  observaciones?: string;
}
```

#### 5. DELETE /api/reservas/:id
**Propósito**: Cancelar/eliminar reserva
```typescript
// Response
interface DeleteResponse {
  message: string;
  id_reserva: number;
}
```

### **Problema Específico Reservas:**
Los endpoints de reservas no están implementados o no están registrados en el servidor.

### **Solución Requerida:**
1. Implementar rutas de reservas: `backend/src/reservas/routes/reservas.routes.ts`
2. Registrar rutas en `backend/src/index.ts`:
```typescript
app.use('/api/reservas', reservasRoutes);
```

---

## ⭐ MÓDULO RESEÑAS

### 🔄 ENDPOINTS REQUERIDOS

#### 1. GET /api/resenas
**Propósito**: Listar reseñas con filtros
```typescript
// Query Parameters
interface ResenaListQuery {
  page?: number;
  size?: number;
  calificacion_min?: number;
  calificacion_max?: number;
  cancha_id?: number;
  usuario_id?: number;
}

// Response
interface ResenaListResponse {
  resenas: Resena[];
  total: number;
  page: number;
  size: number;
}
```

#### 2. GET /api/resenas/:id
**Propósito**: Obtener reseña específica
```typescript
// Response
interface Resena {
  id_resena: number;
  id_usuario: number;
  id_cancha: number;
  id_reserva?: number;
  calificacion: number; // 1-5
  comentario?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

#### 3. POST /api/resenas
**Propósito**: Crear nueva reseña
```typescript
// Request Body
interface ResenaCreateRequest {
  id_usuario: number;
  id_cancha: number;
  id_reserva?: number;
  calificacion: number; // 1-5
  comentario?: string;
}
```

#### 4. PUT /api/resenas/:id
**Propósito**: Actualizar reseña existente
```typescript
// Request Body
interface ResenaUpdateRequest {
  calificacion?: number; // 1-5
  comentario?: string;
}
```

#### 5. DELETE /api/resenas/:id
**Propósito**: Eliminar reseña
```typescript
// Response
interface DeleteResponse {
  message: string;
  id_resena: number;
}
```

### **Problema Específico Reseñas:**
Los endpoints de reseñas no están implementados.

### **Solución Requerida:**
1. Implementar rutas de reseñas: `backend/src/resenas/routes/resenas.routes.ts`
2. Registrar rutas en `backend/src/index.ts`:
```typescript
app.use('/api/resenas', resenasRoutes);
```

---

## 🎨 CARACTERÍSTICAS FRONTEND IMPLEMENTADAS

### ✅ MÓDULO CANCHAS
- **Lista de canchas** con búsqueda y filtros
- **Crear cancha** con validación completa
- **Editar cancha** con formulario dinámico
- **Eliminar cancha** con confirmación
- **Gestión de servicios** (agregar/quitar)
- **Estados visuales** (activa, inactiva, mantenimiento)
- **Paginación** y navegación

### ✅ MÓDULO RESERVAS  
- **Lista de reservas** con filtros por estado y fecha
- **Crear reserva** con selección de cancha y horarios
- **Editar reserva** con validación de fechas
- **Cancelar reserva** con confirmación
- **Estados de reserva** (confirmada, pendiente, cancelada, completada)
- **Búsqueda** por usuario, cancha o estado
- **Manejo de errores** graceful con fallback a datos mock

### ✅ MÓDULO RESEÑAS
- **Lista de reseñas** con filtros por calificación
- **Crear reseña** con selección de usuario y cancha
- **Editar reseña** con selector de calificación visual
- **Eliminar reseña** con confirmación
- **Sistema de calificación** con emojis (😡😞😐😊🤩)
- **Comentarios** con límite de caracteres
- **Truncado de texto** en listados largos
- **Navegación** fluida entre formularios

---

## � MATRIZ DE PRIORIDAD DE IMPLEMENTACIÓN

### PRIORIDAD ALTA (Implementar Primero)
1. **GET /api/canchas** - Base del sistema
2. **GET /api/reservas** - Gestión operativa crítica  
3. **GET /api/resenas** - Feedback del usuario
4. **POST /api/reservas** - Funcionalidad core
5. **PUT /api/reservas** - Gestión de cambios

### PRIORIDAD MEDIA (Implementar Segundo)
6. **POST /api/canchas** - Gestión administrativa
7. **PUT /api/canchas** - Mantenimiento de datos
8. **POST /api/resenas** - Engagement del usuario
9. **PUT /api/resenas** - Moderación de contenido

### PRIORIDAD BAJA (Implementar Tercero)
10. **DELETE /api/canchas** - Funcionalidad administrativa
11. **DELETE /api/reservas** - Cancelaciones
12. **DELETE /api/resenas** - Moderación avanzada

---

## 🛠️ NOTAS TÉCNICAS IMPORTANTES

### Manejo de Errores
- Todos los endpoints deben retornar errores HTTP estándar
- 400: Bad Request para validaciones fallidas
- 404: Not Found para recursos inexistentes  
- 500: Internal Server Error para errores del servidor

### Validaciones Requeridas
- **Canchas**: nombre único, capacidad > 0, precio > 0
- **Reservas**: fechas válidas, no overlap con otras reservas
- **Reseñas**: calificación entre 1-5, comentario opcional

### Paginación Estándar
- `page`: número de página (default: 1)
- `size`: elementos por página (default: 10, max: 100)
- Response siempre incluye `total`, `page`, `size`

### Estados Permitidos
- **Canchas**: 'activa', 'inactiva', 'mantenimiento'
- **Reservas**: 'confirmada', 'pendiente', 'cancelada', 'completada'
- **Reseñas**: No tienen estado, se valida por calificacion (1-5)

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend Tasks
- [ ] Configurar base de datos con tablas necesarias
- [ ] Implementar modelos de datos (Cancha, Reserva, Resena)
- [ ] Crear controllers para cada módulo
- [ ] Implementar middlewares de validación
- [ ] Configurar rutas y endpoints
- [ ] Agregar autenticación y autorización
- [ ] Implementar tests unitarios
- [ ] Documentar API con Swagger/OpenAPI

### Integration Tasks  
- [ ] Configurar CORS para frontend
- [ ] Probar endpoints con datos reales
- [ ] Validar tipos TypeScript con frontend
- [ ] Implementar logging y monitoring
- [ ] Configurar rate limiting
- [ ] Setup de CI/CD para deploy

---

*Este documento está actualizado con los tres módulos completos de CRUD (Canchas, Reservas y Reseñas) implementados en el frontend y listos para integración backend.*
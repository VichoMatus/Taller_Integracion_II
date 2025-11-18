# Módulo de Canchas - ACTUALIZADO CON TALLER4 ⚡

Este módulo maneja la gestión completa de canchas deportivas en el sistema. **Sincronizado con Taller4 v1.0** para compatibilidad completa con el backend FastAPI actualizado.

## ⭐ Cambios Principales (Taller4 Sync)

### Nuevas Funcionalidades
- ✅ **Panel Administrativo**: Endpoint `/admin` para gestión de canchas por rol
- ✅ **Búsqueda Avanzada**: Filtros por `cubierta/techada`, geolocalización, rating
- ✅ **Gestión de Fotos**: CRUD completo para imágenes de canchas
- ✅ **Cálculo de Distancia**: Búsquedas por proximidad con lat/lon
- ✅ **Filtros Mejorados**: Soporte para `max_precio`, `deporte`, `iluminacion`

### Endpoints Actualizados
- 🔄 **GET /canchas**: Filtros extendidos y soporte para distancia
- 🔄 **GET /canchas/:id**: Cálculo opcional de distancia
- 🆕 **GET /canchas/admin**: Panel administrativo con permisos por rol
- 🆕 **POST /canchas**: Creación de canchas con validación completa
- 🆕 **PATCH /canchas/:id**: Actualización parcial de canchas
- 🆕 **DELETE /canchas/:id**: Eliminación/archivado de canchas
- 🆕 **Gestión de Fotos**: CRUD completo (/canchas/:id/fotos)

## Arquitectura

```
canchas/
├── domain/                 # Capa de dominio
│   └── CanchaRepository.ts # Interface del repositorio
├── application/           # Casos de uso
│   └── CanchasUseCases.ts # CRUD y operaciones de canchas
├── infrastructure/        # Capa de infraestructura
│   ├── CanchaApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts        # Mapeo entre entidades
└── presentation/         # Capa de presentación
    ├── controllers/      # Controladores HTTP
    └── routes/          # Definición de rutas (⚡ TALLER4 SYNC)
```

## Funcionalidades

### Gestión de Canchas (Actualizada)
- **Listar canchas**: Paginado con filtros avanzados (distancia, rating, precio)
- **Panel Admin**: Vista administrativa con filtros específicos por rol
- **Obtener cancha**: Detalle con cálculo opcional de distancia
- **Crear cancha**: Validación completa y soporte para deportes
- **Actualizar cancha**: Modificación parcial con PATCH
- **Eliminar cancha**: Archivado soft-delete
- **Gestión de Fotos**: CRUD completo para imágenes

## Entidades del Dominio

### Cancha
```typescript
interface Cancha {
  id: number;
  nombre: string;
  tipo: TipoCancha;
  estado: EstadoCancha;
  precioPorHora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  activa: boolean;
  establecimientoId: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  imagenUrl?: string;
}
```

### Tipos de Cancha
- **futbol**: Canchas de fútbol
- **basquet**: Canchas de básquet
- **tenis**: Canchas de tenis
- **padel**: Canchas de pádel
- **volley**: Canchas de vóley

### Estados de Cancha
- **disponible**: Cancha lista para reservar
- **ocupada**: Cancha actualmente en uso
- **mantenimiento**: Cancha en reparación/mantenimiento
- **inactiva**: Cancha temporalmente fuera de servicio

## 🚀 Endpoints API (Taller4 Sync)

### Status & Meta
```
GET    /canchas/status         # ⚡ Estado del módulo y features disponibles
```

### Endpoints Públicos
```
GET    /canchas               # 🔄 Lista canchas con filtros avanzados
GET    /canchas/:id          # 🔄 Detalle con distancia opcional
```

### Endpoints Administrativos (requieren autenticación)
```
GET    /canchas/admin        # 🆕 Panel administrativo por rol
POST   /canchas              # 🆕 Crear cancha con validaciones
PATCH  /canchas/:id          # 🆕 Actualizar cancha (parcial)
DELETE /canchas/:id          # 🆕 Eliminar/archivar cancha
```

### Gestión de Fotos (Nueva funcionalidad)
```
GET    /canchas/:id/fotos           # 🆕 Lista fotos de cancha
POST   /canchas/:id/fotos          # 🆕 Agregar foto
DELETE /canchas/:id/fotos/:fotoId  # 🆕 Eliminar foto
```

## 🔍 Filtros de Búsqueda Avanzados

### GET /canchas (Filtros extendidos)
**Básicos:**
- `q`: Búsqueda en nombre
- `page`, `page_size`: Paginación
- `id_complejo`: Filtrar por complejo específico

**Deportivos:**
- `deporte`: Tipo de deporte (fútbol, básquet, tenis, etc.)
- `cubierta` / `techada`: Canchas cubiertas (true/false)
- `iluminacion`: Canchas con iluminación

**Económicos:**
- `max_precio`: Precio máximo

**Geográficos (Nueva funcionalidad):**
- `lat`, `lon`: Coordenadas para calcular distancia
- `max_km`: Radio máximo de búsqueda
- `sort_by=distancia`: Ordenar por proximidad

**Rating y Popularidad:**
- `sort_by`: `distancia|precio|rating|nombre|recientes`
- `order`: `asc|desc`

### GET /canchas/admin (Panel administrativo)
- `id_complejo`: Filtrar por complejo (según permisos del usuario)
- `q`: Búsqueda por nombre
- `incluir_inactivas`: Mostrar canchas archivadas (default: true)
- `sort_by`: `nombre|precio|rating|recientes`
- `order`: `asc|desc`
- `page`, `page_size`: Paginación

### GET /canchas/:id (Detalle con extras)
- `lat`, `lon`: Coordenadas para calcular distancia desde usuario

## Autorización

### Permisos por Rol
- **Público**: Consultar canchas y disponibilidad
- **Admin/Superadmin**: Gestión completa de canchas
- **Dueño**: Gestionar canchas de su establecimiento (futuro)

## Validaciones de Negocio

### Crear/Actualizar Cancha
- Precio por hora debe ser mayor a 0
- Capacidad debe ser mayor a 0
- Nombre es requerido
- Tipo debe ser válido
- Establecimiento debe existir

### Consultar Disponibilidad
- Fecha de inicio debe ser anterior a fecha de fin
- Fechas no pueden ser en el pasado
- Período máximo de consulta: 30 días

## 🔌 Integración con FastAPI (Actualizada)

### Endpoints Sincronizados
```
GET    /api/v1/canchas              # Lista con filtros avanzados
GET    /api/v1/canchas/admin        # Panel administrativo
GET    /api/v1/canchas/{id}         # Detalle con distancia
POST   /api/v1/canchas              # Creación con validaciones
PATCH  /api/v1/canchas/{id}         # Actualización parcial
DELETE /api/v1/canchas/{id}         # Eliminación/archivado
GET    /api/v1/canchas/{id}/fotos   # CRUD de fotos
POST   /api/v1/canchas/{id}/fotos
DELETE /api/v1/canchas/{id}/fotos/{foto_id}
```

### Mapeo de Parámetros
- `cubierta` ↔ `techada`: Ambos formatos soportados
- Geolocalización: `lat`/`lon` para cálculo de distancia
- Filtros: Compatible con esquemas Taller4

## 🚨 Cambios Importantes

### Migración desde Versión Anterior
1. **Filtros actualizados**: `techada` → `cubierta` (ambos soportados)
2. **Nuevos endpoints**: `/admin` para gestión por roles
3. **Gestión de fotos**: CRUD completo agregado
4. **Búsqueda geográfica**: Soporte para distancia y proximidad
5. **Validaciones**: Esquemas Taller4 implementados

### Retrocompatibilidad
✅ Todos los endpoints anteriores siguen funcionando  
✅ Filtros legacy soportados con mapping automático  
✅ Respuestas mantienen estructura base con campos extendidos  

Para más información sobre la arquitectura general, consulta el README principal en `/src`.

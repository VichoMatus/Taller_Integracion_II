# Módulo de Canchas

Este módulo maneja la gestión completa de canchas deportivas en el sistema. Implementa una arquitectura hexagonal con separación clara entre dominio, aplicación e infraestructura.

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
    └── routes/          # Definición de rutas
```

## Funcionalidades

### Gestión de Canchas
- **Listar canchas**: Paginado con múltiples filtros
- **Obtener cancha**: Detalle de una cancha específica
- **Crear cancha**: Agregar nueva cancha al sistema
- **Actualizar cancha**: Modificar datos de la cancha
- **Eliminar cancha**: Remover cancha del sistema
- **Cambiar estado**: Gestionar disponibilidad de canchas
- **Consultar disponibilidad**: Canchas libres en período específico

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

## Endpoints API

### Endpoints Públicos (sin autenticación)
```
GET    /canchas                 # Listar canchas (con filtros)
GET    /canchas/disponibles     # Canchas disponibles en período
GET    /canchas/:id            # Obtener cancha específica
```

### Endpoints Administrativos (requieren autenticación)
```
POST   /canchas               # Crear nueva cancha
PATCH  /canchas/:id          # Actualizar cancha
DELETE /canchas/:id          # Eliminar cancha
PATCH  /canchas/:id/estado   # Cambiar estado de cancha
```

## Filtros de Búsqueda

### GET /canchas
- `page`: Número de página
- `pageSize`: Elementos por página
- `q`: Búsqueda en nombre/descripción
- `tipo`: Filtrar por tipo de cancha
- `estado`: Filtrar por estado
- `establecimientoId`: Filtrar por establecimiento
- `techada`: Solo canchas techadas (true/false)
- `precioMax`: Precio máximo por hora
- `capacidadMin`: Capacidad mínima

### GET /canchas/disponibles
- `fechaInicio`: Fecha/hora de inicio (ISO string)
- `fechaFin`: Fecha/hora de fin (ISO string)
- `tipo`: Tipo de cancha (opcional)

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

## Integración con FastAPI

El módulo se comunica con endpoints FastAPI:
- `/canchas` - CRUD de canchas
- `/canchas/disponibles` - Consulta de disponibilidad
- `/canchas/{id}/estado` - Gestión de estados

Para más información sobre la arquitectura general, consulta el README principal en `/src`.

# Módulo de Bloqueos

Este módulo maneja la gestión completa de bloqueos de disponibilidad de canchas deportivas. Permite a administradores y dueños bloquear períodos de tiempo específicos para mantenimiento, eventos especiales, limpieza, etc.

## Arquitectura

```
bloqueos/
├── domain/                    # Capa de dominio
│   └── BloqueoRepository.ts   # Interface del repositorio
├── application/              # Casos de uso
│   └── BloqueosUseCases.ts   # CRUD y operaciones de bloqueos
├── infrastructure/           # Capa de infraestructura
│   ├── BloqueoApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts           # Mapeo entre entidades
└── presentation/            # Capa de presentación
    ├── controllers/         # Controladores HTTP
    └── routes/             # Definición de rutas
```

## Funcionalidades

### Gestión de Bloqueos
- **Crear bloqueo**: Nuevo bloqueo con validaciones de conflictos
- **Listar bloqueos**: Paginado con múltiples filtros
- **Obtener bloqueo**: Detalle de un bloqueo específico
- **Actualizar bloqueo**: Modificar datos del bloqueo
- **Eliminar bloqueo**: Remover bloqueo del sistema
- **Verificar conflictos**: Detectar solapamientos entre bloqueos
- **Gestión de estados**: Activar/desactivar bloqueos
- **Bloqueos por creador**: Gestión personalizada por usuario

## Entidades del Dominio

### Bloqueo
```typescript
interface Bloqueo {
  id: number;
  canchaId: number;
  complejoId: number;
  creadoPorId: number;
  tipo: TipoBloqueo;
  estado: EstadoBloqueo;
  fechaInicio: Date;
  fechaFin: Date;
  titulo: string;
  descripcion?: string;
  recurrente: boolean;
  patronRecurrencia?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Información desnormalizada
  cancha?: { /* datos de la cancha */ };
  complejo?: { /* datos del complejo */ };
  creadoPor?: { /* datos del creador */ };
}
```

### Tipos de Bloqueos
- **mantenimiento**: Mantenimiento de la cancha
- **evento_especial**: Eventos privados o corporativos
- **reserva_privada**: Reservas exclusivas
- **clausura_temporal**: Clausura por reparaciones
- **limpieza**: Limpieza profunda de instalaciones

### Estados de Bloqueos
- **activo**: Bloqueo en vigor
- **inactivo**: Bloqueo desactivado temporalmente
- **vencido**: Bloqueo que ya pasó su fecha
- **cancelado**: Bloqueo cancelado definitivamente

## Endpoints API

### Endpoints Públicos
```
POST   /bloqueos/verificar-conflicto   # Verificar conflictos
GET    /bloqueos/activos/:canchaId     # Bloqueos activos de cancha
```

### Endpoints de Gestión (requieren autenticación)
```
GET    /bloqueos/creador/:creadoPorId  # Bloqueos de un creador
POST   /bloqueos                       # Crear nuevo bloqueo
GET    /bloqueos/:id                   # Obtener bloqueo específico
PATCH  /bloqueos/:id                   # Actualizar bloqueo
POST   /bloqueos/:id/activar           # Activar bloqueo
POST   /bloqueos/:id/desactivar        # Desactivar bloqueo
```

### Endpoints Administrativos (requieren rol admin/superadmin)
```
GET    /bloqueos                       # Listar todos los bloqueos
DELETE /bloqueos/:id                   # Eliminar bloqueo
```

## Validaciones de Negocio

### Crear Bloqueo
- Título es requerido y no puede estar vacío
- Fecha de fin debe ser posterior a fecha de inicio
- Duración mínima: 30 minutos
- Duración máxima: 30 días
- No se permiten bloqueos en el pasado (excepto mantenimiento de emergencia)
- Patrón de recurrencia es requerido para bloqueos recurrentes
- Verificación de conflictos con otros bloqueos

### Actualizar Bloqueo
- Si cambian fechas, reverificar conflictos
- Título no puede estar vacío si se actualiza

## Filtros de Búsqueda

### GET /bloqueos
- `page`: Número de página
- `pageSize`: Elementos por página
- `canchaId`: Filtrar por cancha
- `complejoId`: Filtrar por complejo
- `tipo`: Filtrar por tipo de bloqueo
- `estado`: Filtrar por estado
- `fechaDesde`: Fecha desde (ISO string)
- `fechaHasta`: Fecha hasta (ISO string)
- `creadoPorId`: Filtrar por creador
- `soloActivos`: Solo bloqueos activos (true/false)
- `q`: Búsqueda en título o descripción

## Autorización

### Permisos por Rol
- **Público**: Consultar bloqueos activos y verificar conflictos
- **Dueño**: Gestionar bloqueos de sus propios complejos
- **Admin/Superadmin**: Gestión completa de bloqueos

### Políticas de Seguridad
- Solo el creador puede modificar sus bloqueos
- Admin puede gestionar cualquier bloqueo
- Verificación de conflictos es pública para facilitar reservas

---

Para más información sobre la arquitectura general, consulta el README principal en `/src`.

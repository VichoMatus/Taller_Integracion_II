# Módulo de Reseñas

Este módulo maneja la gestión completa de reseñas y calificaciones de complejos deportivos. Permite a los usuarios evaluar su experiencia y a los dueños interactuar con sus clientes, creando un sistema de feedback valioso.

## Arquitectura

```
resenas/
├── domain/                    # Capa de dominio
│   └── ResenaRepository.ts    # Interface del repositorio
├── application/              # Casos de uso
│   └── ResenasUseCases.ts    # CRUD y operaciones de reseñas
├── infrastructure/           # Capa de infraestructura
│   ├── ResenaApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts           # Mapeo entre entidades
└── presentation/            # Capa de presentación
    ├── controllers/         # Controladores HTTP
    └── routes/             # Definición de rutas
```

## Funcionalidades

### Gestión de Reseñas
- **Crear reseña**: Nueva reseña con validaciones de contenido
- **Listar reseñas**: Paginado con múltiples filtros
- **Obtener reseña**: Detalle de una reseña específica
- **Actualizar reseña**: Modificar calificación y comentario
- **Eliminar reseña**: Remover reseña del sistema (admin)
- **Sistema de likes**: Dar/quitar likes a reseñas
- **Reportar reseñas**: Sistema de moderación comunitaria
- **Respuestas de dueños**: Interacción dueño-cliente
- **Estadísticas**: Análisis detallado de calificaciones

## Entidades del Dominio

### Reseña
```typescript
interface Resena {
  id: number;
  usuarioId: number;
  complejoId: number;
  calificacion: number; // 1-5 estrellas
  comentario: string;
  estado: EstadoResena;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  respuestaDueno?: string;
  fechaRespuesta?: Date;
  verificada: boolean; // Usuario hizo reserva
  likes: number;
  reportes: number;
  // Información desnormalizada
  usuario?: { /* datos del usuario */ };
  complejo?: { /* datos del complejo */ };
}
```

### Estados de Reseñas
- **activa**: Reseña visible públicamente
- **oculta**: Reseña oculta temporalmente
- **reportada**: Reseña reportada pendiente de revisión
- **eliminada**: Reseña eliminada del sistema

### Sistema de Calificaciones
- **1 estrella**: Muy malo
- **2 estrellas**: Malo
- **3 estrellas**: Regular
- **4 estrellas**: Bueno
- **5 estrellas**: Excelente

## Endpoints API

### Endpoints Públicos (solo lectura)
```
GET    /resenas/complejo/:complejoId  # Reseñas de un complejo
GET    /resenas/estadisticas/:complejoId # Estadísticas de reseñas
GET    /resenas/:id                   # Obtener reseña específica
```

### Endpoints de Usuario (requieren autenticación)
```
GET    /resenas/usuario/:usuarioId    # Reseñas de un usuario
POST   /resenas                       # Crear nueva reseña
PATCH  /resenas/:id                   # Actualizar reseña (solo autor)
POST   /resenas/:id/like              # Dar like a reseña
DELETE /resenas/:id/like              # Quitar like de reseña
POST   /resenas/:id/reportar          # Reportar reseña
POST   /resenas/:id/responder         # Responder a reseña (dueño)
```

### Endpoints Administrativos (requieren rol admin/superadmin)
```
GET    /resenas                       # Listar todas las reseñas
DELETE /resenas/:id                   # Eliminar reseña
```

## Validaciones de Negocio

### Crear Reseña
- Calificación debe estar entre 1 y 5 estrellas
- Comentario es requerido (mínimo 10 caracteres, máximo 1000)
- Un usuario solo puede reseñar cada complejo una vez
- Validación de palabras ofensivas básicas
- Usuario debe existir y estar activo

### Actualizar Reseña
- Solo el autor puede modificar su reseña
- Mismas validaciones que crear reseña
- No se puede cambiar el complejo asociado

### Dar Like
- Un usuario solo puede dar un like por reseña
- No se puede dar like a reseñas propias

### Reportar Reseña
- Motivo del reporte es requerido
- Un usuario puede reportar múltiples veces

## Filtros de Búsqueda

### GET /resenas
- `page`: Número de página
- `pageSize`: Elementos por página
- `usuarioId`: Filtrar por usuario
- `complejoId`: Filtrar por complejo
- `calificacionMin`: Calificación mínima
- `calificacionMax`: Calificación máxima
- `estado`: Filtrar por estado
- `fechaDesde`: Fecha desde (ISO string)
- `fechaHasta`: Fecha hasta (ISO string)
- `soloVerificadas`: Solo reseñas de usuarios verificados
- `q`: Búsqueda en comentarios
- `ordenFecha`: Ordenar por fecha (asc/desc)

## Sistema de Moderación

### Detección Automática
- **Palabras ofensivas**: Lista básica de términos inapropiados
- **Spam**: Reseñas muy similares del mismo usuario
- **Longitud**: Comentarios demasiado cortos o largos
- **Calificaciones extremas**: Patrones sospechosos

### Moderación Manual
- **Reportes de usuarios**: Sistema de flagging comunitario
- **Revisión admin**: Herramientas para revisar contenido reportado
- **Estados de moderación**: Ocultar/mostrar reseñas
- **Historial**: Tracking de cambios y moderaciones

## Autorización

### Permisos por Rol
- **Público**: Leer reseñas y estadísticas
- **Usuario**: Crear, editar sus reseñas, dar likes, reportar
- **Dueño**: Responder a reseñas de sus complejos
- **Admin/Superadmin**: Gestión completa, moderación

### Políticas de Seguridad
- Un usuario = una reseña por complejo
- Solo el autor puede editar su reseña
- Dueños solo responden en sus complejos
- Sistema anti-spam automático

## Gamificación

### Para Usuarios
- **Reseñas verificadas**: Badge especial para usuarios que reservaron
- **Contribuidor**: Badge por cantidad de reseñas útiles
- **Likes recibidos**: Puntos por reseñas útiles valoradas

### Para Dueños
- **Responsivo**: Badge por responder rápidamente
- **Calidad**: Badge por mantener alta calificación
- **Mejora continua**: Badge por tendencia positiva

---

Para más información sobre la arquitectura general, consulta el README principal en `/src`.

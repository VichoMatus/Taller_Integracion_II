# Backend - Sistema de Gestión de Usuarios

Este backend implementa un sistema de gestión de usuarios con arquitectura hexagonal, enfocado en la administración de roles y permisos.

## Arquitectura General

```
src/
├── admin/                 # Módulo de administración
├── canchas/              # Módulo de canchas
├── complejos/            # Módulo de complejos
├── reservas/             # Módulo de reservas
├── bloqueos/             # Módulo de bloqueos
├── resenas/              # Módulo de reseñas
├── uploads/              # Módulo de uploads
├── domain/               # Entidades del dominio
├── app/                  # Utilidades comunes de aplicación
├── infra/                # Infraestructura (HTTP, base de datos)
├── interfaces/           # Interfaces y contratos
├── config/               # Configuración centralizada
└── index.ts             # Punto de entrada de la aplicación
```

## Módulos Principales

### 📁 `/admin` - Módulo de Administración
Gestión completa de usuarios y roles del sistema.

**Funcionalidades:**
- CRUD de usuarios (crear, leer, actualizar, eliminar)
- Asignación y gestión de roles
- Paginación y filtros de búsqueda
- Políticas de seguridad por rol

**Endpoints principales:**
```
GET    /admin/users          # Listar usuarios
GET    /admin/users/:id      # Obtener usuario
PATCH  /admin/users/:id      # Actualizar usuario
DELETE /admin/users/:id      # Eliminar usuario
POST   /admin/users/:id/role # Asignar rol
```

### 📁 `/domain` - Dominio de la Aplicación
Entidades principales y lógica de negocio.

- **User**: Entidad principal del usuario con roles y datos personales
- **Roles**: Sistema de permisos (usuario, dueno, admin, superadmin)

### 📁 `/app/common` - Utilidades Comunes
Funciones auxiliares reutilizables en toda la aplicación.

- **Pagination**: Manejo estándar de respuestas paginadas
- **Case conversion**: Conversión entre camelCase y snake_case

### 📁 `/infra` - Infraestructura
Adaptadores para servicios externos y configuración.

- **HTTP Client**: Cliente configurado para comunicación con FastAPI
- **Error handling**: Manejo centralizado de errores HTTP

### 📁 `/interfaces` - Contratos e Interfaces
Definiciones de contratos y estructuras de datos.

- **API Envelope**: Formato estándar de respuestas API
- **Auth utilities**: Utilidades de autenticación

### 📁 `/reservas` - Módulo de Reservas
Gestión completa de reservas de canchas deportivas.

**Funcionalidades:**
- CRUD de reservas con validaciones de negocio
- Verificación de disponibilidad en tiempo real
- Gestión de pagos y confirmaciones
- Sistema de cancelaciones con motivos
- Filtros avanzados por usuario, cancha, fecha, estado

**Endpoints principales:**
```
GET    /reservas                       # Listar reservas (admin)
POST   /reservas                       # Crear nueva reserva
GET    /reservas/:id                   # Obtener reserva específica
PATCH  /reservas/:id                   # Actualizar reserva
DELETE /reservas/:id                   # Eliminar reserva (admin)
POST   /reservas/verificar-disponibilidad # Verificar disponibilidad
GET    /reservas/usuario/:usuarioId    # Reservas de un usuario
POST   /reservas/:id/confirmar-pago    # Confirmar pago
POST   /reservas/:id/cancelar          # Cancelar reserva
```

### 📁 `/bloqueos` - Módulo de Bloqueos
Gestión completa de bloqueos de disponibilidad de canchas.

**Funcionalidades:**
- CRUD de bloqueos con validaciones de conflictos
- Verificación de solapamientos entre bloqueos
- Gestión de estados (activo, inactivo, vencido, cancelado)
- Bloqueos recurrentes con patrones personalizados
- Filtros avanzados por cancha, tipo, fechas, creador

**Endpoints principales:**
```
GET    /bloqueos                       # Listar bloqueos (admin)
POST   /bloqueos                       # Crear nuevo bloqueo
GET    /bloqueos/:id                   # Obtener bloqueo específico
PATCH  /bloqueos/:id                   # Actualizar bloqueo
DELETE /bloqueos/:id                   # Eliminar bloqueo (admin)
POST   /bloqueos/verificar-conflicto   # Verificar conflictos
GET    /bloqueos/activos/:canchaId     # Bloqueos activos de cancha
GET    /bloqueos/creador/:creadoPorId  # Bloqueos de un creador
POST   /bloqueos/:id/activar           # Activar bloqueo
POST   /bloqueos/:id/desactivar        # Desactivar bloqueo
```

### 📁 `/resenas` - Módulo de Reseñas
Gestión completa de reseñas y calificaciones de complejos deportivos.

**Funcionalidades:**
- CRUD de reseñas con validaciones de contenido
- Sistema de calificaciones de 1-5 estrellas
- Likes y reportes de reseñas
- Respuestas de dueños a reseñas
- Estadísticas detalladas de calificaciones
- Prevención de reseñas duplicadas
- Moderación de contenido inapropiado

**Endpoints principales:**
```
GET    /resenas                       # Listar reseñas (admin)
POST   /resenas                       # Crear nueva reseña
GET    /resenas/:id                   # Obtener reseña específica
PATCH  /resenas/:id                   # Actualizar reseña
DELETE /resenas/:id                   # Eliminar reseña (admin)
GET    /resenas/complejo/:complejoId  # Reseñas de un complejo
GET    /resenas/usuario/:usuarioId    # Reseñas de un usuario
POST   /resenas/:id/like              # Dar like a reseña
DELETE /resenas/:id/like              # Quitar like de reseña
POST   /resenas/:id/reportar          # Reportar reseña
POST   /resenas/:id/responder         # Responder a reseña (dueño)
GET    /resenas/estadisticas/:complejoId # Estadísticas de reseñas
```

### 📁 `/uploads` - Módulo de Uploads
Gestión completa de archivos subidos (imágenes, documentos, videos).

**Funcionalidades:**
- Upload de archivos con validaciones de seguridad
- Procesamiento automático de imágenes (thumbnails, compresión)
- Gestión de metadatos y categorización
- Detección de duplicados por hash
- Limpieza automática de archivos expirados
- Estadísticas de uso y almacenamiento
- Asociación con entidades del sistema

**Endpoints principales:**
```
GET    /uploads                       # Listar uploads (admin)
POST   /uploads                       # Subir nuevo archivo
GET    /uploads/:id                   # Obtener upload específico
PATCH  /uploads/:id                   # Actualizar metadatos
DELETE /uploads/:id                   # Eliminar archivo
GET    /uploads/usuario/:usuarioId    # Uploads de un usuario
GET    /uploads/entidad/:tipo/:id     # Uploads de una entidad
POST   /uploads/:id/processed         # Marcar como procesado
GET    /uploads/stats                 # Estadísticas de uso
POST   /uploads/cleanup               # Limpiar archivos expirados
```

## Sistema de Roles

### Jerarquía de Permisos
```
superadmin > admin > dueno > usuario
```

### Roles Disponibles
- **usuario**: Usuario básico del sistema
- **dueno**: Propietario de establecimiento
- **admin**: Administrador con permisos de gestión
- **superadmin**: Administrador con permisos completos

### Políticas de Seguridad
- Solo `admin` y `superadmin` pueden acceder a endpoints administrativos
- Solo `superadmin` puede asignar roles `admin` o `superadmin`
- Los `admin` pueden gestionar usuarios regulares y `dueno`

## Integración con FastAPI

El backend se comunica con un servicio FastAPI que maneja:

- **Autenticación**: Validación de tokens JWT
- **Persistencia**: Base de datos PostgreSQL
- **Validación**: Esquemas Pydantic
- **Documentación**: OpenAPI/Swagger automático

### Formato de Datos
- **Entrada**: snake_case (estándar Python)
- **Salida**: camelCase (estándar JavaScript)
- **Conversión**: Automática mediante utilidades

## Autenticación y Autorización

### Flujo de Autenticación
1. Usuario envía credenciales al FastAPI
2. FastAPI retorna JWT token
3. Frontend incluye token en header `Authorization: Bearer <token>`
4. Middleware extrae y valida el token
5. Información del usuario disponible en `req.user`

### Middleware de Autorización
```typescript
// Ejemplo de protección de endpoint
router.get("/admin-only", 
  requireRole("admin", "superadmin"), 
  controller.handler
);
```

## Desarrollo

### Estructura de Archivos
Cada módulo sigue la arquitectura hexagonal:

```
module/
├── domain/           # Interfaces y entidades
├── application/      # Casos de uso
├── infrastructure/   # Implementaciones
└── presentation/     # Controladores y rutas
└── config/           # 
```

### Patrones Implementados
- **Repository Pattern**: Abstracción de acceso a datos
- **Use Cases**: Lógica de negocio encapsulada
- **Dependency Injection**: Inversión de control
- **Error Boundary**: Manejo centralizado de errores

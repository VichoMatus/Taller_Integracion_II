# Módulo de Administración

Este módulo maneja la gestión de usuarios y asignación de roles en el sistema. Implementa una arquitectura hexagonal con separación clara entre dominio, aplicación e infraestructura.

## Arquitectura

```
admin/
├── domain/                 # Capa de dominio
│   └── AdminRepository.ts  # Interface del repositorio
├── application/           # Casos de uso
│   ├── AsignarRol.ts     # Asignar roles a usuarios
│   ├── UsersUseCases.ts  # CRUD de usuarios
│   └── dtos.ts           # DTOs de entrada/salida
├── infrastructure/        # Capa de infraestructura
│   ├── AdminApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts        # Mapeo entre entidades
└── presentation/         # Capa de presentación
    ├── controllers/      # Controladores HTTP
    ├── routes/          # Definición de rutas
    └── guards/          # Middleware de autenticación/autorización
```

## Funcionalidades

### Gestión de Usuarios
- **Listar usuarios**: Paginado con filtros por búsqueda y rol
- **Obtener usuario**: Detalle de un usuario específico
- **Actualizar usuario**: Modificar datos del usuario
- **Eliminar usuario**: Remover usuario del sistema

### Gestión de Roles
- **Asignar rol**: Cambiar el rol de un usuario
- **Políticas de permisos**: Solo superadmin puede asignar roles admin/superadmin

## Roles del Sistema

- **admin**: Puede gestionar usuarios regulares
- **superadmin**: Puede gestionar todos los usuarios y asignar cualquier rol

## Endpoints API

### Usuarios
```
GET    /admin/users         # Listar usuarios (paginado)
GET    /admin/users/:id     # Obtener usuario por ID
PATCH  /admin/users/:id     # Actualizar usuario
DELETE /admin/users/:id     # Eliminar usuario
```

### Roles
```
POST   /admin/users/:id/role # Asignar rol a usuario
```

## Parámetros de Consulta

### GET /admin/users
- `page`: Número de página (opcional)
- `pageSize`: Tamaño de página (opcional)
- `q`: Texto de búsqueda (opcional)
- `rol`: Filtrar por rol (opcional)

## Autenticación y Autorización

Todos los endpoints requieren:
1. **Autenticación**: Token Bearer válido
2. **Autorización**: Rol admin o superadmin

### Políticas de Seguridad
- Solo usuarios con rol `admin` o `superadmin` pueden acceder
- Solo `superadmin` puede asignar roles `admin` o `superadmin`
- Los admins pueden gestionar usuarios regulares

## Integración con FastAPI

Este módulo se comunica con un backend FastAPI que maneja:
- Autenticación de usuarios
- Persistencia de datos
- Validación de permisos

## Manejo de Errores

El sistema implementa manejo centralizado de errores con:
- Códigos de estado HTTP apropiados
- Mensajes de error descriptivos
- Detalles adicionales para debugging

## Ejemplos de Uso

### Listar usuarios con filtros
```bash
GET /admin/users?page=1&pageSize=10&q=john&rol=admin
```

### Asignar rol superadmin
```bash
POST /admin/users/123/role
Content-Type: application/json

{
  "rol": "superadmin"
}
```

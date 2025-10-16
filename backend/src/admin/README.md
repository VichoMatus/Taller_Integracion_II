# Módulo Owner/Administrador de Complejos

Este módulo maneja la gestión de complejos, canchas y reservas para dueños de establecimientos deportivos. Implementa una arquitectura hexagonal con separación clara entre dominio, aplicación e infraestructura.

## Arquitectura

```
admin/
├── domain/                 # Capa de dominio
│   └── AdminRepository.ts  # Interface del repositorio
├── application/           # Casos de uso de negocio
│   ├── UsersUseCases.ts  # Casos de uso para owners
│   └── dtos.ts           # DTOs y mappers
├── infrastructure/        # Capa de infraestructura
│   └── AdminApiRepository.ts # Implementación con APIs existentes
└── presentation/         # Capa de presentación
    ├── controllers/      # Controladores HTTP
    ├── routes/          # Definición de rutas
    └── guards/          # Middleware de autorización

# Entidades del dominio (separadas):
src/domain/
├── admin/Owner.ts        # Entidades específicas del owner
├── complejo/Complejo.ts  # Entidad Complejo (reutilizada)
└── cancha/Cancha.ts     # Entidad Cancha (reutilizada)
```

## Funcionalidades

### Panel Owner (Mis Recursos)
- **Mis complejos**: Lista los complejos del owner logueado
- **Mis canchas**: Lista las canchas del owner
- **Mis reservas**: Reservas de las canchas del owner
- **Estadísticas**: KPIs de negocio (ingresos, ocupación, horas pico)

### Gestión de Complejos
- **Crear complejo**: Registrar nuevo establecimiento deportivo
- **Editar complejo**: Modificar datos, horarios, información
- **Ver estadísticas**: Métricas de ocupación e ingresos

### Gestión de Canchas
- **Crear cancha**: Agregar nueva cancha al complejo
- **Editar cancha**: Modificar precios, superficie, disponibilidad
- **Gestionar fotos**: Subir/eliminar imágenes de canchas
- **Configurar precios**: Definir tarifas por horario y tipo

### Gestión de Reservas
- **Ver reservas**: Lista de reservas de sus canchas
- **Confirmar reservas**: Aprobar reservas pendientes
- **Gestionar cancelaciones**: Manejar política de cancelaciones
- **Check-in/No-show**: Marcar asistencia de clientes

## Roles Aplicables

- **admin **: Propietario/Administrador de establecimiento deportivo  
- **superadmin**: Administración del sistema completo

> **Nota**: Owner y Admin son la misma entidad de negocio. 
> Ambos roles gestionan complejos deportivos con los mismos permisos.

## Endpoints API

### Panel Owner
```
GET    /admin/mis/complejos      # Mis complejos (del owner logueado)
GET    /admin/mis/canchas        # Mis canchas
GET    /admin/mis/reservas       # Reservas de mis canchas
GET    /admin/mis/estadisticas   # KPIs de negocio
```

### Gestión de Complejos
```
GET    /admin/complejos          # Lista mis complejos
POST   /admin/complejos          # Crear complejo
GET    /admin/complejos/:id      # Detalle del complejo
PATCH  /admin/complejos/:id      # Editar complejo
DELETE /admin/complejos/:id      # Eliminar complejo
```

### Gestión de Canchas
```
GET    /admin/canchas            # Lista mis canchas
POST   /admin/canchas            # Crear cancha
GET    /admin/canchas/:id        # Detalle de cancha
PATCH  /admin/canchas/:id        # Editar cancha
DELETE /admin/canchas/:id        # Eliminar cancha
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

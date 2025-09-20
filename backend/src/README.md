# Backend - Sistema de Gestión de Usuarios

Este backend implementa un sistema de gestión de usuarios con arquitectura hexagonal, enfocado en la administración de roles y permisos.

## Arquitectura General

```
src/
├── admin/                 # Módulo de administración
├── domain/               # Entidades del dominio
├── app/                  # Utilidades comunes de aplicación
├── infra/                # Infraestructura (HTTP, base de datos)
├── interfaces/           # Interfaces y contratos
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

## Manejo de Errores

### Estructura Estándar
```typescript
{
  ok: false,
  error: {
    code: 404,
    message: "Usuario no encontrado",
    details: { /* información adicional */ }
  }
}
```

### Tipos de Errores
- **400**: Datos de entrada inválidos
- **401**: No autenticado
- **403**: Permisos insuficientes
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## Paginación

### Parámetros de Consulta
- `page`: Número de página (base 1)
- `pageSize`: Elementos por página
- `q`: Texto de búsqueda
- `rol`: Filtro por rol

### Respuesta Estándar
```typescript
{
  ok: true,
  data: {
    items: [...],      // Elementos de la página
    page: 1,           // Página actual
    pageSize: 10,      // Tamaño de página
    total: 150         // Total de elementos
  }
}
```

## Configuración

### Variables de Entorno
```bash
FASTAPI_URL=http://localhost:8000    # URL del servicio FastAPI
JWT_SECRET=your-secret-key           # Clave para JWT
DATABASE_URL=postgresql://...        # URL de base de datos
```

### Dependencias Principales
- **Express**: Framework web
- **Axios**: Cliente HTTP
- **TypeScript**: Tipado estático
- **JWT**: Autenticación

## Desarrollo

### Estructura de Archivos
Cada módulo sigue la arquitectura hexagonal:

```
module/
├── domain/           # Interfaces y entidades
├── application/      # Casos de uso
├── infrastructure/   # Implementaciones
└── presentation/     # Controladores y rutas
```

### Patrones Implementados
- **Repository Pattern**: Abstracción de acceso a datos
- **Use Cases**: Lógica de negocio encapsulada
- **Dependency Injection**: Inversión de control
- **Error Boundary**: Manejo centralizado de errores

## Testing

### Estrategia de Pruebas
- **Unit tests**: Casos de uso y lógica de negocio
- **Integration tests**: Endpoints y repositorios
- **E2E tests**: Flujos completos de usuario

### Headers de Prueba
Para testing, se puede usar header `x-user-role`:
```bash
curl -H "x-user-role: admin" /admin/users
```

## Documentación de API

La documentación completa de endpoints está disponible en:
- FastAPI Swagger: `http://localhost:8000/docs`
- Comentarios JSDoc en el código fuente
- Tests de integración como ejemplos

## Próximas Funcionalidades

- [ ] Auditoría de cambios de roles
- [ ] Notificaciones por email
- [ ] API de reportes
- [ ] Integración con servicios externos
- [ ] Cache de consultas frecuentes

---

Para más detalles sobre módulos específicos, consulta los README individuales en cada carpeta.

# 👑 SuperAdmin Module - Endpoints

## 📋 **Endpoints Disponibles**

### 🔐 **Autenticación de Administrador**

#### `POST /api/superadmin/auth/login`
Iniciar sesión como administrador o superadministrador.

#### `POST /api/superadmin/auth/logout`
Cerrar sesión del administrador.

### 👥 **Gestión de Usuarios**

#### `GET /api/superadmin/users`
Obtener lista paginada de usuarios del sistema.

#### `GET /api/superadmin/users/:id`
Obtener detalles específicos de un usuario.

#### `PATCH /api/superadmin/users/:id`
Actualizar datos de un usuario específico.

#### `DELETE /api/superadmin/users/:id`
Desactivar/eliminar usuario del sistema (soft delete).

### 🏟️ **Gestión de Complejos Deportivos**

#### `GET /api/superadmin/complejos`
Listar todos los complejos deportivos.

#### `GET /api/superadmin/complejos/:id`
Obtener detalles de un complejo deportivo específico.

#### `GET /api/superadmin/complejos/:id/canchas`
Obtener todas las canchas de un complejo específico.

### 🛠️ **Administración del Sistema (SuperAdmin)**

#### `POST /api/superadmin/system/parameters`
Actualizar parámetros y configuraciones del sistema.

#### `GET /api/superadmin/system/statistics`
Obtener estadísticas generales del sistema.

#### `GET /api/superadmin/system/logs`
Consultar logs del sistema para auditoría.

### 📊 **Dashboard y Utilidades**

#### `GET /api/superadmin/dashboard`
Obtener datos para el dashboard principal de administración.

#### `GET /api/superadmin/search?q=term`
Realizar búsqueda global en todo el sistema.

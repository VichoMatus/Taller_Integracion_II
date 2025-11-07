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
GET    /admin/complejos                                  # Lista mis complejos
POST   /admin/complejos                                  # Crear complejo
GET    /admin/complejos/:id                              # Detalle del complejo
GET    /admin/complejos/:id/estadisticas                 # Estadísticas detalladas del complejo ✨
GET    /admin/complejos/:id/estadisticas/reservas-semana # Reservas por día de la semana (gráfico) ✨
GET    /admin/complejos/:id/estadisticas/reservas-cancha # Reservas por cancha (gráfico comparativo) ✨ NUEVO
PATCH  /admin/complejos/:id                              # Editar complejo
DELETE /admin/complejos/:id                              # Eliminar complejo
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

### Obtener estadísticas detalladas de un complejo
```bash
GET /admin/complejos/1/estadisticas
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "complejo_id": 1,
    "complejo_nombre": "Complejo Deportivo Central",
    "total_canchas": 5,
    "canchas_activas": 4,
    "canchas_inactivas": 1,
    "reservas_ultimo_mes": 85,
    "reservas_confirmadas_ultimo_mes": 72,
    "reservas_pendientes_ultimo_mes": 8,
    "reservas_canceladas_ultimo_mes": 5,
    "ingresos_ultimo_mes": 360000,
    "ocupacion_promedio": 7.5,
    "fecha_desde": "2025-10-04",
    "fecha_hasta": "2025-11-03"
  }
}
```

### Obtener reservas por día de la semana (para gráficos)
```bash
GET /admin/complejos/1/estadisticas/reservas-semana?dias=30
Authorization: Bearer {token}
```

**Parámetros opcionales:**
- `dias`: Número de días hacia atrás para analizar (por defecto: 30)

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "complejo_id": 1,
    "complejo_nombre": "Complejo Deportivo Central",
    "dias": [
      {
        "dia_numero": 1,
        "dia_nombre": "Lunes",
        "total_reservas": 15,
        "reservas_confirmadas": 12,
        "reservas_pendientes": 2,
        "reservas_canceladas": 1,
        "ingresos": 60000
      },
      {
        "dia_numero": 2,
        "dia_nombre": "Martes",
        "total_reservas": 18,
        "reservas_confirmadas": 16,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 80000
      },
      {
        "dia_numero": 3,
        "dia_nombre": "Miércoles",
        "total_reservas": 20,
        "reservas_confirmadas": 18,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 90000
      },
      {
        "dia_numero": 4,
        "dia_nombre": "Jueves",
        "total_reservas": 17,
        "reservas_confirmadas": 15,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 75000
      },
      {
        "dia_numero": 5,
        "dia_nombre": "Viernes",
        "total_reservas": 25,
        "reservas_confirmadas": 22,
        "reservas_pendientes": 2,
        "reservas_canceladas": 1,
        "ingresos": 110000
      },
      {
        "dia_numero": 6,
        "dia_nombre": "Sábado",
        "total_reservas": 30,
        "reservas_confirmadas": 28,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 140000
      },
      {
        "dia_numero": 0,
        "dia_nombre": "Domingo",
        "total_reservas": 22,
        "reservas_confirmadas": 20,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 100000
      }
    ],
    "fecha_desde": "2025-10-04",
    "fecha_hasta": "2025-11-03",
    "total_reservas": 147,
    "dia_mas_popular": "Sábado",
    "dia_menos_popular": "Lunes"
  }
}
```

**Uso para gráfico de barras:**
```javascript
// Ejemplo con Chart.js
const labels = datos.dias.map(d => d.dia_nombre);
const values = datos.dias.map(d => d.total_reservas);

const chartData = {
  labels: labels,  // ['Lunes', 'Martes', 'Miércoles', ...]
  datasets: [{
    label: 'Reservas por día',
    data: values,  // [15, 18, 20, 17, 25, 30, 22]
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 1
  }]
};
```

### Obtener reservas por cancha (para gráficos comparativos)
```bash
GET /admin/complejos/1/estadisticas/reservas-cancha?dias=30
Authorization: Bearer {token}
```

**Parámetros opcionales:**
- `dias`: Número de días hacia atrás para analizar (por defecto: 30)

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "complejo_id": 1,
    "complejo_nombre": "Complejo Deportivo Central",
    "canchas": [
      {
        "cancha_id": 3,
        "cancha_nombre": "Cancha Fútbol 7 Premium",
        "tipo_cancha": "futbol",
        "total_reservas": 45,
        "reservas_confirmadas": 40,
        "reservas_pendientes": 3,
        "reservas_canceladas": 2,
        "ingresos": 200000,
        "ocupacion_porcentaje": 16.67
      },
      {
        "cancha_id": 1,
        "cancha_nombre": "Cancha Fútbol 5 A",
        "tipo_cancha": "futbol",
        "total_reservas": 38,
        "reservas_confirmadas": 35,
        "reservas_pendientes": 2,
        "reservas_canceladas": 1,
        "ingresos": 175000,
        "ocupacion_porcentaje": 14.58
      },
      {
        "cancha_id": 5,
        "cancha_nombre": "Cancha Básquet",
        "tipo_cancha": "basquet",
        "total_reservas": 25,
        "reservas_confirmadas": 22,
        "reservas_pendientes": 2,
        "reservas_canceladas": 1,
        "ingresos": 110000,
        "ocupacion_porcentaje": 9.17
      },
      {
        "cancha_id": 2,
        "cancha_nombre": "Cancha Fútbol 5 B",
        "tipo_cancha": "futbol",
        "total_reservas": 20,
        "reservas_confirmadas": 18,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 90000,
        "ocupacion_porcentaje": 7.5
      },
      {
        "cancha_id": 4,
        "cancha_nombre": "Cancha Tenis",
        "tipo_cancha": "tenis",
        "total_reservas": 12,
        "reservas_confirmadas": 10,
        "reservas_pendientes": 1,
        "reservas_canceladas": 1,
        "ingresos": 50000,
        "ocupacion_porcentaje": 4.17
      }
    ],
    "fecha_desde": "2025-10-04",
    "fecha_hasta": "2025-11-03",
    "total_reservas": 140,
    "cancha_mas_popular": "Cancha Fútbol 7 Premium",
    "cancha_menos_popular": "Cancha Tenis",
    "ingresos_totales": 625000
  }
}
```

**Uso para gráfico de barras comparativo:**
```javascript
// Ejemplo con Chart.js
const labels = data.canchas.map(c => c.cancha_nombre);
const values = data.canchas.map(c => c.total_reservas);
const ingresos = data.canchas.map(c => c.ingresos);

const chartData = {
  labels: labels,  // ['Cancha Fútbol 7 Premium', 'Cancha Fútbol 5 A', ...]
  datasets: [
    {
      label: 'Cantidad de Reservas',
      data: values,  // [45, 38, 25, 20, 12]
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    },
    {
      label: 'Ingresos ($)',
      data: ingresos,  // [200000, 175000, 110000, 90000, 50000]
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      yAxisID: 'y1'
    }
  ]
};
```

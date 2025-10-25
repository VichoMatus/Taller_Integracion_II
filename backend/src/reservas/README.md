# Módulo de Reservas

Este módulo maneja la gestión completa de reservas de canchas en el sistema. Implementa una arquitectura hexagonal con separación clara entre dominio, aplicación e infraestructura.

## Arquitectura

```
reservas/
├── domain/                    # Capa de dominio
│   └── ReservaRepository.ts   # Interface del repositorio
├── application/              # Casos de uso
│   └── ReservasUseCases.ts   # CRUD y operaciones de reservas
├── infrastructure/           # Capa de infraestructura
│   ├── ReservaApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts           # Mapeo entre entidades
└── presentation/            # Capa de presentación
    ├── controllers/         # Controladores HTTP
    └── routes/             # Definición de rutas
```

## Funcionalidades

### Gestión de Reservas
- **Crear reserva**: Nueva reserva con validaciones de disponibilidad
- **Listar reservas**: Paginado con múltiples filtros
- **Obtener reserva**: Detalle de una reserva específica
- **Actualizar reserva**: Modificar datos de la reserva
- **Eliminar reserva**: Remover reserva del sistema
- **Verificar disponibilidad**: Consultar horarios libres
- **Gestión de pagos**: Confirmar y gestionar pagos
- **Cancelación**: Cancelar reservas con motivos

## Entidades del Dominio

### Reserva
```typescript
interface Reserva {
  id: number;
  usuarioId: number;
  canchaId: number;
  complejoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoReserva;
  precioTotal: number;
  metodoPago?: MetodoPago;
  pagado: boolean;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  codigoConfirmacion?: string;
  // Información desnormalizada
  usuario?: { /* datos del usuario */ };
  cancha?: { /* datos de la cancha */ };
  complejo?: { /* datos del complejo */ };
}
```

### Estados de Reserva
- **pendiente**: Reserva creada pero sin confirmar pago
- **confirmada**: Reserva pagada y confirmada
- **cancelada**: Reserva cancelada por el usuario o admin
- **completada**: Reserva que ya se realizó
- **no_show**: Usuario no se presentó a la reserva

### Métodos de Pago
- **efectivo**: Pago en efectivo en el establecimiento
- **tarjeta**: Pago con tarjeta de crédito/débito
- **transferencia**: Transferencia bancaria
- **online**: Pago online (integración futura)

## Endpoints API

### Endpoints Normales (Usuario/Admin/SuperAdmin)
```
GET    /reservas/mias                  # Mis reservas (usuario autenticado)
GET    /reservas                       # Listado de reservas (admin/superadmin)
GET    /reservas/:id                   # Detalle de reserva
POST   /reservas/cotizar               # Cotizar reserva (precio)
POST   /reservas                       # Crear reserva
PATCH  /reservas/:id                   # Reprogramar/editar reserva
POST   /reservas/:id/confirmar         # Confirmar reserva (admin/superadmin)
POST   /reservas/:id/cancelar          # Cancelar reserva
```

### Endpoints Administrativos (Panel)
```
GET    /reservas/admin/cancha/:canchaId     # Reservas por cancha (panel admin)
GET    /reservas/admin/usuario/:usuarioId   # Reservas por usuario (panel admin)  
POST   /reservas/admin/crear                # Crear reserva como administrador
POST   /reservas/admin/:id/cancelar         # Cancelar reserva como administrador
```

## Validaciones de Negocio

### Crear Reserva
- Fecha de inicio debe ser futura
- Fecha de fin posterior a fecha de inicio
- Duración mínima: 1 hora
- Duración máxima: 8 horas
- Máximo 30 días de anticipación
- Verificar disponibilidad de la cancha

### Actualizar Reserva
- Si cambian fechas, reverificar disponibilidad
- Solo permitir cambios en reservas pendientes o confirmadas

## Filtros de Búsqueda

### GET /reservas
- `page`: Número de página
- `pageSize`: Elementos por página
- `usuarioId`: Filtrar por usuario
- `canchaId`: Filtrar por cancha
- `complejoId`: Filtrar por complejo
- `estado`: Filtrar por estado
- `fechaDesde`: Fecha desde (ISO string)
- `fechaHasta`: Fecha hasta (ISO string)
- `pagado`: Solo reservas pagadas (true/false)
- `codigoConfirmacion`: Buscar por código

## Autorización

### Permisos por Rol
- **Usuario**: Gestionar sus propias reservas
- **Dueño**: Ver reservas de sus complejos (futuro)
- **Admin/Superadmin**: Gestión completa de reservas

## Ejemplos de Uso

### Cotizar reserva (nuevo)
```bash
POST /reservas/cotizar
Content-Type: application/json

{
  "id_cancha": 1,
  "fecha": "2025-10-21",
  "inicio": "19:00",
  "fin": "20:30",
  "cupon": "OCT-10"
}
```

### Crear nueva reserva (formato actualizado)
```bash
POST /reservas
Content-Type: application/json

{
  "id_cancha": 1,
  "fecha": "2025-10-21",
  "inicio": "19:00", 
  "fin": "20:30",
  "notas": "Partido amistoso"
}
```

### Crear nueva reserva (formato legacy - compatible)
```bash
POST /reservas
Content-Type: application/json

{
  "usuarioId": 123,
  "canchaId": 1,
  "fechaInicio": "2024-12-20T10:00:00Z",
  "fechaFin": "2024-12-20T12:00:00Z",
  "metodoPago": "efectivo",
  "notas": "Cumpleaños de mi hijo"
}
```

### Confirmar reserva (admin)
```bash
POST /reservas/456/confirmar
Content-Type: application/json
Authorization: Bearer <admin_token>
```

### Cancelar reserva
```bash
POST /reservas/456/cancelar
Content-Type: application/json

{
  "motivo": "Cambio de planes por lluvia"
}
```

### Mis reservas
```bash
GET /reservas/mias
Authorization: Bearer <token>
```

### Crear reserva como admin
```bash
POST /reservas/admin/crear
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "id_usuario": 40,
  "id_cancha": 7,
  "fecha": "2025-10-22",
  "inicio": "18:00",
  "fin": "19:00"
}
```

## Flujo de Reserva Típico

1. **Usuario cotiza reserva** → `POST /reservas/cotizar` (obtiene precio)
2. **Usuario crea reserva** → `POST /reservas` (estado: pendiente)
3. **Admin confirma reserva** → `POST /reservas/:id/confirmar` (estado: confirmada)
4. **Sistema marca como completada** → automático después del horario
5. **Opcional: Usuario cancela** → `POST /reservas/:id/cancelar` (estado: cancelada)

## Flujo Administrativo

1. **Admin crea reserva directa** → `POST /reservas/admin/crear` (para cualquier usuario)
2. **Admin consulta reservas por cancha** → `GET /reservas/admin/cancha/:id`
3. **Admin cancela si es necesario** → `POST /reservas/admin/:id/cancelar`

## Integración con FastAPI

El módulo se comunica con endpoints FastAPI:
- `/reservas` - CRUD de reservas
- `/reservas/verificar-disponibilidad` - Verificación de horarios
- `/reservas/usuario/{id}` - Reservas por usuario
- `/reservas/{id}/confirmar-pago` - Gestión de pagos
- `/reservas/{id}/cancelar` - Cancelaciones

## Casos de Uso Futuros

- [ ] Integración con pasarelas de pago
- [ ] Notificaciones automáticas por email/SMS
- [ ] Recordatorios de reservas
- [ ] Sistema de descuentos y promociones
- [ ] Reservas recurrentes
- [ ] Lista de espera para horarios ocupados
- [ ] Integración con calendario personal
- [ ] Sistema de reseñas post-reserva

---

Para más información sobre la arquitectura general, consulta el README principal en `/src`.

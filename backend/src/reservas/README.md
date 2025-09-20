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

### Endpoints Públicos
```
POST   /reservas/verificar-disponibilidad  # Verificar disponibilidad
```

### Endpoints de Usuario
```
GET    /reservas/usuario/:usuarioId    # Reservas de un usuario
POST   /reservas                       # Crear nueva reserva
GET    /reservas/:id                   # Obtener reserva específica
PATCH  /reservas/:id                   # Actualizar reserva
POST   /reservas/:id/confirmar-pago    # Confirmar pago
POST   /reservas/:id/cancelar          # Cancelar reserva
```

### Endpoints Administrativos
```
GET    /reservas                       # Listar todas las reservas
DELETE /reservas/:id                   # Eliminar reserva
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

### Verificar disponibilidad
```bash
POST /reservas/verificar-disponibilidad
Content-Type: application/json

{
  "canchaId": 1,
  "fechaInicio": "2024-12-20T10:00:00Z",
  "fechaFin": "2024-12-20T12:00:00Z"
}
```

### Crear nueva reserva
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

### Confirmar pago
```bash
POST /reservas/456/confirmar-pago
Content-Type: application/json

{
  "metodoPago": "tarjeta"
}
```

### Cancelar reserva
```bash
POST /reservas/456/cancelar
Content-Type: application/json

{
  "motivo": "Cambio de planes por lluvia"
}
```

### Obtener reservas de usuario
```bash
GET /reservas/usuario/123?incluirPasadas=false
```

## Flujo de Reserva Típico

1. **Usuario verifica disponibilidad** → `POST /verificar-disponibilidad`
2. **Usuario crea reserva** → `POST /reservas` (estado: pendiente)
3. **Usuario confirma pago** → `POST /:id/confirmar-pago` (estado: confirmada)
4. **Sistema marca como completada** → automático después del horario
5. **Opcional: Usuario cancela** → `POST /:id/cancelar` (estado: cancelada)

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

# Módulo de Complejos Deportivos

Este módulo maneja la gestión completa de complejos deportivos en el sistema. Implementa una arquitectura hexagonal con separación clara entre dominio, aplicación e infraestructura.

## Arquitectura

```
complejos/
├── domain/                    # Capa de dominio
│   └── ComplejoRepository.ts  # Interface del repositorio
├── application/              # Casos de uso
│   └── ComplejosUseCases.ts  # CRUD y operaciones de complejos
├── infrastructure/           # Capa de infraestructura
│   ├── ComplejoApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts           # Mapeo entre entidades
└── presentation/            # Capa de presentación
    ├── controllers/         # Controladores HTTP
    └── routes/             # Definición de rutas
```

## Funcionalidades

### Gestión de Complejos
- **Listar complejos**: Paginado con múltiples filtros
- **Obtener complejo**: Detalle de un complejo específico
- **Crear complejo**: Agregar nuevo establecimiento al sistema
- **Actualizar complejo**: Modificar datos del complejo
- **Eliminar complejo**: Remover complejo del sistema
- **Cambiar estado**: Gestionar disponibilidad de complejos
- **Gestión por dueño**: Operaciones específicas para propietarios

## Entidades del Dominio

### Complejo
```typescript
interface Complejo {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono?: string;
  email?: string;
  estado: EstadoComplejo;
  horaApertura: string;
  horaCierre: string;
  servicios: ServicioComplejo[];
  activo: boolean;
  duenioId: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  imagenUrl?: string;
  calificacion?: number;
  totalResenas?: number;
}
```

### Estados de Complejo
- **activo**: Complejo en funcionamiento normal
- **inactivo**: Complejo temporalmente cerrado
- **mantenimiento**: Complejo en reparación/mantenimiento
- **cerrado**: Complejo cerrado permanentemente

### Servicios Disponibles
- **estacionamiento**: Estacionamiento disponible
- **cafeteria**: Servicio de cafetería/restaurant
- **vestuarios**: Vestuarios y camerinos
- **iluminacion**: Iluminación para juego nocturno
- **duchas**: Duchas disponibles
- **wifi**: Acceso a internet WiFi

## Endpoints API

### Endpoints Públicos (sin autenticación)
```
GET    /complejos              # Listar complejos (con filtros)
GET    /complejos/:id          # Obtener complejo específico
```

### Endpoints de Gestión (requieren autenticación)
```
GET    /complejos/duenio/:duenioId  # Complejos de un dueño
POST   /complejos                   # Crear nuevo complejo
PATCH  /complejos/:id              # Actualizar complejo
DELETE /complejos/:id              # Eliminar complejo
PATCH  /complejos/:id/estado       # Cambiar estado de complejo
```

## Filtros de Búsqueda

### GET /complejos
- `page`: Número de página
- `pageSize`: Elementos por página
- `q`: Búsqueda en nombre/descripción/dirección
- `estado`: Filtrar por estado
- `comuna`: Filtrar por comuna
- `region`: Filtrar por región
- `duenioId`: Filtrar por dueño
- `calificacionMin`: Calificación mínima
- `servicios`: Lista de servicios (separados por comas)

## Autorización

### Permisos por Rol
- **Público**: Consultar complejos
- **Dueño**: Gestionar sus propios complejos (futuro)
- **Admin/Superadmin**: Gestión completa de complejos

## Validaciones de Negocio

### Crear/Actualizar Complejo
- Nombre es requerido y no puede estar vacío
- Dirección es requerida
- Horarios deben estar en formato HH:mm
- Hora de apertura debe ser anterior a hora de cierre
- Dueño debe existir en el sistema

## Ejemplos de Uso

### Listar complejos en una comuna
```bash
GET /complejos?comuna=Temuco&page=1&pageSize=10
```

### Crear nuevo complejo
```bash
POST /complejos
Content-Type: application/json

{
  "nombre": "Complejo Deportivo Los Aromos",
  "descripcion": "Moderno complejo con canchas de fútbol y básquet",
  "direccion": "Av. Los Aromos 1234",
  "comuna": "Temuco",
  "region": "Araucanía",
  "telefono": "+56451234567",
  "email": "contacto@losaomos.cl",
  "horaApertura": "08:00",
  "horaCierre": "23:00",
  "servicios": ["estacionamiento", "vestuarios", "iluminacion", "wifi"],
  "duenioId": 123,
  "imagenUrl": "https://example.com/complejo.jpg"
}
```

### Buscar complejos con servicios específicos
```bash
GET /complejos?servicios=estacionamiento,wifi&calificacionMin=4
```

### Cambiar estado de complejo
```bash
PATCH /complejos/456/estado
Content-Type: application/json

{
  "estado": "mantenimiento"
}
```

## Integración con FastAPI

El módulo se comunica con endpoints FastAPI:
- `/complejos` - CRUD de complejos
- `/complejos/duenio/{duenio_id}` - Complejos por dueño
- `/complejos/{id}/estado` - Gestión de estados

## Casos de Uso Futuros

- [ ] Sistema de reseñas y calificaciones
- [ ] Gestión de horarios especiales
- [ ] Integración con sistema de reservas
- [ ] Notificaciones para dueños
- [ ] Dashboard de estadísticas
- [ ] Gestión de promociones y descuentos
- [ ] Integración con mapas y geolocalización

---

Para más información sobre la arquitectura general, consulta el README principal en `/src`.

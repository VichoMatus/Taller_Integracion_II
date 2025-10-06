# Módulo de Disponibilidad

Este módulo maneja la disponibilidad de canchas, horarios de funcionamiento y bloqueos temporales.

## Funcionalidades

### Disponibilidad & Agenda
- **Consultar disponibilidad**: Ver slots libres para canchas en rangos de fechas
- **Gestión de horarios**: Definir horarios de apertura/cierre por complejo o cancha
- **Gestión de bloqueos**: Crear bloqueos temporales o recurrentes

## Endpoints

### Disponibilidad
```
GET    /disponibilidad                    # Consultar slots disponibles
```

### Horarios 
```
GET    /horarios                         # Listar horarios del complejo/cancha
POST   /horarios                         # Crear nuevo horario
GET    /horarios/:id                     # Obtener horario específico  
PATCH  /horarios/:id                     # Actualizar horario
DELETE /horarios/:id                     # Eliminar horario
```

### Bloqueos
```
GET    /bloqueos                         # Listar bloqueos activos
POST   /bloqueos                         # Crear nuevo bloqueo
GET    /bloqueos/:id                     # Obtener bloqueo específico
DELETE /bloqueos/:id                     # Eliminar bloqueo
```

## Casos de Uso

### Disponibilidad
- **GetDisponibilidad**: Consulta slots disponibles con filtros

### Horarios
- **ListHorarios**: Lista horarios con filtros  
- **GetHorario**: Obtiene horario específico
- **CreateHorario**: Crea nuevo horario con validaciones
- **UpdateHorario**: Actualiza horario existente
- **DeleteHorario**: Elimina horario

### Bloqueos  
- **ListBloqueos**: Lista bloqueos con filtros
- **GetBloqueo**: Obtiene bloqueo específico
- **CreateBloqueo**: Crea nuevo bloqueo con validaciones
- **DeleteBloqueo**: Elimina bloqueo

## Validaciones

### Horarios
- No conflicto con horarios existentes en mismo día/cancha
- Hora apertura < hora cierre
- Formato de horarios válido (HH:MM)
- Días de semana válidos

### Bloqueos
- No conflicto con bloqueos existentes
- Fecha inicio <= fecha fin
- Fechas no en el pasado
- Validación de recurrencia

## Arquitectura

```
disponibilidad/
├── application/           # Casos de uso
├── domain/               # Entidades y contratos
├── infrastructure/       # Implementación de repositorios
└── presentation/         # Controllers y rutas
```

## Dependencias

- Módulo de auth (para permisos)
- Módulo de complejos (para validar existencia)
- Módulo de canchas (para validar existencia)
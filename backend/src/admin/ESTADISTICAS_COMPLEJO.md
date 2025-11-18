# Endpoint de Estadísticas de Complejo

## Descripción
Este endpoint proporciona estadísticas detalladas para un complejo deportivo específico, incluyendo información sobre canchas activas y reservas del último mes.

## Endpoint

```
GET /admin/complejos/:id/estadisticas
```

### Autenticación
- **Requerido**: Sí
- **Roles permitidos**: `admin`, `super_admin`
- **Header**: `Authorization: Bearer <token>`

### Parámetros

#### Path Parameters
- `id` (number, requerido): ID del complejo del cual se desean obtener las estadísticas

### Respuesta Exitosa

**Status Code**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "complejo_id": 1,
    "complejo_nombre": "Centro Deportivo La Cancha",
    "total_canchas": 8,
    "canchas_activas": 6,
    "canchas_inactivas": 2,
    "reservas_ultimo_mes": 145,
    "reservas_confirmadas_ultimo_mes": 132,
    "reservas_pendientes_ultimo_mes": 8,
    "reservas_canceladas_ultimo_mes": 5,
    "ingresos_ultimo_mes": 2640000,
    "ocupacion_promedio": 68.75,
    "fecha_desde": "2024-10-04",
    "fecha_hasta": "2024-11-03"
  }
}
```

### Respuesta de Error

**Status Code**: `401 Unauthorized`
```json
{
  "ok": false,
  "statusCode": 401,
  "message": "No autorizado"
}
```

**Status Code**: `403 Forbidden`
```json
{
  "ok": false,
  "statusCode": 403,
  "message": "No tienes permisos para acceder a este complejo"
}
```

**Status Code**: `404 Not Found`
```json
{
  "ok": false,
  "statusCode": 404,
  "message": "Complejo no encontrado"
}
```

## Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `complejo_id` | number | ID del complejo |
| `complejo_nombre` | string | Nombre del complejo |
| `total_canchas` | number | Cantidad total de canchas (activas + inactivas) |
| `canchas_activas` | number | Cantidad de canchas activas disponibles para reserva |
| `canchas_inactivas` | number | Cantidad de canchas inactivas o en mantenimiento |
| `reservas_ultimo_mes` | number | Total de reservas en los últimos 30 días |
| `reservas_confirmadas_ultimo_mes` | number | Reservas confirmadas en el último mes |
| `reservas_pendientes_ultimo_mes` | number | Reservas pendientes en el último mes |
| `reservas_canceladas_ultimo_mes` | number | Reservas canceladas en el último mes |
| `ingresos_ultimo_mes` | number | Ingresos totales del último mes (solo confirmadas) |
| `ocupacion_promedio` | number | Porcentaje de ocupación promedio (0-100) |
| `fecha_desde` | string | Fecha de inicio del período de análisis (YYYY-MM-DD) |
| `fecha_hasta` | string | Fecha de fin del período de análisis (YYYY-MM-DD) |

## Ejemplos de Uso

### cURL
```bash
curl -X GET "http://localhost:3000/admin/complejos/1/estadisticas" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3000/admin/complejos/1/estadisticas', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### Axios
```javascript
const axios = require('axios');

const response = await axios.get('http://localhost:3000/admin/complejos/1/estadisticas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data);
```

## Lógica de Cálculo

### Canchas Activas
Una cancha se considera **activa** si:
- `cancha.activa === true`
- `cancha.estado !== 'inactiva'`

### Período de Análisis
- **Último mes**: Se calculan los últimos 30 días desde la fecha actual
- **Fecha desde**: Hoy - 30 días
- **Fecha hasta**: Hoy

### Cálculo de Ingresos
- Solo se cuentan los ingresos de reservas con estado `'confirmada'`
- Se suma el campo `precio_total` de cada reserva confirmada

### Cálculo de Ocupación
La ocupación promedio se calcula como:
```
ocupacion_promedio = (reservas_confirmadas / (canchas_activas * 30 días * 8 slots por día)) * 100
```

**Nota**: Se asume un promedio de 8 slots de reserva por día y por cancha.

## Integración con Otros Endpoints

Este endpoint utiliza internamente los siguientes endpoints existentes:

1. **GET /complejos/:id** - Para obtener información del complejo
2. **GET /canchas?complejo_id=:id** - Para listar todas las canchas del complejo
3. **GET /reservas?complejo_id=:id&fecha_desde=X&fecha_hasta=Y** - Para obtener reservas del período

## Seguridad y Permisos

- ✅ Solo los **owners** del complejo pueden ver sus estadísticas
- ✅ Los **super_admin** pueden ver estadísticas de cualquier complejo
- ✅ El sistema verifica que el `ownerId` del token coincida con el dueño del complejo
- ❌ Los usuarios regulares no tienen acceso a este endpoint

## Casos de Uso

### Dashboard del Admin
```javascript
// Obtener estadísticas para mostrar en el dashboard
async function loadDashboard(complejoId) {
  const stats = await getEstadisticasComplejo(complejoId);
  
  // Mostrar métricas clave
  displayMetric('Canchas Activas', stats.canchas_activas);
  displayMetric('Reservas del Mes', stats.reservas_ultimo_mes);
  displayMetric('Ingresos del Mes', `$${stats.ingresos_ultimo_mes.toLocaleString()}`);
  displayMetric('Ocupación', `${stats.ocupacion_promedio}%`);
  
  // Gráfico de reservas por estado
  createPieChart([
    { label: 'Confirmadas', value: stats.reservas_confirmadas_ultimo_mes },
    { label: 'Pendientes', value: stats.reservas_pendientes_ultimo_mes },
    { label: 'Canceladas', value: stats.reservas_canceladas_ultimo_mes }
  ]);
}
```

### Comparación de Complejos
```javascript
// Comparar estadísticas de múltiples complejos
async function compareComplejos(complejoIds) {
  const comparisons = await Promise.all(
    complejoIds.map(id => getEstadisticasComplejo(id))
  );
  
  // Encontrar el complejo con mejor rendimiento
  const mejorComplejo = comparisons.reduce((mejor, actual) => 
    actual.ocupacion_promedio > mejor.ocupacion_promedio ? actual : mejor
  );
  
  console.log(`Mejor complejo: ${mejorComplejo.complejo_nombre}`);
}
```

### Alertas de Rendimiento
```javascript
// Detectar complejos con bajo rendimiento
async function checkPerformance(complejoId) {
  const stats = await getEstadisticasComplejo(complejoId);
  
  const alerts = [];
  
  if (stats.ocupacion_promedio < 30) {
    alerts.push('⚠️ Ocupación baja - considera promociones');
  }
  
  if (stats.canchas_inactivas > stats.canchas_activas) {
    alerts.push('⚠️ Más canchas inactivas que activas');
  }
  
  if (stats.reservas_canceladas_ultimo_mes > stats.reservas_confirmadas_ultimo_mes * 0.1) {
    alerts.push('⚠️ Alta tasa de cancelación (>10%)');
  }
  
  return alerts;
}
```

## Notas Técnicas

### Arquitectura
- **Dominio**: `EstadisticasComplejo` interface en `/domain/admin/Owner.ts`
- **Repositorio**: `AdminRepository.getEstadisticasComplejo()` en `/domain/AdminRepository.ts`
- **Infraestructura**: `AdminApiRepository.getEstadisticasComplejo()` en `/infraestructure/AdminApiRepository.ts`
- **Caso de Uso**: `GetEstadisticasComplejo` en `/application/UsersUseCases.ts`
- **Controlador**: `AdminController.getEstadisticasComplejo()` en `/presentation/controllers/admin.controller.ts`
- **Ruta**: `/admin/complejos/:id/estadisticas` en `/presentation/routes/admin.routes.ts`

### Dependencias
Este endpoint depende de:
- Módulo de **Canchas** para obtener información de canchas
- Módulo de **Reservas** para obtener información de reservas
- Módulo de **Complejos** para obtener información del complejo

### Performance
- Las consultas se realizan de forma paralela cuando es posible
- El cálculo se realiza en tiempo real basado en los últimos 30 días
- Considerar implementar caché si se requieren consultas frecuentes

## Mejoras Futuras

1. **Caché de Estadísticas**: Implementar Redis para cachear resultados
2. **Períodos Personalizables**: Permitir que el admin defina el rango de fechas
3. **Comparación Histórica**: Comparar con meses anteriores
4. **Exportación**: Exportar estadísticas en PDF o Excel
5. **Alertas Automáticas**: Notificaciones cuando las métricas caen bajo ciertos umbrales
6. **Gráficos**: Endpoint adicional para obtener datos para gráficos temporales

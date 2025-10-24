# 📋 Guía de Migración: Endpoints de Reservas Actualizados

## 🚀 Resumen de Cambios

Los endpoints de reservas han sido actualizados para sincronizarse con la versión de Taller4. Este documento explica cómo migrar el código del frontend para usar los nuevos endpoints.

## 🔄 Cambios Principales

### Endpoints Actualizados

#### Antes (Desactualizado)
```typescript
// ❌ Endpoints antiguos
GET /api/v1/reservas              -> Listado general
GET /api/v1/reservas/mias         -> Mis reservas  
POST /api/v1/reservas             -> Crear reserva
```

#### Ahora (Actualizado)
```typescript
// ✅ Endpoints nuevos
GET /api/reservas                 -> Listado general (admin/superadmin)
GET /api/reservas/mias            -> Mis reservas (usuario autenticado)
POST /api/reservas                -> Crear reserva
POST /api/reservas/cotizar        -> Cotizar precio (NUEVO)
POST /api/reservas/{id}/confirmar -> Confirmar reserva (admin)
GET /api/reservas/admin/cancha/{id}   -> Reservas por cancha (admin)
GET /api/reservas/admin/usuario/{id}  -> Reservas por usuario (admin)
POST /api/reservas/admin/crear        -> Crear como admin
```

### Nuevos Formatos de Datos

#### Formato Legacy (Compatible)
```typescript
interface CreateReservaInput {
  usuarioId: number;
  canchaId: number;
  fechaInicio: string;  // "2025-10-25T19:00:00Z"
  fechaFin: string;     // "2025-10-25T20:30:00Z"
  notas?: string;
}
```

#### Formato Nuevo (Taller4)
```typescript
interface CreateReservaInputNew {
  id_cancha: number;
  fecha: string;        // "2025-10-25"
  inicio: string;       // "19:00"
  fin: string;          // "20:30"
  notas?: string;
}
```

## 📁 Archivos Nuevos Disponibles

### 1. Servicios Actualizados
- `src/services/reservaService.ts` - ✅ Actualizado con nuevos endpoints
- `src/types/reserva.ts` - ✅ Tipos actualizados (legacy + nuevo)

### 2. Nuevas Utilidades
- `src/utils/reservaUtils.ts` - 🆕 Funciones helper para formato y validación
- `src/hooks/useReservas.ts` - 🆕 Hooks personalizados para reservas

### 3. Ejemplos de Migración
- `src/app/usuario/Reservas/ReservasActualizadas.example.tsx` - 🆕 Ejemplo de página actualizada

## 🛠️ Instrucciones de Migración

### Paso 1: Importar Nuevos Tipos

```typescript
// ANTES
import { Reserva, CreateReservaInput } from '@/types/reserva';

// AHORA
import { 
  Reserva, 
  CreateReservaInput, 
  CreateReservaInputNew,  // Nuevo formato
  CotizacionInputNew,     // Para cotizaciones
  CotizacionResponseNew 
} from '@/types/reserva';
```

### Paso 2: Usar Nuevas Utilidades

```typescript
// ANTES - Lógica duplicada en cada componente
const formatDate = (dateString: string) => {
  // Código personalizado...
};

// AHORA - Utilidades centralizadas
import { formatearFecha, formatearHora, formatearPrecio } from '@/utils/reservaUtils';

// Uso directo
<div>{formatearFecha(reserva.fechaInicio)}</div>
<div>{formatearHora(reserva.fechaInicio)} - {formatearHora(reserva.fechaFin)}</div>
<div>{formatearPrecio(reserva.precioTotal)}</div>
```

### Paso 3: Usar Hooks Personalizados

```typescript
// ANTES - Lógica manual con useState/useEffect
const [reservas, setReservas] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const loadReservas = async () => {
    // Lógica manual...
  };
  loadReservas();
}, []);

// AHORA - Hook personalizado
import { useMisReservas } from '@/hooks/useReservas';

const { reservas, loading, error, refetch, cancelarReserva } = useMisReservas();
```

### Paso 4: Actualizar Llamadas al Servicio

```typescript
// ANTES
const reservas = await reservaService.getReservas(); // ❌ Endpoint antiguo

// AHORA  
const reservas = await reservaService.getMisReservas(); // ✅ Endpoint actualizado

// NUEVO - Cotizar antes de crear
const cotizacion = await reservaService.cotizarReserva({
  id_cancha: 1,
  fecha: "2025-10-25",
  inicio: "19:00",
  fin: "20:30"
});
```

## 🆕 Nuevas Funcionalidades

### 1. Cotización de Precios
```typescript
// Nuevo: Cotizar precio antes de reservar
const cotizacion = await reservaService.cotizarReserva({
  id_cancha: 1,
  fecha: "2025-10-25", 
  inicio: "19:00",
  fin: "20:30",
  cupon: "DESCUENTO10" // Opcional
});

console.log(cotizacion.total); // Precio final
```

### 2. Verificación de Estado
```typescript
// Verificar qué endpoints están disponibles
const status = await reservaService.getReservasStatus();
console.log(status.available_endpoints);
console.log(status.supported_formats);
```

### 3. Conversión Automática de Formatos
```typescript
// Helper para convertir entre formatos
const formatoNuevo = reservaService.convertirAFormatoNuevo(reservaLegacy);
const formatoLegacy = reservaService.convertirAFormatoLegacy(reservaNueva);
```

## 🔍 Verificación Post-Migración

### 1. Verificar Endpoints
```bash
# Probar el endpoint de estado
curl GET /api/reservas/status
```

### 2. Verificar Funcionalidad
- [ ] ✅ Mis reservas se cargan correctamente
- [ ] ✅ Cotización funciona
- [ ] ✅ Creación de reservas funciona 
- [ ] ✅ Cancelación funciona
- [ ] ✅ Admin puede ver reservas por cancha/usuario

### 3. Console Logs
Verifica en la consola del navegador que aparezcan logs como:
```
"Intentando acceder a endpoint actualizado: /api/reservas/mias"
"Respuesta mis reservas (endpoint actualizado): [...]"
```

## 🐛 Troubleshooting

### Error: "endpoint not found"
- ✅ Verificar que el backend esté actualizado
- ✅ Verificar URL base en configuración
- ✅ Verificar tokens de autenticación

### Error: "formato de fecha inválido"
- ✅ Usar funciones de `reservaUtils.ts`
- ✅ Verificar que se esté usando el formato correcto (nuevo vs legacy)

### Error: "tipos no compatibles"
- ✅ Importar tanto tipos legacy como nuevos
- ✅ Usar union types donde sea necesario

## 📞 Soporte

Para dudas o problemas:
1. Revisar el endpoint `/api/reservas/status` 
2. Verificar logs en consola del navegador
3. Verificar que el backend esté actualizado
4. Consultar ejemplos en `ReservasActualizadas.example.tsx`

---

✅ **¡Frontend actualizado y sincronizado con Taller4!**

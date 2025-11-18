# 📊 GUÍA IMPLEMENTACIÓN ESTADÍSTICAS ADMIN

## 🎯 OBJETIVO
Implementar la sección de estadísticas para administradores de complejos (NO super_admin).

## 📍 ENDPOINTS DISPONIBLES

### 1. **Estadísticas Generales del Complejo**
```
GET /api/v1/admin/complejos/:id/estadisticas
```
**Respuesta:**
```typescript
{
  complejo_id: number;
  complejo_nombre: string;
  total_canchas: number;
  canchas_activas: number;
  canchas_inactivas: number;
  reservas_ultimo_mes: number;
  reservas_confirmadas_ultimo_mes: number;
  reservas_pendientes_ultimo_mes: number;
  reservas_canceladas_ultimo_mes: number;
  ingresos_ultimo_mes: number;
  ocupacion_promedio: number;
  fecha_desde: string;
  fecha_hasta: string;
}
```

### 2. **Reservas por Día de Semana (Gráfico)**
```
GET /api/v1/admin/complejos/:id/estadisticas/reservas-semana?dias=30
```
**Respuesta:**
```typescript
{
  complejo_id: number;
  complejo_nombre: string;
  dias: [
    {
      dia_numero: number; // 0=Domingo, 6=Sábado
      dia_nombre: string;
      total_reservas: number;
      reservas_confirmadas: number;
      reservas_pendientes: number;
      reservas_canceladas: number;
      ingresos: number;
    }
  ];
  fecha_desde: string;
  fecha_hasta: string;
}
```

### 3. **Reservas por Cancha (Gráfico)**
```
GET /api/v1/admin/complejos/:id/estadisticas/reservas-cancha?dias=30
```
**Respuesta:**
```typescript
{
  complejo_id: number;
  complejo_nombre: string;
  canchas: [
    {
      cancha_id: number;
      cancha_nombre: string;
      total_reservas: number;
      ingresos: number;
      ocupacion_porcentaje: number;
    }
  ];
  fecha_desde: string;
  fecha_hasta: string;
  total_reservas: number;
  cancha_mas_popular: string;
  cancha_menos_popular: string;
  ingresos_totales: number;
}
```

## 🛠️ SERVICIOS YA IMPLEMENTADOS

### Frontend: `adminService.ts`
```typescript
// Ya existe en: sporthub-temuco/src/services/adminService.ts

// 1. Estadísticas del complejo
async getEstadisticasComplejo(complejoId: number): Promise<EstadisticasComplejo>

// 2. Reservas por día
async getReservasPorDiaSemana(complejoId: number, dias: number = 30): Promise<ReservasPorDiaSemana>

// 3. Reservas por cancha
async getReservasPorCancha(complejoId: number, dias: number = 30): Promise<ReservasPorCancha>
```

### Hook Custom: `useEstadisticas.ts`
```typescript
// Ya existe en: sporthub-temuco/src/hooks/useEstadisticas.ts

export const useEstadisticas = (complejoId: number | null) => {
  // Estados y funciones para manejar estadísticas
  const [estadisticas, setEstadisticas] = useState<EstadisticasComplejo | null>(null);
  const [reservasPorDia, setReservasPorDia] = useState<ReservasPorDiaSemana | null>(null);
  const [reservasPorCancha, setReservasPorCancha] = useState<ReservasPorCancha | null>(null);
  
  // Funciones de carga
  const cargarEstadisticas = () => { /* ... */ }
  const cargarReservasPorDia = () => { /* ... */ }
  const cargarReservasPorCancha = () => { /* ... */ }
  
  return { estadisticas, reservasPorDia, reservasPorCancha, loading... };
}
```

## 📁 ESTRUCTURA ACTUAL

```
sporthub-temuco/src/app/admin/
├── estadisticas/
│   └── page.tsx          ← IMPLEMENTAR AQUÍ
├── perfil/
│   └── page.tsx          ← YA TIENE EJEMPLO DE USO
```

## ✅ LO QUE YA ESTÁ HECHO

1. ✅ Backend completo (`AdminApiRepository`)
2. ✅ Endpoints mapeados en routes
3. ✅ Servicio frontend (`adminService.ts`)
4. ✅ Hook personalizado (`useEstadisticas.ts`)
5. ✅ Tipos TypeScript (`types/admin.ts`)
6. ✅ Ejemplo funcional en `perfil/page.tsx`

## 🚀 LO QUE FALTA IMPLEMENTAR

### Página: `/admin/estadisticas/page.tsx`

**Componentes necesarios:**

1. **Cards de métricas principales** (4 cards superiores):
   - Ingresos del Mes
   - Reservas Totales
   - Tasa de Ocupación
   - Canchas Activas

2. **Gráfico de Barras**: Reservas por Día de Semana
   - Usar librería de gráficos (recharts, chart.js)
   - Eje X: Lunes-Domingo
   - Eje Y: Cantidad de reservas

3. **Gráfico de Barras**: Reservas por Cancha
   - Comparar rendimiento entre canchas
   - Mostrar ingresos por cancha

4. **Tabla de Resumen**: Estado de reservas
   - Confirmadas vs Pendientes vs Canceladas
   - Con porcentajes

## 💡 CÓDIGO BASE SUGERIDO

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useEstadisticas } from '@/hooks/useEstadisticas';
import '../dashboard.css';

export default function EstadisticasPage() {
  const [complejoId, setComplejoId] = useState<number | null>(null);
  
  const {
    estadisticas,
    loadingEstadisticas,
    errorEstadisticas,
    reservasPorDia,
    loadingReservasDia,
    reservasPorCancha,
    loadingReservasCancha,
    cargarEstadisticas,
    cargarReservasPorDia,
    cargarReservasPorCancha
  } = useEstadisticas(complejoId);

  // Obtener complejo del admin
  useEffect(() => {
    const fetchComplejo = async () => {
      // Obtener el primer complejo del admin
      const complejos = await adminService.getMisComplejos();
      if (complejos.length > 0) {
        setComplejoId(complejos[0].id);
      }
    };
    fetchComplejo();
  }, []);

  // Cargar estadísticas cuando se tiene el complejoId
  useEffect(() => {
    if (complejoId) {
      cargarEstadisticas();
      cargarReservasPorDia(30); // Últimos 30 días
      cargarReservasPorCancha(30);
    }
  }, [complejoId]);

  if (loadingEstadisticas) return <div>Cargando...</div>;
  if (errorEstadisticas) return <div>Error: {errorEstadisticas}</div>;
  if (!estadisticas) return <div>No hay datos</div>;

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1>Estadísticas del Complejo</h1>
        <p>{estadisticas.complejo_nombre}</p>
      </div>

      {/* Métricas principales (4 cards) */}
      <div className="metricas-grid">
        <div className="metrica-card">
          <h3>Ingresos del Mes</h3>
          <p className="metrica-valor">
            ${estadisticas.ingresos_ultimo_mes.toLocaleString()}
          </p>
        </div>
        
        <div className="metrica-card">
          <h3>Reservas Totales</h3>
          <p className="metrica-valor">
            {estadisticas.reservas_ultimo_mes}
          </p>
        </div>
        
        <div className="metrica-card">
          <h3>Tasa de Ocupación</h3>
          <p className="metrica-valor">
            {estadisticas.ocupacion_promedio}%
          </p>
        </div>
        
        <div className="metrica-card">
          <h3>Canchas Activas</h3>
          <p className="metrica-valor">
            {estadisticas.canchas_activas}/{estadisticas.total_canchas}
          </p>
        </div>
      </div>

      {/* Gráfico: Reservas por Día */}
      {reservasPorDia && (
        <div className="chart-section">
          <h2>Reservas por Día de la Semana</h2>
          {/* TODO: Implementar gráfico con recharts o chart.js */}
          <div className="chart-container">
            {/* Placeholder */}
            {reservasPorDia.dias.map(dia => (
              <div key={dia.dia_numero} className="bar-placeholder">
                {dia.dia_nombre}: {dia.total_reservas}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico: Reservas por Cancha */}
      {reservasPorCancha && (
        <div className="chart-section">
          <h2>Reservas por Cancha</h2>
          {/* TODO: Implementar gráfico */}
          <div className="chart-container">
            {reservasPorCancha.canchas.map(cancha => (
              <div key={cancha.cancha_id} className="bar-placeholder">
                {cancha.cancha_nombre}: {cancha.total_reservas}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de resumen */}
      <div className="resumen-section">
        <h2>Estado de Reservas</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Confirmadas</td>
              <td>{estadisticas.reservas_confirmadas_ultimo_mes}</td>
              <td>
                {((estadisticas.reservas_confirmadas_ultimo_mes / estadisticas.reservas_ultimo_mes) * 100).toFixed(1)}%
              </td>
            </tr>
            <tr>
              <td>Pendientes</td>
              <td>{estadisticas.reservas_pendientes_ultimo_mes}</td>
              <td>
                {((estadisticas.reservas_pendientes_ultimo_mes / estadisticas.reservas_ultimo_mes) * 100).toFixed(1)}%
              </td>
            </tr>
            <tr>
              <td>Canceladas</td>
              <td>{estadisticas.reservas_canceladas_ultimo_mes}</td>
              <td>
                {((estadisticas.reservas_canceladas_ultimo_mes / estadisticas.reservas_ultimo_mes) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 📦 LIBRERÍAS RECOMENDADAS PARA GRÁFICOS

### Opción 1: Recharts (Recomendado)
```bash
npm install recharts
```

### Opción 2: Chart.js + React-Chartjs-2
```bash
npm install chart.js react-chartjs-2
```

## 🎨 CSS SUGERIDO

```css
/* Agregar a dashboard.css */

.metricas-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metrica-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metrica-valor {
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  margin-top: 0.5rem;
}

.chart-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.chart-container {
  margin-top: 1rem;
  height: 400px;
}
```

## 📚 REFERENCIAS

- **Ejemplo funcional**: `/admin/perfil/page.tsx` (líneas 33-142)
- **Hook**: `/hooks/useEstadisticas.ts`
- **Servicio**: `/services/adminService.ts` (líneas 51-73)
- **Tipos**: `/types/admin.ts` (líneas 60-115)
- **Backend Doc**: `/backend/src/admin/ESTADISTICAS_COMPLEJO.md`

## ⚠️ NOTAS IMPORTANTES

1. **Obtener complejoId**: El admin debe tener al menos un complejo asignado
2. **Manejo de errores**: Validar que existan datos antes de renderizar gráficos
3. **Loading states**: Mostrar spinners mientras cargan los datos
4. **Responsive**: Los gráficos deben adaptarse a móvil
5. **Período**: Por defecto usar 30 días, permitir cambiar el rango

## 🔄 FLUJO DE DATOS

```
1. Usuario entra a /admin/estadisticas
2. useEffect obtiene el complejoId del admin
3. useEstadisticas hook se activa con el complejoId
4. Hook llama a adminService que hace las peticiones al backend
5. Backend procesa y devuelve datos agregados
6. Frontend renderiza cards y gráficos con los datos
```

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear página `/admin/estadisticas/page.tsx`
- [ ] Implementar cards de métricas principales
- [ ] Agregar gráfico de reservas por día (recharts/chartjs)
- [ ] Agregar gráfico de reservas por cancha
- [ ] Implementar tabla de resumen
- [ ] Agregar selector de período (7/15/30/60 días)
- [ ] Implementar loading states
- [ ] Agregar manejo de errores
- [ ] Hacer responsive para móvil
- [ ] Probar con datos reales
- [ ] Agregar botón de exportar (opcional)

---

**TODO ESTÁ LISTO EN EL BACKEND Y SERVICIOS. SOLO FALTA CREAR LA INTERFAZ VISUAL.** 🚀

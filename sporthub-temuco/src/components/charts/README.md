# Charts Components

Este directorio contiene componentes de visualización ligeros, auto-contenidos y sin dependencias externas de librerías de gráficos.

## Componentes

### BarChart
Gráfico de barras vertical simple.

Props principales:
- data: { label: string; value: number }[] (requerido)
- title?: string
- height?: string (Tailwind util, default: `h-60`)
- emptyMessage?: string (default: "Sin datos disponibles")
- ariaLabel?: string (default: "Gráfico de barras")
- loading?: boolean
- onBarClick?: (item, index) => void
- formatValue?: (value:number) => string | number

Ejemplo:
```tsx
<BarChart
  data={[{ label: 'Lun', value: 10 }, { label: 'Mar', value: 5 }]}
  title="Reservas por día"
  onBarClick={(item) => console.log(item)}
  formatValue={(v) => v.toLocaleString('es-CL')}
  loading={false}
/>
```

### PieChart
Gráfico circular o donut con segmentos SVG.

Props principales:
- data: { label: string; value: number; color: string }[]
- donut?: boolean
- centerText?: string
- centerValue?: string | number
- showLegend?: boolean (default true)
- showPercentages?: boolean (default true)
- formatPercentage?: (pct:number) => string
- loading?: boolean
- emptyMessage?: string

Ejemplo:
```tsx
<PieChart
  data={[
    { label: 'Básquetbol', value: 40, color: '#3b82f6' },
    { label: 'Fútbol', value: 25, color: '#f59e0b' },
    { label: 'Tenis', value: 35, color: '#10b981' }
  ]}
  donut
  centerText="Total"
  centerValue={100}
  formatPercentage={(p) => p.toFixed(0) + '%'}
/>
```

### StatsCard
Tarjeta de métrica con ícono y variación.

Props:
- title: string
- value: string | number
- icon: ReactNode
- trend?: { value:number; isPositive:boolean }
- subtitle?: string
- loading?: boolean
- empty?: boolean
- emptyMessage?: string

Uso:
```tsx
<StatsCard
  title="Usuarios Activos"
  value={128}
  trend={{ value: 12, isPositive: true }}
  icon={<span>👤</span>}
  loading={false}
/>
```

### ChartCard
Contenedor estilizado para agrupar gráficos con título, acciones y estados.

Props:
- title: string
- subtitle?: string
- actions?: ReactNode
- loading?: boolean
- empty?: boolean
- emptyMessage?: string

Ejemplo:
```tsx
<ChartCard
  title="Distribución"
  actions={<button className="text-xs text-blue-600">Ver más</button>}
  loading={false}
>
  <PieChart data={data} />
</ChartCard>
```

## Patrones comunes
- Todos incluyen estados: loading (skeleton/spinner) y vacío (emptyMessage).
- Accesibilidad mínima con aria-label y roles semánticos.
- Evitan dependencias externas para permitir reemplazo posterior por una librería (Recharts/Chart.js) sin romper API de alto nivel.

## Roadmap sugerido
1. Añadir onSegmentClick a `PieChart` (paridad con `onBarClick`).
2. Extraer hook `useChartColors` si la paleta se repite.
3. Integración opcional con data remota + `isFetching` para diferenciar de `loading` inicial.
4. Tests unitarios (render estados: loading | empty | normal).

## Buenas prácticas
- Mantener `data` pre-normalizada (sin nulls) antes de pasar al componente.
- Usar `formatValue` / `formatPercentage` para i18n en lugar de cambiar lógica interna.
- Para SSR, envolver en `Suspense` si se carga data asincrónica.

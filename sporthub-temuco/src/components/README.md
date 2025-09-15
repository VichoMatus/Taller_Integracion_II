# Componentes (Base Estable)

Este directorio contiene componentes de UI listos para producción ligera, con APIs estables y estados coherentes (loading, empty, normal). El objetivo es que otras IAs o desarrolladores puedan entender y evolucionar el código sin romperlo.

## Principios
- APIs no rompientes: nuevas props son opcionales.
- Accesibilidad mínima: roles, aria-label, aria-invalid y mensajes con role="alert".
- Estados claros: skeleton/spinner para `loading` y mensajes para `empty`.
- Sin dependencias innecesarias: gráficos SVG nativo; formularios con estado local.

## Gráficos
- `BarChart`: barras con `onBarClick`, `formatValue`, `loading` y `emptyMessage`.
- `PieChart`: donut opcional, `onSegmentClick`, `formatPercentage`, maneja `total === 0` como vacío.
- `StatsCard` y `ChartCard`: contenedores con `loading`, `empty` y `emptyMessage`.

Ver `charts/README.md` para props y ejemplos.

## Formularios
- `CourtForm` y `ReservationForm` incluyen validación local, marcas ARIA y 
  deshabilitan inputs/botón cuando `loading` o inválidos.
- `ReservationForm` valida que la fecha/hora no sea en el pasado.
- Props `onValidate` para inspeccionar errores desde afuera.

Ver `forms/README.md` para props, reglas y ejemplos.

## Hook de formulario
- `useSimpleForm`: hook utilitario sin dependencias, pensado como paso previo a `react-hook-form + zod`.

## Roadmap ligero
- Tests unitarios de render básico (loading/empty/normal).
- Paleta de colores común para charts.
- Internacionalización de strings: "Sin datos", "Guardando...".

## Convenciones
- Tailwind para estilos; evita estilos inline salvo casos necesarios.
- Mantener mensajes y labels en español hasta decidir i18n.
- No usar tipos avanzados que dependan de configuraciones TS estrictas.

# Issue: Inconsistencias y errores en Admin Dashboard / Estadísticas

## Resumen
Al interactuar con el panel Admin se detectaron múltiples errores y puntos donde el frontend no puede corregir los problemas porque los datos devueltos desde la API no son consistentes o están incompletos. Este Issue describe logs, errores, pasos para reproducir, y recomendaciones de solución para el backend.

---

## Errores detectados (visión general)
- `Cannot read properties of undefined (reading 'total_reservas')` — causado por payloads incompletos en `/admin/complejos/{id}/estadisticas/reservas-semana` o `/admin/complejos/{id}/estadisticas/reservas-cancha`.
- `Each child in a list should have a unique "key" prop.` — el frontend recebía entries sin `id` o con `id` duplicado.
- Charts vacíos o incompletos: `Reservas por cancha (rápido)` no mostraba barras cuando la respuesta del backend tenía forma inesperada o estaba vacía.
- Conteo inconsistente: `MisRecursos`/`getDashboardData()` devuelven conteos que no se corresponden con llamadas `GET /admin/canchas` o `GET /admin/reservas` debido a paginación o datos parciales.

---

## Logs relevantes (capturados en consola del frontend)
- Interceptor del API:
  - '❌ [apiBackend] Error interceptor:' — se ve al fallar un backend 500/4xx con objeto de error.
- Mensaje extraído:
  - '❌ [apiBackend] Mensaje de error extraído: "Cannot read properties of undefined (reading 'total_reservas')"' — esto proviene del backend. Es la raíz del "Cannot read properties".
- `console.warn` y `console.error` donde el frontend registra fallbacks y conversiones. (ver snippets a continuación)

### Ejemplo de stack (frontend)
```
❌ [apiBackend] Error interceptor: {}
    at <unknown> (src/config/backend.ts:234)
    at Object.getReservasPorDiaSemana (src/services/adminService.ts:71)
    at useEstadisticas (src/hooks/useEstadisticas.ts:63)
```

---

## Pasos para reproducir (sugerencia para QA/Dev)
1. Iniciar sesión como Admin.
2. Ir a Admin → Estadísticas.
3. Observar la consola (Turbopack / Next.js) — hay logs como `Cannot read properties of undefined (reading 'total_reservas')`.
4. Verificar `GET /admin/complejos/{id}/estadisticas/reservas-semana` y `GET /admin/complejos/{id}/estadisticas/reservas-cancha` en Postman (parámetro `dias` por defecto 30). Verificar si `total_reservas` está presente en cada item.

---

## Causas posibles (backend)
1. El cálculo de estadísticas no contempla casos donde `dias` ó `canchas` sea `null` o `undefined`.
2. Los endpoints retornan un `500` al intentar acceder a `total_reservas` de un objeto que no existe (p. ej., join mal definido, agregado nulo en SQL, o mapeo faltante).
3. Los endpoints de `admin` devuelven paginación parcial (ej. `GET /admin/canchas` podría devolver un page_size=20 sin el `total`), y el frontend interpreta datos incompletos.
4. Algunas canchas o reservas pueden estar devueltas sin `id` (vacío o nulo), por lo que React no puede usar `key={id}` de forma segura.

---

## Impacto en el frontend
- El panel `Admin` deja de mostrar gráficas o listas completas; las páginas no se rompen gracias a guardrails del frontend, pero la UX queda degradada.
- Estadísticas carecen de valores correctos; cards (por ejemplo `Canchas`) y `Reservas` muestran números incorrectos comparados con el conteo real.

---

## Acciones sugeridas para backend (prioritarias)
1. Asegurar que `GET /admin/complejos/{id}/estadisticas/reservas-semana` y `GET /admin/complejos/{id}/estadisticas/reservas-cancha` **siempre** devuelvan arrays (p. ej., `dias: []` y `canchas: []`), aunque no existan datos.
2. Añadir `total_reservas` con valor 0 por defecto en cada `dia` / `cancha` cuando no tenga reservas.
3. Evitar lanzar 500 por `undefined` — comprobar antes de acceder a propiedades del dato (ej. validar `elem?.total_reservas` o hacer safe mapping y devolver un `null` o `[]` legible para frontend).
4. Garantizar que `GET /admin/canchas` y `GET /admin/reservas` devuelvan contadores o un campo `total` con el conteo total del recurso o, si se usa paginación, permitir `page_size` grande o `?page_size=1000` para dashboards.
5. Asegurarse que cada `cancha` y cada `reserva` tienen `id` no nulo; si es posible, corregir la agregación que los borra.

---

## Mensajes y experiencia del usuario (propuesta)
- Cuando la API falle con `total_reservas` indefinido, devolver una respuesta con `ok: false, data: {...} o error: "No hay datos"` para evitar crash del front.
- Asegurar en el backend que el equipo frontend recibirá estructuras consistentes y estables. Así se evita el logging excesivo en consola y problemas en producción.

---

## Código afectado (referencias frontend)
- `src/app/admin/estadisticas/page.tsx` — carga y transforma `reservasPorCancha`, `reservasPorDia`
- `src/hooks/useEstadisticas.ts` — intento de leer `data.data` y `data` y generar `setReservasPorDia(data.data)`; el frontend aplica defensas pero no puede arreglar objeto inexistente.
- `src/services/adminService.ts` — funciones `getReservasPorDiaSemana`, `getReservasPorCancha`, `getMisRecursos`.
- `src/app/admin/page.tsx` — Dashboard que necesita `getMisRecursos` y `getMisCanchas` con conteos correctos.

---

## Logs recopilados
- Interceptor axios (front) registra:
  - `❌ [apiBackend] Error interceptor: {...}`
  - `❌ [apiBackend] Mensaje de error extraído: "Cannot read properties of undefined (reading 'total_reservas')"`
  - `❌ [apiBackend] Custom error creado: "Cannot read properties of undefined (reading 'total_reservas')"`
- Stack trace muestra `getReservasPorDiaSemana` en `src/services/adminService.ts` como punto de falla.

---

## Pruebas que recomendamos ejecutar (QA)
1. Llamar a `GET /admin/complejos/{id}/estadisticas/reservas-semana?dias=30` y validar que la respuesta contiene campo `dias` como array, y que cada elemento tenga `total_reservas` (numérica).
2. Llamar `GET /admin/complejos/{id}/estadisticas/reservas-cancha` y validar que `canchas` existe y que `total_reservas` está definido.
3. Llamar `GET /admin/panel` para asegurar que `MisRecursos` contiene `canchas`, `complejos` y `total_reservas` con números correctos.
4. Lanzar un escenario con canchas sin reservas y ver que las funciones devuelvan arrays vacíos en vez de 500.

---

## Prioridad / impacto
- Crítico: `reservas-semana` y `reservas-cancha` retornando 500 por `undefined` rompe las visualizaciones y crea ruido en logs.
- Alto: falta de `total_reservas` dificulta el conteo correcto y la toma de decisiones en dashboard.

---

## Conclusión
El frontend implementó varios guardrails para minimizar el impacto (fallback a arrays vacíos, charts defensivos), pero la raíz del problema está en los shape y validación que debe hacer el backend. Si el backend entrega payloads consistentes y default values (0 o arrays vacíos), el frontend mostrará los gráficos y contadores correctamente.

Por favor, asignar a: equipo Backend -> Estadísticas / Admin.

Adjunto logs y líneas de código relevantes para facilitar la reproducción.


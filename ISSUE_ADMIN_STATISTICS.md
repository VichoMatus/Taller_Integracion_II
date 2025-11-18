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

---

## B) Recomendaciones técnicas detalladas (ampliado)

Aquí detallo las ideas y acciones concretas que quería sugerir para completar las correcciones del backend — son pasos prácticos para que el equipo Backend implemente una solución robusta y fácilmente testeable.

### 1. Contrato (API contract) explícito y estable
- Asegurar que los endpoints devuelven un objeto con la forma documentada. Ejemplos:

  - GET /admin/complejos/{id}/estadisticas/reservas-semana?dias=N
    - body de respuesta esperado:
      ```json
      {
        "dias": [
          {"fecha": "2025-10-01", "total_reservas": 0},
          {"fecha": "2025-10-02", "total_reservas": 3}
        ],
        "total_reservas": 3
      }
      ```

  - GET /admin/complejos/{id}/estadisticas/reservas-cancha?dias=N
    - body de respuesta esperado:
      ```json
      {
        "canchas": [
          {"cancha_id": 12, "nombre": "Cancha A", "total_reservas": 5},
          {"cancha_id": 13, "nombre": "Cancha B", "total_reservas": 0}
        ],
        "total_reservas": 5
      }
      ```

  - Reglas de contrato:
    - Siempre devolver arrays (incluso vacíos) para `dias` y `canchas`.
    - `total_reservas` en cada elemento → número (use 0 por defecto cuando sea nulo).
    - Incluir `total_reservas` agregado en el root del payload cuando sea posible.

### 2. Ajustes en la lógica SQL / agregación
- Use funciones `COALESCE` (o similar dependiente del motor DB) para **forzar 0** cuando la suma sea NULL.
  - Ejemplo SQL (Postgres):
    ```sql
    SELECT DATE(t.fecha) AS fecha, COALESCE(SUM(1), 0) AS total_reservas
    FROM reservas r
    JOIN turnos t ON r.turno_id = t.id
    WHERE t.complejo_id = :complejo_id
      AND t.fecha BETWEEN :desde AND :hasta
    GROUP BY DATE(t.fecha)
    ORDER BY DATE(t.fecha);
    ```

  - Para canchas: `GROUP BY cancha_id` y `COALESCE(COUNT(r.id), 0)`.

### 3. Manejo de errores: no devolver 500 por datos faltantes
- En el controlador, validar la estructura antes de mapear y devolver 200 con `dias: []` o `canchas: []` y un mensaje de advertencia cuando la consulta no tenga filas.
- Si hay un error de lógica (e.g., desconocido), devolver 500 con un mensaje legible y un `error_code` para facilitar el triage.

### 4. Tests (unitarios e integración)
- Unit tests sobre la función que crea los agregados:
  - Validar que para una entrada sin reservas la respuesta contenga días con `total_reservas: 0` (o al menos `dias: []`).
  - Validar que no se lanza excepción cuando `canchas` o `dias` es null.

- Tests de integración (FastAPI / pytest para backend):
  - test_reservas_semana_no_data -> crea un complejo con canchas y 0 reservas → GET espera `dias: []` o `dias` con totals 0.
  - test_reservas_cancha_has_id -> asegura que cada cancha devuelta tiene un `cancha_id` y `nombre`.

  Ejemplo (pytest + requests):
  ```python
  def test_reservas_semana_no_data(client):
      res = client.get('/admin/complejos/1/estadisticas/reservas-semana?dias=7')
      assert res.status_code == 200
      data = res.json()
      assert isinstance(data.get('dias'), list)
      # la lista puede estar vacía; si se quiere llena con días, validar total_reservas
      for d in data.get('dias', []):
          assert 'fecha' in d and 'total_reservas' in d
          assert isinstance(d['total_reservas'], int)
  ```

### 5. Logging y monitoreo
- Agregar logs de WARN/INFO cuando la consulta devuelve `null` o `[]` para permitir detectar posibles errores por falta de datos.
- Monitoreo/Alertas para endpoints de estadísticas que caigan más del 1% en su tasa de error (SLA interna).

### 6. Rendimiento y caches
- Agregar cache a nivel de layer (Redis o materialized view) para estadísticas de agregación que pueden ser costosas. Refrescar cache cada N minutos.

### 7. Backward compatibility
- Añadir un campo `schema_version` o `meta` si se va a cambiar el contrato. Permite al frontend mantener compatibilidad con versiones previas.

### 8. Documentación API y contrato de datos
- Documentar los endpoints en el swagger/openapi junto con ejemplos de respuesta para `0 reservas`, `algunas reservas` y `error`.

### 9. Checklist para QA y Frontend
- Validar que `GET /admin/complejos/{id}/estadisticas/reservas-semana` devuelve al menos `dias: []` y no lanza 500.
- Validar `GET /admin/complejos/{id}/estadisticas/reservas-cancha` respecta `canchas: []` y `total_reservas`.
- Frontend: comprobar que `admin` ahora no muestra error y que los `BarChart`/`StatsCard` usan 0 por defecto.

---

Si quieres, puedo preparar un PR de ejemplo con pruebas unitarias para el backend (si me das contexto sobre el stack: SQLAlchemy, ORMs, etc.), o bien un archivo de `postman` con las llamadas y asserts para que el equipo de QA pueda correr pruebas automáticas.


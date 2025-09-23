/**
 * Interface estándar para respuestas paginadas.
 * Proporciona estructura consistente para datos con paginación.
 *
 * @template T - Tipo de los elementos en la página
 */
export interface Paginated<T> {
  /** Lista de elementos en la página actual */
  items: T[];
  /** Número de página actual (base 1) */
  page: number;
  /** Cantidad de elementos por página */
  pageSize: number;
  /** Total de elementos disponibles */
  total: number;
}

/**
 * Normaliza respuestas de diferentes APIs a formato estándar de paginación.
 * Maneja múltiples formatos de respuesta (items, results, arrays directos).
 *
 * @template T - Tipo de los elementos
 * @param raw - Respuesta cruda de la API
 * @param mapItem - Función para transformar cada elemento
 * @returns Objeto paginado normalizado
 *
 * @example
 * ```typescript
 * // Para respuesta con formato { items: [...], page: 1, total: 100 }
 * const result = normalizePage(apiResponse, user => transformUser(user));
 *
 * // Para respuesta con formato { results: [...], count: 50 }
 * const result = normalizePage(apiResponse, item => transformItem(item));
 * ```
 */
export const normalizePage = <T>(
  raw: any,
  mapItem: (x: any) => T
): Paginated<T> => ({
  items: (raw?.items ?? raw?.results ?? raw ?? []).map(mapItem),
  page: raw?.page ?? 1,
  pageSize: raw?.pageSize ?? (raw?.items?.length ?? raw?.results?.length ?? 0),
  total: raw?.total ?? raw?.count ?? (raw?.items?.length ?? raw?.results?.length ?? 0),
});

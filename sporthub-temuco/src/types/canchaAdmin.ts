/**
 * Tipos para el consumo de canchas desde el panel de administración en el frontend.
 *
 * Estos tipos reflejan la estructura de datos enviada y recibida a través
 * del BFF y la API. Se mantienen en el directorio `types` para que
 * cualquier servicio o componente de UI pueda importarlos sin acoplarse
 * directamente a la estructura interna del BFF.
 */

/**
 * Representa una cancha disponible en el panel de administración.
 */
export interface CanchaAdmin {
  /** Identificador único de la cancha */
  id_cancha: string | number;
  /** Nombre de la cancha */
  nombre: string;
  /** Precio por hora */
  precio: number;
  /** Valoración promedio (1..5) */
  rating: number;
  /** Si la cancha está activa */
  activo: boolean;
  /** Identificador del complejo al que pertenece */
  id_complejo: string | number;
  /** Cualquier otro campo que pueda retornar el backend */
  [key: string]: any;
}

/**
 * Parámetros opcionales para filtrar, paginar y ordenar la lista de canchas.
 */
export interface CanchasAdminListQuery {
  /** Filtrar por identificador de complejo */
  id_complejo?: string | number;
  /** Término de búsqueda por nombre */
  q?: string;
  /** Incluir canchas inactivas en los resultados */
  incluir_inactivas?: boolean;
  /** Número de página para paginación (base 1) */
  page?: number;
  /** Número de elementos por página */
  page_size?: number;
  /** Campo por el que ordenar: nombre, precio, rating o recientes */
  sort_by?: 'nombre' | 'precio' | 'rating' | 'recientes';
  /** Dirección de ordenamiento: asc o desc */
  order?: 'asc' | 'desc';
}

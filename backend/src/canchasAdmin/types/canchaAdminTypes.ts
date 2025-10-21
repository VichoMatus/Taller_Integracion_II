/**
 * Tipos del BFF para la consulta de canchas administradas.
 *
 * Este archivo define tanto la estructura de los parámetros de
 * filtrado utilizados al consultar las canchas visibles en el panel
 * administrativo como el tipo de retorno que representa una cancha.
 * Los mismos tipos (o una versión equivalente) se reutilizan en el
 * frontend para mantener coherencia entre capas.
 */

/**
 * Representa una cancha disponible en el panel de administración.
 * Incluye campos comunes como identificador, nombre, precio y
 * calificación. Otros campos opcionales permiten incorporar
 * propiedades adicionales sin romper el contrato.
 */
export interface CanchaAdmin {
  /** Identificador único de la cancha */
  id_cancha: string | number;
  /** Nombre de la cancha */
  nombre: string;
  /** Precio por hora de la cancha */
  precio: number;
  /** Valoración promedio (1..5) de la cancha */
  rating: number;
  /** Indica si la cancha está activa o no */
  activo: boolean;
  /** Identificador del complejo al que pertenece la cancha */
  id_complejo: string | number;
  /** Campos adicionales que pueda devolver el backend */
  [key: string]: any;
}

/**
 * Parámetros de filtrado y paginación para la consulta de canchas.
 * Todos los campos son opcionales para permitir búsquedas flexibles.
 */
export interface CanchasAdminListQuery {
  /** Filtrar canchas por el id de su complejo */
  id_complejo?: string | number;
  /** Búsqueda de texto en el nombre de la cancha */
  q?: string;
  /** Incluir canchas inactivas en los resultados */
  incluir_inactivas?: boolean;
  /** Número de página para paginación (empezando en 1) */
  page?: number;
  /** Tamaño de página para paginación */
  page_size?: number;
  /**
   * Campo por el cual ordenar los resultados. El backend soporta
   * ordenar por nombre, precio, rating o recientes.
   */
  sort_by?: 'nombre' | 'precio' | 'rating' | 'recientes';
  /** Dirección de ordenamiento: ascendente o descendente */
  order?: 'asc' | 'desc';
}

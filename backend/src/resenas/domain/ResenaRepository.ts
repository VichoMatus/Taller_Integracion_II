import { Resena, EstadoResena } from "../../domain/resena/Resena";
import { Paginated } from "../../app/common/pagination";

/**
 * Parámetros de filtrado para la búsqueda de reseñas.
 */
export interface ResenaFilters {
  /** Número de página (opcional) */
  page?: number;
  /** Tamaño de página (opcional) */
  pageSize?: number;
  /** Filtrar por usuario (opcional) */
  usuarioId?: number;
  /** Filtrar por complejo (opcional) */
  complejoId?: number;
  /** Filtrar por calificación mínima (opcional) */
  calificacionMin?: number;
  /** Filtrar por calificación máxima (opcional) */
  calificacionMax?: number;
  /** Filtrar por estado (opcional) */
  estado?: EstadoResena;
  /** Filtrar por fecha desde (opcional) */
  fechaDesde?: Date;
  /** Filtrar por fecha hasta (opcional) */
  fechaHasta?: Date;
  /** Solo reseñas verificadas (opcional) */
  soloVerificadas?: boolean;
  /** Texto de búsqueda en comentarios (opcional) */
  q?: string;
  /** Ordenar por fecha (asc/desc) */
  ordenFecha?: "asc" | "desc";
}

/**
 * Datos para crear una nueva reseña.
 */
export interface CreateResenaInput {
  usuarioId: number;
  complejoId: number;
  calificacion: number;
  comentario: string;
}

/**
 * Datos para actualizar una reseña existente.
 */
export interface UpdateResenaInput {
  calificacion?: number;
  comentario?: string;
  estado?: EstadoResena;
  respuestaDueno?: string;
}

/**
 * Estadísticas de reseñas para un complejo.
 */
export interface EstadisticasResenas {
  totalResenas: number;
  calificacionPromedio: number;
  distribucionCalificaciones: {
    estrella1: number;
    estrella2: number;
    estrella3: number;
    estrella4: number;
    estrella5: number;
  };
  porcentajeVerificadas: number;
}

/**
 * Repositorio para operaciones sobre reseñas.
 * Define el contrato para la gestión de reseñas de complejos deportivos.
 */
export interface ResenaRepository {
  /**
   * Obtiene una lista paginada de reseñas con filtros opcionales.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado de reseñas
   */
  listResenas(filters: ResenaFilters): Promise<Paginated<Resena>>;

  /**
   * Obtiene una reseña específica por su ID.
   * @param id - ID de la reseña
   * @returns Promise con los datos de la reseña
   * @throws Error si la reseña no existe
   */
  getResena(id: number): Promise<Resena>;

  /**
   * Crea una nueva reseña en el sistema.
   * @param input - Datos de la reseña a crear
   * @returns Promise con la reseña creada
   * @throws Error si faltan datos requeridos o el usuario ya reseñó el complejo
   */
  createResena(input: CreateResenaInput): Promise<Resena>;

  /**
   * Actualiza parcialmente los datos de una reseña.
   * @param id - ID de la reseña a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con la reseña actualizada
   * @throws Error si la reseña no existe
   */
  updateResena(id: number, input: UpdateResenaInput): Promise<Resena>;

  /**
   * Elimina una reseña del sistema.
   * @param id - ID de la reseña a eliminar
   * @throws Error si la reseña no existe
   */
  deleteResena(id: number): Promise<void>;

  /**
   * Obtiene reseñas de un usuario específico.
   * @param usuarioId - ID del usuario
   * @returns Promise con lista de reseñas del usuario
   */
  getResenasByUsuario(usuarioId: number): Promise<Resena[]>;

  /**
   * Obtiene reseñas de un complejo específico.
   * @param complejoId - ID del complejo
   * @param incluirOcultas - Si incluir reseñas ocultas
   * @returns Promise con lista de reseñas del complejo
   */
  getResenasByComplejo(complejoId: number, incluirOcultas?: boolean): Promise<Resena[]>;

  /**
   * Verifica si un usuario ya reseñó un complejo.
   * @param usuarioId - ID del usuario
   * @param complejoId - ID del complejo
   * @returns Promise con true si ya reseñó, false en caso contrario
   */
  usuarioYaReseno(usuarioId: number, complejoId: number): Promise<boolean>;

  /**
   * Agrega un "me gusta" a una reseña.
   * @param resenaId - ID de la reseña
   * @param usuarioId - ID del usuario que da like
   * @returns Promise con la reseña actualizada
   */
  darLike(resenaId: number, usuarioId: number): Promise<Resena>;

  /**
   * Remueve un "me gusta" de una reseña.
   * @param resenaId - ID de la reseña
   * @param usuarioId - ID del usuario que quita like
   * @returns Promise con la reseña actualizada
   */
  quitarLike(resenaId: number, usuarioId: number): Promise<Resena>;

  /**
   * Reporta una reseña como inapropiada.
   * @param resenaId - ID de la reseña
   * @param usuarioId - ID del usuario que reporta
   * @param motivo - Motivo del reporte
   * @returns Promise que se resuelve cuando se completa el reporte
   */
  reportarResena(resenaId: number, usuarioId: number, motivo: string): Promise<void>;

  /**
   * Obtiene estadísticas de reseñas para un complejo.
   * @param complejoId - ID del complejo
   * @returns Promise con estadísticas detalladas
   */
  getEstadisticas(complejoId: number): Promise<EstadisticasResenas>;

  /**
   * Responde a una reseña (solo dueño del complejo).
   * @param resenaId - ID de la reseña
   * @param respuesta - Texto de la respuesta
   * @returns Promise con la reseña actualizada
   */
  responderResena(resenaId: number, respuesta: string): Promise<Resena>;
}

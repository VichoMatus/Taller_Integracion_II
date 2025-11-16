import { Resena, EstadoResena } from "../../domain/resena/Resena";

/**
 * Parámetros de filtrado para la búsqueda de reseñas.
 * Basado en la API FastAPI de Taller4: GET /resenas
 */
export interface ResenaFilters {
  /** ID de la cancha (opcional, mutuamente exclusivo con complejoId) */
  idCancha?: number;
  /** ID del complejo (opcional, mutuamente exclusivo con canchaId) */
  idComplejo?: number;
  /** Orden: 'recientes' | 'mejor' | 'peor' */
  order?: "recientes" | "mejor" | "peor";
  /** Número de página (1..N) */
  page?: number;
  /** Tamaño de página (1..100) */
  pageSize?: number;
}

/**
 * Datos para crear una nueva reseña.
 * Basado en POST /resenas de la API FastAPI
 */
export interface CreateResenaInput {
  /** ID de la cancha (opcional, debe indicar cancha o complejo) */
  idCancha?: number;
  /** ID del complejo (opcional, debe indicar cancha o complejo) */
  idComplejo?: number;
  /** Calificación 1..5 */
  calificacion: number;
  /** Comentario opcional */
  comentario?: string;
}

/**
 * Datos para actualizar una reseña existente.
 * Basado en PATCH /resenas/{id} de la API FastAPI
 */
export interface UpdateResenaInput {
  /** Calificación 1..5 (opcional) */
  calificacion?: number;
  /** Comentario (opcional) */
  comentario?: string;
}

/**
 * Datos para reportar una reseña.
 * Basado en POST /resenas/{id}/reportar
 */
export interface ReportarResenaInput {
  /** Motivo del reporte (opcional) */
  motivo?: string;
}

/**
 * Repositorio para operaciones sobre reseñas.
 * Define el contrato basado en la API FastAPI de Taller4.
 */
export interface ResenaRepository {
  /**
   * Lista reseñas con filtros opcionales (por cancha o complejo).
   * GET /resenas
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con array de reseñas (incluye promedio_rating y total_resenas si hay filtro)
   */
  listResenas(filters: ResenaFilters): Promise<Resena[]>;

  /**
   * Obtiene una reseña específica por ID.
   * GET /resenas/{id}
   * @param id - ID de la reseña
   * @returns Promise con la reseña encontrada
   * @throws Error si la reseña no existe
   */
  getResena(id: number): Promise<Resena>;

  /**
   * Crea una nueva reseña (requiere reserva confirmada).
   * POST /resenas
   * @param input - Datos de la reseña a crear
   * @returns Promise con la reseña creada
   * @throws Error si no tiene reserva confirmada o faltan datos
   */
  createResena(input: CreateResenaInput): Promise<Resena>;

  /**
   * Actualiza parcialmente una reseña (solo el autor).
   * PATCH /resenas/{id}
   * @param id - ID de la reseña a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con la reseña actualizada
   * @throws Error si no es el autor o la reseña no existe
   */
  updateResena(id: number, input: UpdateResenaInput): Promise<Resena>;

  /**
   * Elimina una reseña (autor, admin/dueno del complejo, o superadmin).
   * DELETE /resenas/{id}
   * @param id - ID de la reseña a eliminar
   * @returns Promise que se resuelve cuando se completa
   * @throws Error si no tiene permisos
   */
  deleteResena(id: number): Promise<void>;

  /**
   * Reporta una reseña por contenido inapropiado (1 reporte por usuario por reseña).
   * POST /resenas/{id}/reportar
   * @param resenaId - ID de la reseña
   * @param motivo - Motivo del reporte (opcional)
   * @returns Promise con datos del reporte
   */
  reportarResena(resenaId: number, motivo?: string): Promise<any>;
}
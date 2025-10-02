import { Reserva, EstadoReserva, MetodoPago } from "../../domain/reserva/Reserva";
import { Paginated } from "../../app/common/pagination";

/**
 * Parámetros de filtrado para la búsqueda de reservas.
 */
export interface ReservaFilters {
  /** Número de página (opcional) */
  page?: number;
  /** Tamaño de página (opcional) */
  pageSize?: number;
  /** Filtrar por usuario (opcional) */
  usuarioId?: number;
  /** Filtrar por cancha (opcional) */
  canchaId?: number;
  /** Filtrar por complejo (opcional) */
  complejoId?: number;
  /** Filtrar por estado (opcional) */
  estado?: EstadoReserva;
  /** Filtrar por fecha desde (opcional) */
  fechaDesde?: Date;
  /** Filtrar por fecha hasta (opcional) */
  fechaHasta?: Date;
  /** Filtrar solo reservas pagadas (opcional) */
  pagado?: boolean;
  /** Código de confirmación (opcional) */
  codigoConfirmacion?: string;
}

/**
 * Datos para crear una nueva reserva.
 */
export interface CreateReservaInput {
  usuarioId: number;
  canchaId: number;
  fechaInicio: Date;
  fechaFin: Date;
  metodoPago?: MetodoPago;
  notas?: string;
}

/**
 * Datos para actualizar una reserva existente.
 */
export interface UpdateReservaInput {
  estado?: EstadoReserva;
  metodoPago?: MetodoPago;
  pagado?: boolean;
  notas?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

/**
 * Parámetros para verificar disponibilidad de canchas.
 */
export interface DisponibilidadInput {
  canchaId: number;
  fechaInicio: Date;
  fechaFin: Date;
  reservaId?: number; // Para excluir una reserva específica al editar
}

/**
 * Repositorio para operaciones sobre reservas.
 * Define el contrato para la gestión de reservas de canchas.
 */
export interface ReservaRepository {
  /**
   * Obtiene una lista paginada de reservas con filtros opcionales.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado de reservas
   */
  listReservas(filters: ReservaFilters): Promise<Paginated<Reserva>>;

  /**
   * Obtiene una reserva específica por su ID.
   * @param id - ID de la reserva
   * @returns Promise con los datos de la reserva
   * @throws Error si la reserva no existe
   */
  getReserva(id: number): Promise<Reserva>;

  /**
   * Crea una nueva reserva en el sistema.
   * @param input - Datos de la reserva a crear
   * @returns Promise con la reserva creada
   * @throws Error si faltan datos requeridos o hay conflictos de horario
   */
  createReserva(input: CreateReservaInput): Promise<Reserva>;

  /**
   * Actualiza parcialmente los datos de una reserva.
   * @param id - ID de la reserva a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con la reserva actualizada
   * @throws Error si la reserva no existe
   */
  updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva>;

  /**
   * Elimina una reserva del sistema.
   * @param id - ID de la reserva a eliminar
   * @throws Error si la reserva no existe o no se puede eliminar
   */
  deleteReserva(id: number): Promise<void>;

  /**
   * Verifica si una cancha está disponible en un horario específico.
   * @param input - Parámetros de disponibilidad
   * @returns Promise con true si está disponible, false en caso contrario
   */
  verificarDisponibilidad(input: DisponibilidadInput): Promise<boolean>;

  /**
   * Obtiene reservas de un usuario específico.
   * @param usuarioId - ID del usuario
   * @param incluirPasadas - Si incluir reservas pasadas
   * @returns Promise con lista de reservas del usuario
   */
  getReservasByUsuario(usuarioId: number, incluirPasadas?: boolean): Promise<Reserva[]>;

  /**
   * Confirma el pago de una reserva.
   * @param id - ID de la reserva
   * @param metodoPago - Método de pago utilizado
   * @returns Promise con la reserva actualizada
   */
  confirmarPago(id: number, metodoPago: MetodoPago): Promise<Reserva>;

  /**
   * Cancela una reserva.
   * @param id - ID de la reserva
   * @param motivo - Motivo de cancelación (opcional)
   * @returns Promise con la reserva cancelada
   */
  cancelarReserva(id: number, motivo?: string): Promise<Reserva>;
}

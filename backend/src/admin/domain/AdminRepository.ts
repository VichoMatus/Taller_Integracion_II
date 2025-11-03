import { Paginated } from "../../app/common/pagination";
import { Complejo } from "../../domain/complejo/Complejo";
import { Cancha } from "../../domain/cancha/Cancha";
import { EstadisticasOwner, EstadisticasComplejo, ReservaOwner, ReservasPorDiaSemana, ReservasPorCancha } from "../../domain/admin/Owner";

/**
 * Repositorio para operaciones del owner de complejos deportivos.
 * Define el contrato para la gestión de complejos, canchas y reservas.
 */
export interface AdminRepository {
  // === PANEL OWNER (MIS RECURSOS) ===
  
  /**
   * Obtiene los complejos del owner logueado.
   * @param ownerId - ID del owner
   * @returns Promise con lista de complejos
   */
  getMisComplejos(ownerId: number): Promise<Complejo[]>;

  /**
   * Obtiene las canchas del owner logueado.
   * @param ownerId - ID del owner
   * @returns Promise con lista de canchas
   */
  getMisCanchas(ownerId: number): Promise<Cancha[]>;

  /**
   * Obtiene las reservas de las canchas del owner.
   * @param ownerId - ID del owner
   * @param params - Filtros opcionales
   * @returns Promise con lista de reservas
   */
  getMisReservas(ownerId: number, params: { fecha_desde?: string; fecha_hasta?: string; estado?: string }): Promise<ReservaOwner[]>;

  /**
   * Obtiene estadísticas de negocio del owner.
   * @param ownerId - ID del owner
   * @returns Promise con estadísticas
   */
  getMisEstadisticas(ownerId: number): Promise<EstadisticasOwner>;

  /**
   * Obtiene estadísticas detalladas de un complejo específico.
   * @param ownerId - ID del owner
   * @param complejoId - ID del complejo
   * @returns Promise con estadísticas del complejo
   */
  getEstadisticasComplejo(ownerId: number, complejoId: number): Promise<EstadisticasComplejo>;

  /**
   * Obtiene estadísticas de reservas agrupadas por día de la semana.
   * Útil para gráficos de barras mostrando patrones semanales de reservas.
   * @param ownerId - ID del owner
   * @param complejoId - ID del complejo
   * @param diasAtras - Número de días hacia atrás para analizar (por defecto 30)
   * @returns Promise con datos de reservas por día de la semana
   */
  getReservasPorDiaSemana(ownerId: number, complejoId: number, diasAtras?: number): Promise<ReservasPorDiaSemana>;

  /**
   * Obtiene estadísticas de reservas agrupadas por cancha.
   * Útil para gráficos de barras comparando el rendimiento de cada cancha del complejo.
   * @param ownerId - ID del owner
   * @param complejoId - ID del complejo
   * @param diasAtras - Número de días hacia atrás para analizar (por defecto 30)
   * @returns Promise con datos de reservas por cancha
   */
  getReservasPorCancha(ownerId: number, complejoId: number, diasAtras?: number): Promise<ReservasPorCancha>;

  // === GESTIÓN DE COMPLEJOS ===
  
  /**
   * Crea un nuevo complejo.
   * @param ownerId - ID del owner
   * @param data - Datos del complejo
   * @returns Promise con el complejo creado
   */
  createComplejo(ownerId: number, data: Omit<Complejo, "id" | "owner_id">): Promise<Complejo>;

  /**
   * Obtiene un complejo específico del owner.
   * @param ownerId - ID del owner
   * @param complejoId - ID del complejo
   * @returns Promise con el complejo
   */
  getComplejo(ownerId: number, complejoId: number): Promise<Complejo>;

  /**
   * Actualiza un complejo del owner.
   * @param ownerId - ID del owner
   * @param complejoId - ID del complejo
   * @param data - Datos a actualizar
   * @returns Promise con el complejo actualizado
   */
  updateComplejo(ownerId: number, complejoId: number, data: Partial<Omit<Complejo, "id" | "owner_id">>): Promise<Complejo>;

  /**
   * Elimina un complejo del owner.
   * @param ownerId - ID del owner
   * @param complejoId - ID del complejo
   */
  deleteComplejo(ownerId: number, complejoId: number): Promise<void>;

  // === GESTIÓN DE CANCHAS ===
  
  /**
   * Crea una nueva cancha.
   * @param ownerId - ID del owner (para verificar permisos)
   * @param data - Datos de la cancha
   * @returns Promise con la cancha creada
   */
  createCancha(ownerId: number, data: Omit<Cancha, "id">): Promise<Cancha>;

  /**
   * Obtiene una cancha específica del owner.
   * @param ownerId - ID del owner
   * @param canchaId - ID de la cancha
   * @returns Promise con la cancha
   */
  getCancha(ownerId: number, canchaId: number): Promise<Cancha>;

  /**
   * Actualiza una cancha del owner.
   * @param ownerId - ID del owner
   * @param canchaId - ID de la cancha
   * @param data - Datos a actualizar
   * @returns Promise con la cancha actualizada
   */
  updateCancha(ownerId: number, canchaId: number, data: Partial<Omit<Cancha, "id">>): Promise<Cancha>;

  /**
   * Elimina una cancha del owner.
   * @param ownerId - ID del owner
   * @param canchaId - ID de la cancha
   */
  deleteCancha(ownerId: number, canchaId: number): Promise<void>;
}

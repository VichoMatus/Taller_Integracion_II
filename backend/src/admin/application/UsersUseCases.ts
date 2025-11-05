import { AdminRepository } from "../domain/AdminRepository";
import { Complejo } from "../../domain/complejo/Complejo";
import { Cancha } from "../../domain/cancha/Cancha";
import { ReservaOwner, EstadisticasOwner, EstadisticasComplejo, ReservasPorDiaSemana, ReservasPorCancha } from "../../domain/admin/Owner";
import { CreateComplejoIn, UpdateComplejoIn, CreateCanchaIn, UpdateCanchaIn, FiltrosReservasIn, MisRecursosOut, mapCreateComplejoToEntity, mapCreateCanchaToEntity } from "./dtos";

// === CASOS DE USO PANEL OWNER ===

/**
 * Caso de uso para obtener resumen de recursos del owner.
 */
export class GetMisRecursos {
  constructor(private repo: AdminRepository) {}
  
  async execute(ownerId: number): Promise<MisRecursosOut> {
    const [complejos, canchas, reservas, estadisticas] = await Promise.all([
      this.repo.getMisComplejos(ownerId),
      this.repo.getMisCanchas(ownerId),
      this.repo.getMisReservas(ownerId, {}),
      this.repo.getMisEstadisticas(ownerId)
    ]);
    
    return {
      complejos,
      canchas,
      total_reservas: reservas.length,
      ingresos_mes: estadisticas.ingresos_totales
    };
  }
}

/**
 * Caso de uso para obtener complejos del owner.
 */
export class GetMisComplejos {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number): Promise<Complejo[]> {
    return this.repo.getMisComplejos(ownerId);
  }
}

/**
 * Caso de uso para obtener canchas del owner.
 */
export class GetMisCanchas {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number): Promise<Cancha[]> {
    return this.repo.getMisCanchas(ownerId);
  }
}

/**
 * Caso de uso para obtener reservas del owner.
 */
export class GetMisReservas {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, filtros: FiltrosReservasIn): Promise<ReservaOwner[]> {
    return this.repo.getMisReservas(ownerId, filtros);
  }
}

/**
 * Caso de uso para obtener estadísticas del owner.
 */
export class GetMisEstadisticas {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number): Promise<EstadisticasOwner> {
    return this.repo.getMisEstadisticas(ownerId);
  }
}

/**
 * Caso de uso para obtener estadísticas detalladas de un complejo específico.
 * Incluye métricas de canchas activas, reservas del último mes, ingresos, etc.
 */
export class GetEstadisticasComplejo {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, complejoId: number): Promise<EstadisticasComplejo> {
    return this.repo.getEstadisticasComplejo(ownerId, complejoId);
  }
}

/**
 * Caso de uso para obtener reservas agrupadas por día de la semana.
 * Útil para generar gráficos de barras mostrando patrones de reservas semanales.
 */
export class GetReservasPorDiaSemana {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, complejoId: number, diasAtras?: number): Promise<ReservasPorDiaSemana> {
    return this.repo.getReservasPorDiaSemana(ownerId, complejoId, diasAtras);
  }
}

/**
 * Caso de uso para obtener reservas agrupadas por cancha.
 * Útil para generar gráficos de barras comparando el rendimiento de cada cancha del complejo.
 */
export class GetReservasPorCancha {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, complejoId: number, diasAtras?: number): Promise<ReservasPorCancha> {
    return this.repo.getReservasPorCancha(ownerId, complejoId, diasAtras);
  }
}

// === CASOS DE USO GESTIÓN COMPLEJOS ===

/**
 * Caso de uso para crear complejo.
 */
export class CreateComplejo {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, data: CreateComplejoIn): Promise<Complejo> {
    const complejoData = mapCreateComplejoToEntity(data, ownerId);
    return this.repo.createComplejo(ownerId, complejoData);
  }
}

/**
 * Caso de uso para obtener complejo específico.
 */
export class GetComplejo {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, complejoId: number): Promise<Complejo> {
    return this.repo.getComplejo(ownerId, complejoId);
  }
}

/**
 * Caso de uso para actualizar complejo.
 */
export class UpdateComplejo {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, complejoId: number, data: UpdateComplejoIn): Promise<Complejo> {
    return this.repo.updateComplejo(ownerId, complejoId, data);
  }
}

/**
 * Caso de uso para eliminar complejo.
 */
export class DeleteComplejo {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, complejoId: number): Promise<void> {
    return this.repo.deleteComplejo(ownerId, complejoId);
  }
}

// === CASOS DE USO GESTIÓN CANCHAS ===

/**
 * Caso de uso para crear cancha.
 */
export class CreateCancha {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, data: CreateCanchaIn): Promise<Cancha> {
    const canchaData = mapCreateCanchaToEntity(data, ownerId);
    return this.repo.createCancha(ownerId, canchaData);
  }
}

/**
 * Caso de uso para obtener cancha específica.
 */
export class GetCancha {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, canchaId: number): Promise<Cancha> {
    return this.repo.getCancha(ownerId, canchaId);
  }
}

/**
 * Caso de uso para actualizar cancha.
 */
export class UpdateCancha {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, canchaId: number, data: UpdateCanchaIn): Promise<Cancha> {
    return this.repo.updateCancha(ownerId, canchaId, data);
  }
}

/**
 * Caso de uso para eliminar cancha.
 */
export class DeleteCancha {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, canchaId: number): Promise<void> {
    return this.repo.deleteCancha(ownerId, canchaId);
  }
}

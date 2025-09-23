import { BloqueoRepository, BloqueoFilters, CreateBloqueoInput, UpdateBloqueoInput, ConflictoBloqueoInput } from "../domain/BloqueoRepository";
import { Bloqueo, EstadoBloqueo } from "../../domain/bloqueo/Bloqueo";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso para listar bloqueos con paginación y filtros.
 */
export class ListBloqueos {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Obtiene una lista paginada de bloqueos.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado
   */
  execute(filters: BloqueoFilters): Promise<Paginated<Bloqueo>> {
    return this.repo.listBloqueos(filters);
  }
}

/**
 * Caso de uso para obtener un bloqueo específico.
 */
export class GetBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Obtiene un bloqueo por su ID.
   * @param id - ID del bloqueo
   * @returns Promise con los datos del bloqueo
   */
  execute(id: number): Promise<Bloqueo> {
    return this.repo.getBloqueo(id);
  }
}

/**
 * Caso de uso para crear un nuevo bloqueo.
 */
export class CreateBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Crea un nuevo bloqueo.
   * @param input - Datos del bloqueo a crear
   * @returns Promise con el bloqueo creado
   */
  async execute(input: CreateBloqueoInput): Promise<Bloqueo> {
    // Validaciones de negocio
    this.validateBloqueoInput(input);
    
    // Verificar conflictos con otros bloqueos
    const hayConflicto = await this.repo.verificarConflicto({
      canchaId: input.canchaId,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
    });
    
    if (hayConflicto) {
      throw new Error("Ya existe un bloqueo activo en el período especificado");
    }
    
    return this.repo.createBloqueo(input);
  }

  private validateBloqueoInput(input: CreateBloqueoInput): void {
    const now = new Date();
    const fechaInicio = new Date(input.fechaInicio);
    const fechaFin = new Date(input.fechaFin);

    // Validar que el título no esté vacío
    if (!input.titulo.trim()) {
      throw new Error("El título del bloqueo es requerido");
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (fechaFin <= fechaInicio) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    // Validar duración mínima (30 minutos) y máxima (30 días)
    const duracionMinutos = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60);
    if (duracionMinutos < 30) {
      throw new Error("La duración mínima de un bloqueo es 30 minutos");
    }

    const duracionDias = duracionMinutos / (60 * 24);
    if (duracionDias > 30) {
      throw new Error("La duración máxima de un bloqueo es 30 días");
    }

    // Validar que no sea en el pasado (excepto para mantenimiento de emergencia)
    if (fechaInicio < now && input.tipo !== "mantenimiento") {
      throw new Error("No se pueden crear bloqueos en el pasado (excepto mantenimiento de emergencia)");
    }

    // Validar patrón de recurrencia si es recurrente
    if (input.recurrente && !input.patronRecurrencia) {
      throw new Error("El patrón de recurrencia es requerido para bloqueos recurrentes");
    }
  }
}

/**
 * Caso de uso para actualizar datos de un bloqueo.
 */
export class UpdateBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Actualiza parcialmente un bloqueo.
   * @param id - ID del bloqueo
   * @param input - Datos a actualizar
   * @returns Promise con el bloqueo actualizado
   */
  async execute(id: number, input: UpdateBloqueoInput): Promise<Bloqueo> {
    // Si se actualizan fechas, verificar conflictos
    if (input.fechaInicio || input.fechaFin) {
      const bloqueoActual = await this.repo.getBloqueo(id);
      
      const fechaInicio = input.fechaInicio || bloqueoActual.fechaInicio;
      const fechaFin = input.fechaFin || bloqueoActual.fechaFin;
      
      const hayConflicto = await this.repo.verificarConflicto({
        canchaId: bloqueoActual.canchaId,
        fechaInicio,
        fechaFin,
        bloqueoId: id, // Excluir el bloqueo actual
      });
      
      if (hayConflicto) {
        throw new Error("El nuevo horario genera conflicto con otros bloqueos");
      }
    }

    // Validar título si se actualiza
    if (input.titulo !== undefined && !input.titulo.trim()) {
      throw new Error("El título del bloqueo no puede estar vacío");
    }
    
    return this.repo.updateBloqueo(id, input);
  }
}

/**
 * Caso de uso para eliminar un bloqueo.
 */
export class DeleteBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Elimina un bloqueo del sistema.
   * @param id - ID del bloqueo a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> {
    return this.repo.deleteBloqueo(id);
  }
}

/**
 * Caso de uso para verificar conflictos de bloqueos.
 */
export class VerificarConflictoBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Verifica si hay conflictos con otros bloqueos.
   * @param input - Parámetros de verificación
   * @returns Promise con resultado de conflicto
   */
  execute(input: ConflictoBloqueoInput): Promise<boolean> {
    return this.repo.verificarConflicto(input);
  }
}

/**
 * Caso de uso para obtener bloqueos activos.
 */
export class GetBloqueosActivos {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Obtiene bloqueos activos para una cancha en un período.
   * @param canchaId - ID de la cancha
   * @param fechaInicio - Fecha de inicio
   * @param fechaFin - Fecha de fin
   * @returns Promise con lista de bloqueos activos
   */
  execute(canchaId: number, fechaInicio: Date, fechaFin: Date): Promise<Bloqueo[]> {
    return this.repo.getBloqueosActivos(canchaId, fechaInicio, fechaFin);
  }
}

/**
 * Caso de uso para obtener bloqueos por creador.
 */
export class GetBloqueosByCreador {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Obtiene bloqueos de un usuario específico.
   * @param creadoPorId - ID del usuario creador
   * @returns Promise con lista de bloqueos
   */
  execute(creadoPorId: number): Promise<Bloqueo[]> {
    return this.repo.getBloqueosByCreador(creadoPorId);
  }
}

/**
 * Caso de uso para activar un bloqueo.
 */
export class ActivarBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Activa un bloqueo específico.
   * @param id - ID del bloqueo
   * @returns Promise con el bloqueo activado
   */
  execute(id: number): Promise<Bloqueo> {
    return this.repo.activarBloqueo(id);
  }
}

/**
 * Caso de uso para desactivar un bloqueo.
 */
export class DesactivarBloqueo {
  constructor(private repo: BloqueoRepository) {}
  
  /**
   * Desactiva un bloqueo específico.
   * @param id - ID del bloqueo
   * @returns Promise con el bloqueo desactivado
   */
  execute(id: number): Promise<Bloqueo> {
    return this.repo.desactivarBloqueo(id);
  }
}

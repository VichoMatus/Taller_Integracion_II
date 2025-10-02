import { CanchaRepository, CanchaFilters, CreateCanchaInput, UpdateCanchaInput } from "../domain/CanchaRepository";
import { Cancha, EstadoCancha, TipoCancha } from "../../domain/cancha/Cancha";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso para listar canchas con paginación y filtros.
 */
export class ListCanchas {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Obtiene una lista paginada de canchas.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado
   */
  execute(filters: CanchaFilters): Promise<Paginated<Cancha>> {
    return this.repo.listCanchas(filters);
  }
}

/**
 * Caso de uso para obtener una cancha específica.
 */
export class GetCancha {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Obtiene una cancha por su ID.
   * @param id - ID de la cancha
   * @returns Promise con los datos de la cancha
   */
  execute(id: number): Promise<Cancha> {
    return this.repo.getCancha(id);
  }
}

/**
 * Caso de uso para crear una nueva cancha.
 */
export class CreateCancha {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Crea una nueva cancha.
   * @param input - Datos de la cancha a crear
   * @returns Promise con la cancha creada
   */
  execute(input: CreateCanchaInput): Promise<Cancha> {
    // Validaciones de negocio
    if (input.precioPorHora <= 0) {
      throw new Error("El precio por hora debe ser mayor a 0");
    }
    if (input.capacidad <= 0) {
      throw new Error("La capacidad debe ser mayor a 0");
    }
    
    return this.repo.createCancha(input);
  }
}

/**
 * Caso de uso para actualizar datos de una cancha.
 */
export class UpdateCancha {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Actualiza parcialmente una cancha.
   * @param id - ID de la cancha
   * @param input - Datos a actualizar
   * @returns Promise con la cancha actualizada
   */
  execute(id: number, input: UpdateCanchaInput): Promise<Cancha> {
    // Validaciones de negocio
    if (input.precioPorHora !== undefined && input.precioPorHora <= 0) {
      throw new Error("El precio por hora debe ser mayor a 0");
    }
    if (input.capacidad !== undefined && input.capacidad <= 0) {
      throw new Error("La capacidad debe ser mayor a 0");
    }
    
    return this.repo.updateCancha(id, input);
  }
}

/**
 * Caso de uso para eliminar una cancha.
 */
export class DeleteCancha {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Elimina una cancha del sistema.
   * @param id - ID de la cancha a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> {
    return this.repo.deleteCancha(id);
  }
}

/**
 * Caso de uso para cambiar el estado de una cancha.
 */
export class CambiarEstadoCancha {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Cambia el estado de una cancha.
   * @param id - ID de la cancha
   * @param estado - Nuevo estado
   * @returns Promise con la cancha actualizada
   */
  execute(id: number, estado: EstadoCancha): Promise<Cancha> {
    return this.repo.cambiarEstado(id, estado);
  }
}

/**
 * Caso de uso para obtener canchas disponibles.
 */
export class GetCanchasDisponibles {
  constructor(private repo: CanchaRepository) {}
  
  /**
   * Obtiene canchas disponibles en un rango de tiempo.
   * @param fechaInicio - Fecha y hora de inicio
   * @param fechaFin - Fecha y hora de fin
   * @param tipo - Tipo de cancha (opcional)
   * @returns Promise con lista de canchas disponibles
   */
  execute(fechaInicio: Date, fechaFin: Date, tipo?: TipoCancha): Promise<Cancha[]> {
    if (fechaInicio >= fechaFin) {
      throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
    }
    
    return this.repo.getCanchasDisponibles(fechaInicio, fechaFin, tipo);
  }
}

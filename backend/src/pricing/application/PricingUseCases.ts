import { PricingRepository } from '../../domain/pricing/repository';
import { 
  ReglaPrecio, 
  Promocion, 
  PricingRulesList, 
  PromocionList, 
  PricingQueryParams, 
  PromocionQueryParams 
} from '../../domain/pricing/entities';

/**
 * Caso de uso: Listar reglas de precios
 */
export class ListPricingRules {
  constructor(private repository: PricingRepository) {}

  async execute(params: PricingQueryParams): Promise<PricingRulesList> {
    return await this.repository.findAllPricingRules(params);
  }
}

/**
 * Caso de uso: Obtener regla de precio específica
 */
export class GetPricingRule {
  constructor(private repository: PricingRepository) {}

  async execute(id: number): Promise<ReglaPrecio | null> {
    if (!id || id <= 0) {
      throw new Error('ID de regla de precio inválido');
    }

    return await this.repository.findPricingRuleById(id);
  }
}

/**
 * Caso de uso: Crear regla de precio
 */
export class CreatePricingRule {
  constructor(private repository: PricingRepository) {}

  async execute(data: Omit<ReglaPrecio, 'id_regla' | 'created_at' | 'updated_at'>): Promise<ReglaPrecio> {
    // Validaciones
    this.validatePricingRuleData(data);

    return await this.repository.createPricingRule(data);
  }

  private validatePricingRuleData(data: any): void {
    if (!data.id_cancha || data.id_cancha <= 0) {
      throw new Error('id_cancha es requerido');
    }

    if (!data.hora_inicio || !data.hora_fin) {
      throw new Error('hora_inicio y hora_fin son requeridas');
    }

    if (!this.isValidTimeFormat(data.hora_inicio) || !this.isValidTimeFormat(data.hora_fin)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }

    if (data.hora_inicio >= data.hora_fin) {
      throw new Error('hora_inicio debe ser menor a hora_fin');
    }

    if (!data.precio_por_hora || data.precio_por_hora <= 0) {
      throw new Error('precio_por_hora debe ser mayor a 0');
    }

    // Validar fechas de vigencia si se proporcionan
    if (data.vigente_desde && data.vigente_hasta) {
      if (new Date(data.vigente_desde) > new Date(data.vigente_hasta)) {
        throw new Error('vigente_desde no puede ser mayor a vigente_hasta');
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}

/**
 * Caso de uso: Actualizar regla de precio
 */
export class UpdatePricingRule {
  constructor(private repository: PricingRepository) {}

  async execute(id: number, data: Partial<ReglaPrecio>): Promise<ReglaPrecio> {
    if (!id || id <= 0) {
      throw new Error('ID de regla de precio inválido');
    }

    // Verificar que existe
    const existing = await this.repository.findPricingRuleById(id);
    if (!existing) {
      throw new Error('Regla de precio no encontrada');
    }

    return await this.repository.updatePricingRule(id, data);
  }
}

/**
 * Caso de uso: Eliminar regla de precio
 */
export class DeletePricingRule {
  constructor(private repository: PricingRepository) {}

  async execute(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID de regla de precio inválido');
    }

    // Verificar que existe
    const existing = await this.repository.findPricingRuleById(id);
    if (!existing) {
      throw new Error('Regla de precio no encontrada');
    }

    return await this.repository.deletePricingRule(id);
  }
}

/**
 * Caso de uso: Listar promociones
 */
export class ListPromociones {
  constructor(private repository: PricingRepository) {}

  async execute(params: PromocionQueryParams): Promise<PromocionList> {
    return await this.repository.findAllPromociones(params);
  }
}

/**
 * Caso de uso: Obtener promoción específica
 */
export class GetPromocion {
  constructor(private repository: PricingRepository) {}

  async execute(id: number): Promise<Promocion | null> {
    if (!id || id <= 0) {
      throw new Error('ID de promoción inválido');
    }

    return await this.repository.findPromocionById(id);
  }
}

/**
 * Caso de uso: Crear promoción
 */
export class CreatePromocion {
  constructor(private repository: PricingRepository) {}

  async execute(data: Omit<Promocion, 'id_promocion' | 'created_at' | 'updated_at'>): Promise<Promocion> {
    // Validaciones
    this.validatePromocionData(data);

    return await this.repository.createPromocion(data);
  }

  private validatePromocionData(data: any): void {
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new Error('título es requerido');
    }

    if (!data.tipo || !['porcentaje', 'monto_fijo'].includes(data.tipo)) {
      throw new Error('tipo debe ser "porcentaje" o "monto_fijo"');
    }

    if (!data.valor || data.valor <= 0) {
      throw new Error('valor debe ser mayor a 0');
    }

    if (data.tipo === 'porcentaje' && data.valor > 100) {
      throw new Error('porcentaje no puede ser mayor a 100');
    }

    if (!data.estado || !['activa', 'inactiva'].includes(data.estado)) {
      throw new Error('estado debe ser "activa" o "inactiva"');
    }

    // Validar fechas de vigencia si se proporcionan
    if (data.vigente_desde && data.vigente_hasta) {
      if (new Date(data.vigente_desde) > new Date(data.vigente_hasta)) {
        throw new Error('vigente_desde no puede ser mayor a vigente_hasta');
      }
    }
  }
}

/**
 * Caso de uso: Actualizar promoción
 */
export class UpdatePromocion {
  constructor(private repository: PricingRepository) {}

  async execute(id: number, data: Partial<Promocion>): Promise<Promocion> {
    if (!id || id <= 0) {
      throw new Error('ID de promoción inválido');
    }

    // Verificar que existe
    const existing = await this.repository.findPromocionById(id);
    if (!existing) {
      throw new Error('Promoción no encontrada');
    }

    return await this.repository.updatePromocion(id, data);
  }
}

/**
 * Caso de uso: Eliminar promoción
 */
export class DeletePromocion {
  constructor(private repository: PricingRepository) {}

  async execute(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID de promoción inválido');
    }

    // Verificar que existe
    const existing = await this.repository.findPromocionById(id);
    if (!existing) {
      throw new Error('Promoción no encontrada');
    }

    return await this.repository.deletePromocion(id);
  }
}
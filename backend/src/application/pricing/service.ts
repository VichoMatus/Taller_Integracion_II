import { PricingRepository } from '../../domain/pricing/repository';
import { ReglaPrecio, Promocion, PricingRulesList, PromocionList, PricingQueryParams, PromocionQueryParams } from '../../domain/pricing/entities';

export class PricingService {
  constructor(private pricingRepository: PricingRepository) {}

  // Reglas de Precio
  async getPricingRules(params: PricingQueryParams): Promise<PricingRulesList> {
    return this.pricingRepository.findAllPricingRules(params);
  }

  async getPricingRuleById(id: number): Promise<ReglaPrecio | null> {
    return this.pricingRepository.findPricingRuleById(id);
  }

  // Promociones
  async getPromociones(params: PromocionQueryParams): Promise<PromocionList> {
    return this.pricingRepository.findAllPromociones(params);
  }

  async getPromocionById(id: number): Promise<Promocion | null> {
    return this.pricingRepository.findPromocionById(id);
  }
}
import { ReglaPrecio, Promocion, PricingRulesList, PromocionList, PricingQueryParams, PromocionQueryParams } from './entities';

export interface PricingRepository {
  // Reglas de Precio
  findAllPricingRules(params: PricingQueryParams): Promise<PricingRulesList>;
  findPricingRuleById(id: number): Promise<ReglaPrecio | null>;
  
  // Promociones
  findAllPromociones(params: PromocionQueryParams): Promise<PromocionList>;
  findPromocionById(id: number): Promise<Promocion | null>;
}
import { ReglaPrecio, Promocion, PricingRulesList, PromocionList, PricingQueryParams, PromocionQueryParams } from './entities';

export interface PricingRepository {
  // Reglas de Precio
  findAllPricingRules(params: PricingQueryParams): Promise<PricingRulesList>;
  findPricingRuleById(id: number): Promise<ReglaPrecio | null>;
  createPricingRule(data: Omit<ReglaPrecio, 'id_regla' | 'created_at' | 'updated_at'>): Promise<ReglaPrecio>;
  updatePricingRule(id: number, data: Partial<ReglaPrecio>): Promise<ReglaPrecio>;
  deletePricingRule(id: number): Promise<boolean>;
  
  // Promociones
  findAllPromociones(params: PromocionQueryParams): Promise<PromocionList>;
  findPromocionById(id: number): Promise<Promocion | null>;
  createPromocion(data: Omit<Promocion, 'id_promocion' | 'created_at' | 'updated_at'>): Promise<Promocion>;
  updatePromocion(id: number, data: Partial<Promocion>): Promise<Promocion>;
  deletePromocion(id: number): Promise<boolean>;
}
import axios, { AxiosResponse } from 'axios';
import { PricingRepository } from '../../domain/pricing/repository';
import { ReglaPrecio, Promocion, PricingRulesList, PromocionList, PricingQueryParams, PromocionQueryParams } from '../../domain/pricing/entities';

export class HttpPricingRepository implements PricingRepository {
  private apiClient;

  constructor(baseURL: string = 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me') {
    this.apiClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Reglas de Precio
  async findAllPricingRules(params: PricingQueryParams): Promise<PricingRulesList> {
    try {
      const response: AxiosResponse<PricingRulesList> = await this.apiClient.get('/pricing', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching pricing rules: ${error}`);
    }
  }

  async findPricingRuleById(id: number): Promise<ReglaPrecio | null> {
    try {
      const response: AxiosResponse<ReglaPrecio> = await this.apiClient.get(`/pricing/${id}`);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching pricing rule ${id}: ${error}`);
    }
  }

  // Promociones
  async findAllPromociones(params: PromocionQueryParams): Promise<PromocionList> {
    try {
      const response: AxiosResponse<PromocionList> = await this.apiClient.get('/promociones', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching promociones: ${error}`);
    }
  }

  async findPromocionById(id: number): Promise<Promocion | null> {
    try {
      const response: AxiosResponse<Promocion> = await this.apiClient.get(`/promociones/${id}`);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching promocion ${id}: ${error}`);
    }
  }
}
import { Request, Response } from 'express';
import {
  ListPricingRules,
  GetPricingRule,
  CreatePricingRule,
  UpdatePricingRule,
  DeletePricingRule,
  ListPromociones,
  GetPromocion,
  CreatePromocion,
  UpdatePromocion,
  DeletePromocion
} from '../../application/PricingUseCases';

/**
 * Controlador para endpoints de pricing (reglas de precio y promociones)
 */
export class PricingController {
  constructor(
    private listPricingRulesUC: ListPricingRules,
    private getPricingRuleUC: GetPricingRule,
    private createPricingRuleUC: CreatePricingRule,
    private updatePricingRuleUC: UpdatePricingRule,
    private deletePricingRuleUC: DeletePricingRule,
    private listPromocionesUC: ListPromociones,
    private getPromocionUC: GetPromocion,
    private createPromocionUC: CreatePromocion,
    private updatePromocionUC: UpdatePromocion,
    private deletePromocionUC: DeletePromocion
  ) {}

  // === REGLAS DE PRECIO ===

  /**
   * GET /pricing - Listar reglas de precio
   */
  listPricingRules = async (req: Request, res: Response) => {
    try {
      const {
        q,
        id_cancha,
        id_complejo,
        dia,
        page = 1,
        page_size = 20
      } = req.query;

      const params = {
        q: q as string,
        id_cancha: id_cancha ? Number(id_cancha) : undefined,
        id_complejo: id_complejo ? Number(id_complejo) : undefined,
        dia: dia as string,
        page: Number(page),
        page_size: Number(page_size)
      };

      const result = await this.listPricingRulesUC.execute(params);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.page_size,
          total: result.total,
          totalPages: Math.ceil(result.total / result.page_size)
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /pricing/:id - Obtener regla de precio específica
   */
  getPricingRule = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const rule = await this.getPricingRuleUC.execute(Number(id));

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Regla de precio no encontrada'
        });
      }

      res.json({
        success: true,
        data: rule
      });
    } catch (error: any) {
      const status = error.message.includes('inválido') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /pricing - Crear regla de precio
   */
  createPricingRule = async (req: Request, res: Response) => {
    try {
      const ruleData = req.body;
      const rule = await this.createPricingRuleUC.execute(ruleData);

      res.status(201).json({
        success: true,
        data: rule,
        message: 'Regla de precio creada exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * PATCH /pricing/:id - Actualizar regla de precio
   */
  updatePricingRule = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const rule = await this.updatePricingRuleUC.execute(Number(id), updateData);

      res.json({
        success: true,
        data: rule,
        message: 'Regla de precio actualizada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrada') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * DELETE /pricing/:id - Eliminar regla de precio
   */
  deletePricingRule = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deletePricingRuleUC.execute(Number(id));

      res.json({
        success: true,
        message: 'Regla de precio eliminada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrada') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  // === PROMOCIONES ===

  /**
   * GET /promociones - Listar promociones
   */
  listPromociones = async (req: Request, res: Response) => {
    try {
      const {
        q,
        id_complejo,
        id_cancha,
        estado,
        tipo,
        page = 1,
        page_size = 20
      } = req.query;

      const params = {
        q: q as string,
        id_complejo: id_complejo ? Number(id_complejo) : undefined,
        id_cancha: id_cancha ? Number(id_cancha) : undefined,
        estado: estado as string,
        tipo: tipo as string,
        page: Number(page),
        page_size: Number(page_size)
      };

      const result = await this.listPromocionesUC.execute(params);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.page_size,
          total: result.total,
          totalPages: Math.ceil(result.total / result.page_size)
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /promociones/:id - Obtener promoción específica
   */
  getPromocion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const promocion = await this.getPromocionUC.execute(Number(id));

      if (!promocion) {
        return res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
      }

      res.json({
        success: true,
        data: promocion
      });
    } catch (error: any) {
      const status = error.message.includes('inválido') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /promociones - Crear promoción
   */
  createPromocion = async (req: Request, res: Response) => {
    try {
      const promocionData = req.body;
      const promocion = await this.createPromocionUC.execute(promocionData);

      res.status(201).json({
        success: true,
        data: promocion,
        message: 'Promoción creada exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * PATCH /promociones/:id - Actualizar promoción
   */
  updatePromocion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const promocion = await this.updatePromocionUC.execute(Number(id), updateData);

      res.json({
        success: true,
        data: promocion,
        message: 'Promoción actualizada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrada') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * DELETE /promociones/:id - Eliminar promoción
   */
  deletePromocion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deletePromocionUC.execute(Number(id));

      res.json({
        success: true,
        message: 'Promoción eliminada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrada') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };
}
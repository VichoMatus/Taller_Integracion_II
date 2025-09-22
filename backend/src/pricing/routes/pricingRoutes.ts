import express from 'express';
import { PricingService } from '../../application/pricing/service';
import { HttpPricingRepository } from '../../infrastructure/http/pricing-repository';

const router = express.Router();

// Inicializar dependencias
const pricingRepository = new HttpPricingRepository();
const pricingService = new PricingService(pricingRepository);

/**
 * GET /api/pricing - Obtener reglas de precio
 * Query params: q, id_cancha, id_complejo, dia, page, page_size
 */
router.get('/', async (req, res) => {
  try {
    const result = await pricingService.getPricingRules(req.query as any);
    res.json({
      ok: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo reglas de precio:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/pricing/:id - Obtener regla de precio por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        ok: false,
        error: 'ID inválido'
      });
    }

    const reglaPrecio = await pricingService.getPricingRuleById(id);
    
    if (!reglaPrecio) {
      return res.status(404).json({
        ok: false,
        error: 'Regla de precio no encontrada'
      });
    }

    res.json({
      ok: true,
      data: reglaPrecio
    });
  } catch (error: any) {
    console.error('Error obteniendo regla de precio:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

export default router;
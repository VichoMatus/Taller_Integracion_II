import express from 'express';
import { PricingService } from '../../application/pricing/service';
import { HttpPricingRepository } from '../../infrastructure/http/pricing-repository';

const router = express.Router();

// Inicializar dependencias
const pricingRepository = new HttpPricingRepository();
const pricingService = new PricingService(pricingRepository);

/**
 * GET /api/promociones - Obtener promociones
 * Query params: q, id_complejo, id_cancha, estado, tipo, page, page_size
 */
router.get('/', async (req, res) => {
  try {
    const result = await pricingService.getPromociones(req.query as any);
    res.json({
      ok: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo promociones:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/promociones/:id - Obtener promoción por ID
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

    const promocion = await pricingService.getPromocionById(id);
    
    if (!promocion) {
      return res.status(404).json({
        ok: false,
        error: 'Promoción no encontrada'
      });
    }

    res.json({
      ok: true,
      data: promocion
    });
  } catch (error: any) {
    console.error('Error obteniendo promoción:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

export default router;
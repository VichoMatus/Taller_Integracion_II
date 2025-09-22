import express from 'express';
import { BloqueoService } from '../../application/bloqueos/service';
import { HttpBloqueoRepository } from '../../infrastructure/http/bloqueos-repository';

const router = express.Router();

// Inicializar dependencias
const bloqueoRepository = new HttpBloqueoRepository();
const bloqueoService = new BloqueoService(bloqueoRepository);

/**
 * GET /api/bloqueos - Obtener bloqueos
 * Query params: q, id_cancha, inicio, fin, page, page_size
 */
router.get('/', async (req, res) => {
  try {
    const result = await bloqueoService.getBloqueos(req.query as any);
    res.json({
      ok: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo bloqueos:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/bloqueos/:id - Obtener bloqueo por ID
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

    const bloqueo = await bloqueoService.getBloqueoById(id);
    
    if (!bloqueo) {
      return res.status(404).json({
        ok: false,
        error: 'Bloqueo no encontrado'
      });
    }

    res.json({
      ok: true,
      data: bloqueo
    });
  } catch (error: any) {
    console.error('Error obteniendo bloqueo:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

export default router;
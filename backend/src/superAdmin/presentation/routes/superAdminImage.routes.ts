import { Router } from 'express';
import { getSuperAdminImage } from '../controllers/superAdminImage.controller';

const router = Router();

// GET /api/superadmin/image/:filename
router.get('/image/:filename', getSuperAdminImage);

export default router;

import { Router } from 'express';
import superadminProfileImageGetRoutes from '../presentation/routes/superadminProfileImageGet.routes';

const router = Router();

// Rutas para pedir imagen de perfil de superadmin
router.use('/profile-image', superadminProfileImageGetRoutes);

export default router;

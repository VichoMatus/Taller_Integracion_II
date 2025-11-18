import { Router } from 'express';
import superadminProfileImageRoutes from '../presentation/routes/superadminProfileImage.routes';

const router = Router();

// Rutas para manejo de imagen de perfil de superadmin
router.use('/profile-image', superadminProfileImageRoutes);

export default router;

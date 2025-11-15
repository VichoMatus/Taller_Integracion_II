import { Router } from 'express';
import multer from 'multer';
import { SuperAdminProfileImageController } from '../controllers/SuperAdminProfileImageController';

const router = Router();
const controller = new SuperAdminProfileImageController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Endpoint para subir imagen de perfil de superadmin
router.post('/profile-image', upload.single('image'), (req, res) => controller.uploadProfileImage(req, res));

export default router;

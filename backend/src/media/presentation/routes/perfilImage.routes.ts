import { Router } from 'express';
import multer from 'multer';
import { PerfilImageController } from '../controllers/PerfilImageController';

const router = Router();
const controller = new PerfilImageController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Endpoint para subir imagen de perfil de usuario/admin
router.post('/perfil-image', upload.single('image'), (req, res) => controller.uploadProfileImage(req, res));

export default router;

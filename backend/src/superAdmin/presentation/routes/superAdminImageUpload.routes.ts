import { Router } from 'express';
import multer from 'multer';
import { uploadSuperAdminImage } from '../controllers/superAdminImageUpload.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/superadmin/image/upload
router.post('/image/upload', upload.single('image'), uploadSuperAdminImage);

export default router;

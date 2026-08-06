import { Router } from 'express';
import multer from 'multer';
import { uploadMedia } from './media.controller';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/', upload.single('file'), uploadMedia);

export default router;
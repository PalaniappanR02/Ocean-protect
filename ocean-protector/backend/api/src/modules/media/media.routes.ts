import { Router } from 'express';
import multer from 'multer';
import { uploadMedia } from './media.controller';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-temp-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.post('/', upload.single('file'), uploadMedia);

export default router;
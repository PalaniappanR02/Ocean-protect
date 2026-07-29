import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../config/constants';
import { ValidationError } from '../../common/errors/AppError';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadMedia = (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded.');
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    fs.unlinkSync(req.file.path);
    throw new ValidationError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  if (req.file.size > MAX_FILE_SIZE_BYTES) {
    fs.unlinkSync(req.file.path);
    throw new ValidationError('File size exceeds 8MB limit.');
  }

  const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
  const newFilename = `${uuidv4()}${ext}`;
  const newPath = path.join(UPLOAD_DIR, newFilename);
  
  fs.renameSync(req.file.path, newPath);

  const mediaUrl = `/uploads/${newFilename}`;
  
  res.status(201).json({
    success: true,
    data: {
      mediaUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
};
import { Request, Response } from 'express';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../config/constants';
import { ValidationError } from '../../common/errors/AppError';
import { cloudinary } from '../../config/cloudinary';

export const uploadMedia = (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded.');
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    throw new ValidationError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  if (req.file.size > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError('File size exceeds 8MB limit.');
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'oceanguard-reports', resource_type: 'auto' },
    (error, result) => {
      if (error || !result) {
        return res.status(502).json({
          success: false,
          error: { code: 'UPLOAD_FAILED', message: error?.message ?? 'Cloudinary upload failed' },
        });
      }

      res.status(201).json({
        success: true,
        data: {
          mediaUrl: result.secure_url,
          mimeType: req.file!.mimetype,
          size: req.file!.size,
        },
      });
    },
  );

  uploadStream.end(req.file.buffer);
};
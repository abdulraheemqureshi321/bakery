import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as cloudinaryService from '../services/cloudinaryService';

import { AppError } from '../utils/AppError';

// Multer memory storage (files stay in memory buffer)
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only JPG, PNG, and WebP are allowed.', 400));
    }
  },
}).single('image');

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  multerUpload(req, res, (err: any) => {
    if (err) {
      if (err instanceof AppError) {
        return next(err);
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Maximum size is 5MB.', 400));
      }
      return next(new AppError(err.message || 'File upload error', 400));
    }
    next();
  });
};

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      req.body.folder || 'soultalk_pastry'
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const publicId = req.params.publicId as string;
    if (!publicId) {
      res.status(400).json({ success: false, message: 'Public ID is required' });
      return;
    }

    // publicId may contain slashes (folder/name), which come as nested params
    // We use a wildcard route, so publicId captures the full path
    await cloudinaryService.deleteImage(publicId);

    res.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    next(error);
  }
}

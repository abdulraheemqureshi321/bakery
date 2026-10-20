import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/AppError';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image buffer to Cloudinary.
 */
export async function uploadImage(
  buffer: Buffer,
  mimetype: string,
  originalname: string,
  folder: string = 'soultalk_pastry'
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new AppError('Invalid file type. Only JPG, PNG, and WebP are allowed.');
  }

  if (buffer.length > MAX_SIZE) {
    throw new AppError('File too large. Maximum size is 5MB.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp'],
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError('Image upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by publicId.
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('Failed to delete image');
  }
}

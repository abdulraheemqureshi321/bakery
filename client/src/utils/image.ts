/**
 * Optimizes Cloudinary URLs by automatically applying format and quality transformations (f_auto, q_auto).
 * Also supports responsive width resizing.
 */
export function getOptimizedImageUrl(
  url?: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  if (!url) return '/placeholder-cake.png';

  // If not a Cloudinary URL, return as is
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  // Already transformed
  if (url.includes('/f_auto,q_auto')) {
    return url;
  }

  const parts: string[] = ['f_auto', 'q_auto'];
  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);

  const transformString = parts.join(',');

  // Cloudinary URL format: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<version>/<public_id>
  return url.replace('/image/upload/', `/image/upload/${transformString}/`);
}

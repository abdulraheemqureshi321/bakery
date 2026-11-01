/**
 * Optimizes Cloudinary URLs by automatically applying format and quality transformations.
 * Supports responsive widths and returns real product photography for any missing assets.
 */
export function getOptimizedImageUrl(
  url?: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  if (!url || url.includes('placeholder-cake')) {
    return '/products/strawberry-tart.png';
  }

  // If local asset or external non-cloudinary URL, return as is
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

  return url.replace('/image/upload/', `/image/upload/${transformString}/`);
}

/**
 * Universal Boutique Product Artwork Mapping:
 * Ensures the exact, high-resolution 3D / watercolor treats from the Dilum Sanjaya design
 * are rendered consistently across the Menu Screen, Home Screen, Cart, and everywhere in the store.
 */
export const BOUTIQUE_PRODUCT_IMAGES: Record<string, string> = {
  'strawberry-tart': '/products/strawberry-tart.png',
  'strawberry-love-cake': '/products/strawberry-cake.png',
  'strawberry-cake': '/products/strawberry-cake.png',
  'berry-soda': '/products/berry-soda.png',
  'homemade-jam': '/products/homemade-jam.png',
  'strawberry-latte': '/products/strawberry-latte.png',
  'strawberry-matcha-cup': '/products/strawberry-matcha-cup.png',
  'strawberry-matcha': '/products/strawberry-matcha-cup.png',
  'orange-sunshine-cup': '/products/orange-sunshine-cup.png',
  'chocolate-treasure-cake': '/products/chocolate-treasure-cake.png',
  'strawberry-sundae': '/products/strawberry-sundae.png',
  'strawberry-macarons': '/products/strawberry-macarons.png',
};

export function getProductDisplayImage(slugOrUrl?: string): string {
  if (!slugOrUrl) return '/products/strawberry-tart.png';

  // 1. Direct slug match
  if (BOUTIQUE_PRODUCT_IMAGES[slugOrUrl]) {
    return BOUTIQUE_PRODUCT_IMAGES[slugOrUrl];
  }

  // 2. Check if slug is a substring in URL or filename
  for (const [slug, imgPath] of Object.entries(BOUTIQUE_PRODUCT_IMAGES)) {
    if (slugOrUrl.toLowerCase().includes(slug.toLowerCase())) {
      return imgPath;
    }
  }

  // 3. Fallback to Cloudinary / URL optimizer
  return getOptimizedImageUrl(slugOrUrl);
}

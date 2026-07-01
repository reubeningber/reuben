export const CLOUDINARY_VERSION = 'v1761245976';

export interface ImageConfig {
  type: 'cloudinary' | 'external';
  blurUrl?: string;
  mainUrl: string;
  srcset?: string;
}

function extractCloudinaryPath(imageUrl: string): string | null {
  // Match the asset path that follows the version token (/vNNNNNNNNNN/)
  const match = imageUrl.match(/\/upload\/(?:[^/]+\/)*(v\d+\/)(.+)$/);
  if (match) return match[2];
  // Fallback: strip one segment after /upload/
  const stripped = imageUrl.replace(/.*\/upload\/[^/]*\//, '');
  return stripped !== imageUrl ? stripped : null;
}

function makeUrl(cloudName: string, path: string, transform: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${CLOUDINARY_VERSION}/${path}`;
}

export function getImageConfig(
  imageUrl: string | null | undefined,
  cloudName: string,
  widths: number[]
): ImageConfig | null {
  if (!imageUrl) return null;

  const largest = widths[widths.length - 1];

  if (imageUrl.includes('res.cloudinary.com')) {
    const path = extractCloudinaryPath(imageUrl);
    if (!path) return { type: 'external', mainUrl: imageUrl };
    return {
      type: 'cloudinary',
      blurUrl: makeUrl(cloudName, path, 'f_auto,w_20,e_blur:2000'),
      mainUrl: makeUrl(cloudName, path, `f_auto,w_${largest}`),
      srcset: widths.map(w => `${makeUrl(cloudName, path, `f_auto,w_${w}`)} ${w}w`).join(', '),
    };
  }

  if (imageUrl.startsWith('assets/images/') || imageUrl.startsWith('/assets/images/')) {
    return { type: 'external', mainUrl: imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}` };
  }

  if (imageUrl.startsWith('web_assets/')) {
    return {
      type: 'cloudinary',
      blurUrl: makeUrl(cloudName, imageUrl, 'f_auto,w_20,e_blur:2000'),
      mainUrl: makeUrl(cloudName, imageUrl, `f_auto,w_${largest}`),
      srcset: widths.map(w => `${makeUrl(cloudName, imageUrl, `f_auto,w_${w}`)} ${w}w`).join(', '),
    };
  }

  return { type: 'external', mainUrl: imageUrl };
}

export function getOgImageUrl(imageUrl: string | null | undefined, cloudName: string): string {
  const fallback = makeUrl(cloudName, 'web_assets/reuben_ingber_october_2025.jpg', 'f_auto,w_1200,h_630,c_fill,g_face');

  if (!imageUrl) return fallback;

  if (imageUrl.includes('res.cloudinary.com')) {
    const path = extractCloudinaryPath(imageUrl);
    if (!path) return fallback;
    return makeUrl(cloudName, path, 'f_auto,w_1200,h_630,c_fill');
  }

  if (imageUrl.startsWith('web_assets/')) {
    return makeUrl(cloudName, imageUrl, 'f_auto,w_1200,h_630,c_fill');
  }

  return fallback;
}

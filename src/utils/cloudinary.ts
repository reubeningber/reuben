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
      mainUrl: makeUrl(cloudName, path, `f_auto,q_auto,w_${largest}`),
      srcset: widths.map(w => `${makeUrl(cloudName, path, `f_auto,q_auto,w_${w}`)} ${w}w`).join(', '),
    };
  }

  if (imageUrl.startsWith('assets/images/') || imageUrl.startsWith('/assets/images/')) {
    return { type: 'external', mainUrl: imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}` };
  }

  if (imageUrl.startsWith('web_assets/')) {
    return {
      type: 'cloudinary',
      blurUrl: makeUrl(cloudName, imageUrl, 'f_auto,w_20,e_blur:2000'),
      mainUrl: makeUrl(cloudName, imageUrl, `f_auto,q_auto,w_${largest}`),
      srcset: widths.map(w => `${makeUrl(cloudName, imageUrl, `f_auto,q_auto,w_${w}`)} ${w}w`).join(', '),
    };
  }

  // Unsplash's image CDN resizes via query params, so external Unsplash images
  // can still get a responsive srcset (Cloudinary fetch isn't enabled).
  if (/^https:\/\/(images|plus)\.unsplash\.com\//.test(imageUrl)) {
    return {
      type: 'external',
      mainUrl: unsplashUrl(imageUrl, largest),
      srcset: widths.map(w => `${unsplashUrl(imageUrl, w)} ${w}w`).join(', '),
    };
  }

  return { type: 'external', mainUrl: imageUrl };
}

function unsplashUrl(imageUrl: string, width: number): string {
  const url = new URL(imageUrl);
  url.searchParams.set('w', String(width));
  url.searchParams.set('auto', 'format');
  return url.toString();
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

  if (imageUrl.startsWith('assets/images/') || imageUrl.startsWith('/assets/images/')) {
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `https://reubeningber.com${path}`;
  }

  // External image (e.g. Unsplash) — use as-is so social shares reflect the post's lead image
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return fallback;
}

export interface VideoConfig {
  type: 'cloudinary' | 'external';
  src: string;
  poster?: string;
}

function makeVideoUrl(cloudName: string, path: string, transform: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transform}/${CLOUDINARY_VERSION}/${path}`;
}

function withExtension(path: string, ext: string): string {
  return path.replace(/\.[a-z0-9]+$/i, '') + `.${ext}`;
}

// Resolves a field-note `video` value to a playable src plus a poster frame.
// Accepts a `web_assets/` path (extension optional) or a full Cloudinary video
// URL; anything else (e.g. a self-hosted .mp4) is passed through untouched.
export function getVideoConfig(
  video: string | null | undefined,
  cloudName: string
): VideoConfig | null {
  if (!video) return null;

  let path: string | null = null;
  if (video.includes('res.cloudinary.com')) {
    path = extractCloudinaryPath(video);
    if (!path) return { type: 'external', src: video };
  } else if (video.startsWith('web_assets/')) {
    path = video;
  }

  if (!path) return { type: 'external', src: video };

  return {
    type: 'cloudinary',
    src: makeVideoUrl(cloudName, withExtension(path, 'mp4'), 'q_auto'),
    poster: makeVideoUrl(cloudName, withExtension(path, 'jpg'), 'so_0,f_auto,q_auto,w_800'),
  };
}

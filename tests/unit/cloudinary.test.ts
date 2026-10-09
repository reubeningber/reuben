import { describe, it, expect } from 'vitest';
import { getImageConfig, getOgImageUrl, getVideoConfig } from '../../src/utils/cloudinary';

const cloudName = 'demo-cloud';
const widths = [200, 400, 800];

describe('getImageConfig', () => {
  it('returns null for missing input', () => {
    expect(getImageConfig(null, cloudName, widths)).toBeNull();
    expect(getImageConfig(undefined, cloudName, widths)).toBeNull();
  });

  it('builds blur/main/srcset urls for a full cloudinary URL', () => {
    const url = 'https://res.cloudinary.com/demo-cloud/image/upload/v1700000000/web_assets/photo.jpg';
    const config = getImageConfig(url, cloudName, widths);
    expect(config?.type).toBe('cloudinary');
    expect(config?.mainUrl).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto,w_800/v1761245976/web_assets/photo.jpg'
    );
    expect(config?.blurUrl).toContain('e_blur:2000');
    expect(config?.srcset?.split(', ')).toHaveLength(3);
  });

  it('falls back to external when a cloudinary URL has no extractable path', () => {
    const url = 'https://res.cloudinary.com/demo-cloud/image/upload/';
    const config = getImageConfig(url, cloudName, widths);
    expect(config).toEqual({ type: 'external', mainUrl: url });
  });

  it('treats assets/images/ paths as external and normalizes the leading slash', () => {
    expect(getImageConfig('assets/images/foo.png', cloudName, widths)).toEqual({
      type: 'external',
      mainUrl: '/assets/images/foo.png',
    });
    expect(getImageConfig('/assets/images/foo.png', cloudName, widths)).toEqual({
      type: 'external',
      mainUrl: '/assets/images/foo.png',
    });
  });

  it('builds cloudinary urls for web_assets/ paths', () => {
    const config = getImageConfig('web_assets/foo.jpg', cloudName, widths);
    expect(config?.type).toBe('cloudinary');
    expect(config?.mainUrl).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto,w_800/v1761245976/web_assets/foo.jpg'
    );
  });

  it('builds a width-based srcset for Unsplash images', () => {
    const url = 'https://images.unsplash.com/photo-123?q=80&w=1740&auto=format&fit=crop';
    const config = getImageConfig(url, cloudName, [400, 800]);
    expect(config?.type).toBe('external');
    expect(config?.mainUrl).toBe('https://images.unsplash.com/photo-123?q=80&w=800&auto=format&fit=crop');
    expect(config?.srcset).toBe(
      'https://images.unsplash.com/photo-123?q=80&w=400&auto=format&fit=crop 400w, ' +
      'https://images.unsplash.com/photo-123?q=80&w=800&auto=format&fit=crop 800w'
    );
  });

  it('passes through any other URL as external', () => {
    const url = 'https://example.com/photo.jpg';
    expect(getImageConfig(url, cloudName, widths)).toEqual({ type: 'external', mainUrl: url });
  });
});

describe('getOgImageUrl', () => {
  it('returns the fallback image when no url is given', () => {
    expect(getOgImageUrl(null, cloudName)).toContain('reuben_ingber_october_2025.jpg');
  });

  it('builds an og image for a cloudinary URL', () => {
    const url = 'https://res.cloudinary.com/demo-cloud/image/upload/v1700000000/web_assets/photo.jpg';
    expect(getOgImageUrl(url, cloudName)).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,w_1200,h_630,c_fill/v1761245976/web_assets/photo.jpg'
    );
  });

  it('builds an og image for a web_assets/ path', () => {
    expect(getOgImageUrl('web_assets/foo.jpg', cloudName)).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,w_1200,h_630,c_fill/v1761245976/web_assets/foo.jpg'
    );
  });

  it('passes through any other external URL as-is', () => {
    const url = 'https://example.com/photo.jpg';
    expect(getOgImageUrl(url, cloudName)).toBe(url);
  });

  it('builds an absolute URL for legacy assets/images/ paths', () => {
    expect(getOgImageUrl('assets/images/foo.png', cloudName)).toBe(
      'https://reubeningber.com/assets/images/foo.png'
    );
    expect(getOgImageUrl('/assets/images/foo.png', cloudName)).toBe(
      'https://reubeningber.com/assets/images/foo.png'
    );
  });
});

describe('getVideoConfig', () => {
  it('returns null for missing input', () => {
    expect(getVideoConfig(null, cloudName)).toBeNull();
    expect(getVideoConfig(undefined, cloudName)).toBeNull();
  });

  it('builds src and poster urls for a web_assets path', () => {
    expect(getVideoConfig('web_assets/clip.mp4', cloudName)).toEqual({
      type: 'cloudinary',
      src: 'https://res.cloudinary.com/demo-cloud/video/upload/q_auto/v1761245976/web_assets/clip.mp4',
      poster: 'https://res.cloudinary.com/demo-cloud/video/upload/so_0,f_auto,q_auto,w_800/v1761245976/web_assets/clip.jpg',
    });
  });

  it('adds the .mp4 extension when the path has none', () => {
    expect(getVideoConfig('web_assets/clip', cloudName)?.src).toBe(
      'https://res.cloudinary.com/demo-cloud/video/upload/q_auto/v1761245976/web_assets/clip.mp4'
    );
  });

  it('re-derives src and poster from a full cloudinary video URL', () => {
    const url = 'https://res.cloudinary.com/demo-cloud/video/upload/v1791584141/web_assets/clip.mov';
    const config = getVideoConfig(url, cloudName);
    expect(config?.src).toBe('https://res.cloudinary.com/demo-cloud/video/upload/q_auto/v1761245976/web_assets/clip.mp4');
    expect(config?.poster).toContain('so_0');
  });

  it('passes other URLs through without a poster', () => {
    const url = 'https://example.com/clip.mp4';
    expect(getVideoConfig(url, cloudName)).toEqual({ type: 'external', src: url });
  });
});

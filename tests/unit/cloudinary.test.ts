import { describe, it, expect } from 'vitest';
import { getImageConfig, getOgImageUrl } from '../../src/utils/cloudinary';

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
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,w_800/v1761245976/web_assets/photo.jpg'
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
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,w_800/v1761245976/web_assets/foo.jpg'
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

  it('falls back for any other URL shape', () => {
    expect(getOgImageUrl('https://example.com/photo.jpg', cloudName)).toContain(
      'reuben_ingber_october_2025.jpg'
    );
  });
});

import { describe, it, expect } from 'vitest';
import { readingCoverUrl } from '../../src/utils/readingCovers';

const cloudName = 'demo-cloud';

describe('readingCoverUrl', () => {
  it('builds a Cloudinary URL for a bare reading_covers/ path', () => {
    expect(readingCoverUrl(cloudName, 'reading_covers/123456')).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,w_300/reading_covers/123456'
    );
  });

  it('passes through an absolute-path image untouched', () => {
    expect(readingCoverUrl(cloudName, '/assets/images/foo.jpg')).toBe('/assets/images/foo.jpg');
  });

  it('passes through a full http(s) URL untouched', () => {
    const url = 'https://example.com/cover.jpg';
    expect(readingCoverUrl(cloudName, url)).toBe(url);
    expect(readingCoverUrl(cloudName, 'http://example.com/cover.jpg')).toBe('http://example.com/cover.jpg');
  });
});

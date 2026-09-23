import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { series, seriesForPost } from '../../src/data/series';

const POSTS_DIR = path.resolve(__dirname, '../../src/content/posts');

describe('series (pillar pages)', () => {
  for (const s of series) {
    it(`${s.slug}: every post exists and is not a draft`, () => {
      for (const slug of s.sections.flatMap(sec => sec.posts)) {
        const file = path.join(POSTS_DIR, `${slug}.md`);
        expect(fs.existsSync(file), `${slug}.md is missing`).toBe(true);
        expect(fs.readFileSync(file, 'utf8')).not.toMatch(/^draft:\s*true/m);
      }
    });

    it(`${s.slug}: has a page route`, () => {
      expect(fs.existsSync(path.resolve(__dirname, `../../src/pages/${s.slug}.astro`))).toBe(true);
    });
  }

  it('seriesForPost finds a post listed in more than one series', () => {
    const slugs = seriesForPost('2025-11-24-i-thought-i-was-distracted-turns-out-it-was-adhd').map(s => s.slug);
    expect(slugs).toEqual(['parenting', 'adhd-and-motivation']);
  });
});

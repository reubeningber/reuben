export function createExcerpt(body: string, maxLength: number = 120): string {
  const plainText = body
    .replace(/^---[\s\S]*?---/g, '')
    .replace(/#+\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

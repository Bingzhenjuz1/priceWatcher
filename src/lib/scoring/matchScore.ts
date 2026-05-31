function tokenize(input: string): string[] {
  const normalized = input.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return Array.from(new Set(tokens));
}

export function calculateMatchScore(query: string, title: string): number {
  const queryTokens = tokenize(query);
  const titleText = title.toLowerCase();

  if (queryTokens.length === 0) {
    return 0;
  }

  const hits = queryTokens.filter((token) => titleText.includes(token));
  return Math.min(100, Math.round((hits.length / queryTokens.length) * 100));
}

export function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === 'string');
  }
  if (typeof tags === 'string') {
    if (!tags) return [];
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

export function parseMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata || '{}');
    } catch {
      return {};
    }
  }
  return {};
}

export function parseChannels(channels: unknown): string[] {
  if (Array.isArray(channels)) {
    return channels.filter((c): c is string => typeof c === 'string');
  }
  if (typeof channels === 'string') {
    try {
      const parsed = JSON.parse(channels);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

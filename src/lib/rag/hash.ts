import crypto from 'crypto';

/**
 * Computes a deterministic SHA-256 hash for raw content and normalized metadata.
 * Strips non-content volatile fields (timestamps, view counts, dynamic IDs) so that
 * meaningful edits trigger a new hash, but touching metadata without content change skips re-embedding.
 */
export function computeContentHash(content: string | Record<string, any>): string {
  let normalizedStr = '';

  if (typeof content === 'string') {
    normalizedStr = content.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
  } else if (content && typeof content === 'object') {
    // Clone and strip volatile properties
    const clone = { ...content };
    delete clone.updatedAt;
    delete clone.updated_at;
    delete clone.created_at;
    delete clone.createdAt;
    delete clone.viewCount;
    delete clone.view_count;
    delete clone.lastAccessedAt;
    delete clone.indexedAt;

    // Deterministic sorted key serialization
    normalizedStr = serializeDeterministically(clone);
  }

  return crypto.createHash('sha256').update(normalizedStr, 'utf8').digest('hex');
}

function serializeDeterministically(obj: any): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(serializeDeterministically).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => `"${k}":${serializeDeterministically(obj[k])}`).join(',') + '}';
}

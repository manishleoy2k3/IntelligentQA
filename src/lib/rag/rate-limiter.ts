import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of rateLimitMap.entries()) {
        if (record.resetAt <= now) {
          rateLimitMap.delete(key);
        }
      }
    },
    5 * 60 * 1000
  ).unref?.();
}

export function checkRateLimit(
  req: NextRequest | { headers: Headers | { get(name: string): string | null } },
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  // In unit testing, allow unlimited requests unless FORCE_RATE_LIMIT=true
  if (
    process.env.FORCE_RATE_LIMIT !== 'true' &&
    (process.env.NODE_ENV === 'test' ||
      Boolean(process.env.NODE_TEST_CONTEXT) ||
      process.env.DISABLE_RATE_LIMIT === 'true')
  ) {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    retryAfterSeconds: 0,
  };
}

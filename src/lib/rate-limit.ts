type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimiter = {
  allow: (key: string, now: number) => boolean;
};

export function createRateLimiter(
  limit: number,
  windowMs: number,
  maxBuckets = 1000,
): RateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    allow(key, now) {
      const current = buckets.get(key);
      if (!current || now >= current.resetAt) {
        if (!current && buckets.size >= maxBuckets) {
          const oldest = buckets.keys().next().value;
          if (oldest !== undefined) buckets.delete(oldest);
        }
        if (current) buckets.delete(key);
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (current.count >= limit) return false;
      current.count += 1;
      return true;
    },
  };
}

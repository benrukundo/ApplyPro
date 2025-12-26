// Simple in-memory rate limiter. For production, prefer a shared store like Redis.
const attempts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remainingAttempts: number; resetIn: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (record && now > record.resetTime) {
    attempts.delete(key);
  }

  const current = attempts.get(key);

  if (!current) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, resetIn: windowMs };
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetIn: current.resetTime - now,
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - current.count,
    resetIn: current.resetTime - now,
  };
}

export function resetRateLimit(key: string): void {
  attempts.delete(key);
}

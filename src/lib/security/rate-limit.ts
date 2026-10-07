const store = new Map<string, { tokens: number; lastRefill: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const record = store.get(ip) || { tokens: maxRequests, lastRefill: now };
  
  const elapsed = now - record.lastRefill;
  const refillTokens = Math.floor(elapsed / windowMs) * maxRequests;
  
  if (refillTokens > 0) {
    record.tokens = Math.min(maxRequests, record.tokens + refillTokens);
    record.lastRefill = now;
  }
  
  if (record.tokens > 0) {
    record.tokens--;
    store.set(ip, record);
    return {
      allowed: true,
      remaining: record.tokens,
      resetMs: windowMs - (now - record.lastRefill)
    };
  }
  
  store.set(ip, record);
  return {
    allowed: false,
    remaining: 0,
    resetMs: windowMs - (now - record.lastRefill)
  };
}

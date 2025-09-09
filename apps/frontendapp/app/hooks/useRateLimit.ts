import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [requests, setRequests] = useState<number[]>([]);

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Filter requests within the current window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Update requests array
    setRequests(recentRequests);
    
    return recentRequests.length >= config.maxRequests;
  }, [requests, config]);

  const addRequest = useCallback(() => {
    const now = Date.now();
    setRequests(prev => [...prev.filter(timestamp => timestamp > now - config.windowMs), now]);
  }, [config.windowMs]);

  const getTimeUntilReset = useCallback(() => {
    if (requests.length === 0) return 0;
    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + config.windowMs;
    return Math.max(0, resetTime - Date.now());
  }, [requests, config.windowMs]);

  return { isRateLimited, addRequest, getTimeUntilReset };
};
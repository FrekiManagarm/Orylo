import { redis } from "@/lib/redis";

/**
 * Redis Caching Strategy
 * 
 * Story 3.4 AC2: Redis caching with appropriate TTLs
 * - Trust scores: 1h TTL
 * - Velocity data: 5min TTL
 */

/**
 * Get cached trust score
 * AC2: Trust score cache (1h TTL)
 */
export async function getCachedTrustScore(
  organizationId: string,
  customerId: string
): Promise<number | null> {
  try {
    const key = `trust:${organizationId}:${customerId}`;
    const cached = await redis.get<string>(key);
    return cached ? parseInt(cached, 10) : null;
  } catch (error) {
    // Non-critical - log and return null (fallback to DB)
    console.warn("[Cache] Failed to get trust score from cache:", error);
    return null;
  }
}

/**
 * Set cached trust score
 * AC2: 1h TTL
 */
export async function setCachedTrustScore(
  organizationId: string,
  customerId: string,
  score: number
): Promise<void> {
  try {
    const key = `trust:${organizationId}:${customerId}`;
    await redis.set(key, score.toString(), { ex: 3600 }); // 1h TTL
  } catch (error) {
    // Non-critical - log but don't fail
    console.warn("[Cache] Failed to set trust score in cache:", error);
  }
}

/**
 * Get cached velocity data
 * AC2: Velocity data cache (5min TTL)
 */
export async function getCachedVelocity(
  organizationId: string,
  customerId: string
): Promise<{ count: number; windowStart: number } | null> {
  try {
    const key = `velocity:${organizationId}:${customerId}`;
    const cached = await redis.get<string>(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn("[Cache] Failed to get velocity from cache:", error);
    return null;
  }
}

/**
 * Set cached velocity data
 * AC2: 5min TTL
 */
export async function setCachedVelocity(
  organizationId: string,
  customerId: string,
  data: { count: number; windowStart: number }
): Promise<void> {
  try {
    const key = `velocity:${organizationId}:${customerId}`;
    await redis.set(key, JSON.stringify(data), { ex: 300 }); // 5min TTL
  } catch (error) {
    console.warn("[Cache] Failed to set velocity in cache:", error);
  }
}

/**
 * Invalidate trust score cache
 * Called when trust score is updated (e.g., chargeback, block)
 */
export async function invalidateTrustScoreCache(
  organizationId: string,
  customerId: string
): Promise<void> {
  try {
    const key = `trust:${organizationId}:${customerId}`;
    await redis.del(key);
  } catch (error) {
    console.warn("[Cache] Failed to invalidate trust score cache:", error);
  }
}

/**
 * Invalidate velocity cache
 * Called when new transaction occurs
 */
export async function invalidateVelocityCache(
  organizationId: string,
  customerId: string
): Promise<void> {
  try {
    const key = `velocity:${organizationId}:${customerId}`;
    await redis.del(key);
  } catch (error) {
    console.warn("[Cache] Failed to invalidate velocity cache:", error);
  }
}

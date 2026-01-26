import { redis } from "@/lib/redis";

/**
 * Rule Recommendation Cache
 * 
 * Story 4.3: AC7 - Cache recommendation analysis for performance
 */

/**
 * Get cached recommendations for an organization
 * 
 * @param organizationId - Organization ID
 * @returns Cached recommendations or null
 */
export async function getCachedRecommendations(
  organizationId: string
): Promise<unknown[] | null> {
  try {
    const key = `recommendations:${organizationId}`;
    const cached = await redis.get<unknown[]>(key);
    return cached;
  } catch (error) {
    console.warn("[Cache] Failed to get recommendations from cache:", error);
    return null;
  }
}

/**
 * Set cached recommendations for an organization
 * 
 * @param organizationId - Organization ID
 * @param recommendations - Recommendations to cache
 * @param ttl - Time to live in seconds (default: 24h = 86400)
 */
export async function setCachedRecommendations(
  organizationId: string,
  recommendations: unknown[],
  ttl: number = 86400
): Promise<void> {
  try {
    const key = `recommendations:${organizationId}`;
    await redis.set(key, recommendations, { ex: ttl });
  } catch (error) {
    console.warn("[Cache] Failed to set recommendations in cache:", error);
  }
}

/**
 * Invalidate cached recommendations for an organization
 * 
 * Called when new transactions occur or rules change
 * 
 * @param organizationId - Organization ID
 */
export async function invalidateRecommendationsCache(
  organizationId: string
): Promise<void> {
  try {
    const key = `recommendations:${organizationId}`;
    await redis.del(key);
  } catch (error) {
    console.warn("[Cache] Failed to invalidate recommendations cache:", error);
  }
}

import { redis } from "@/lib/redis";
import type { AISuggestion } from "./suggestion-engine";

/**
 * Suggestion Cache
 * 
 * Story 4.1: AC7 - Cache suggestion results for performance
 */

/**
 * Get cached suggestion for a detection
 * 
 * @param detectionId - Detection ID
 * @returns Cached suggestion or null
 */
export async function getCachedSuggestion(
  detectionId: string
): Promise<AISuggestion | null> {
  try {
    const key = `suggestion:${detectionId}`;
    const cached = await redis.get<AISuggestion>(key);
    return cached;
  } catch (error) {
    console.warn("[Cache] Failed to get suggestion from cache:", error);
    return null;
  }
}

/**
 * Set cached suggestion for a detection
 * 
 * @param detectionId - Detection ID
 * @param suggestion - Suggestion to cache
 * @param ttl - Time to live in seconds (default: 1h = 3600)
 */
export async function setCachedSuggestion(
  detectionId: string,
  suggestion: AISuggestion,
  ttl: number = 3600
): Promise<void> {
  try {
    const key = `suggestion:${detectionId}`;
    await redis.set(key, suggestion, { ex: ttl });
  } catch (error) {
    console.warn("[Cache] Failed to set suggestion in cache:", error);
  }
}

/**
 * Invalidate cached suggestion for a detection
 * 
 * Called when suggestion is accepted/rejected or new transaction occurs
 * 
 * @param detectionId - Detection ID
 */
export async function invalidateSuggestionCache(
  detectionId: string
): Promise<void> {
  try {
    const key = `suggestion:${detectionId}`;
    await redis.del(key);
  } catch (error) {
    console.warn("[Cache] Failed to invalidate suggestion cache:", error);
  }
}

/**
 * Invalidate pattern cache for a customer
 * 
 * Called when new transaction occurs or customer status changes
 * 
 * @param customerId - Customer ID (Stripe ID) or customerEmail
 */
export async function invalidatePatternCache(
  customerId: string | null,
  customerEmail: string | null
): Promise<void> {
  try {
    if (customerId) {
      const key = `pattern:${customerId}`;
      await redis.del(key);
    }
    if (customerEmail) {
      const key = `pattern:email:${customerEmail}`;
      await redis.del(key);
    }
  } catch (error) {
    console.warn("[Cache] Failed to invalidate pattern cache:", error);
  }
}

import { redis } from "@/lib/redis";
import { createHash } from "node:crypto";
import type { DetectorResult } from "@orylo/fraud-engine";

/**
 * Explanation Cache
 * 
 * Story 4.2: AC8 - Cache similar detections (same detector pattern) → reuse explanation
 * 
 * Cache Key Pattern: `explanation:pattern:{detectorIdsHash}`
 */

/**
 * Generate hash of detector IDs for cache key
 */
function hashDetectorPattern(detectorResults: DetectorResult[]): string {
  // Sort detector IDs to ensure consistent hash
  const detectorIds = detectorResults
    .map((d) => d.detectorId)
    .sort()
    .join(",");
  
  return createHash("sha256").update(detectorIds).digest("hex").substring(0, 16);
}

/**
 * Get cached explanation for similar detection pattern
 * 
 * @param detectorResults - Detector results to match pattern
 * @returns Cached explanation or null
 */
export async function getCachedExplanation(
  detectorResults: DetectorResult[]
): Promise<string | null> {
  try {
    const patternHash = hashDetectorPattern(detectorResults);
    const key = `explanation:pattern:${patternHash}`;
    const cached = await redis.get<string>(key);
    return cached;
  } catch (error) {
    console.warn("[Cache] Failed to get explanation from cache:", error);
    return null;
  }
}

/**
 * Set cached explanation for detection pattern
 * 
 * @param detectorResults - Detector results
 * @param explanation - Explanation to cache
 * @param ttl - Time to live in seconds (default: 24h = 86400)
 */
export async function setCachedExplanation(
  detectorResults: DetectorResult[],
  explanation: string,
  ttl: number = 86400
): Promise<void> {
  try {
    const patternHash = hashDetectorPattern(detectorResults);
    const key = `explanation:pattern:${patternHash}`;
    await redis.set(key, explanation, { ex: ttl });
  } catch (error) {
    console.warn("[Cache] Failed to set explanation in cache:", error);
  }
}

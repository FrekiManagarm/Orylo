import { Redis } from "@upstash/redis";

/**
 * Redis Client - Upstash Serverless Redis
 * 
 * Used for:
 * - Velocity tracking (transaction counts)
 * - Trust scores caching
 * - Session data
 * 
 * @see https://docs.upstash.com/redis
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { sql } from "drizzle-orm";

/**
 * GET /api/health
 * 
 * Health Check Endpoint
 * Story 3.3 AC7: Check database and Redis connectivity
 * 
 * Returns 200 if all services healthy, 503 if any service down
 */
export async function GET() {
  const checks = {
    database: false,
    redis: false,
  };

  // Check database connection with timeout
  try {
    const dbPromise = db.execute(sql`SELECT 1`);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000)
    );

    await Promise.race([dbPromise, timeoutPromise]);
    checks.database = true;
  } catch (error) {
    console.error("[Health] Database check failed:", error);
  }

  // Check Redis connection with timeout
  try {
    const redisPromise = redis.ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Redis timeout")), 5000)
    );

    await Promise.race([redisPromise, timeoutPromise]);
    checks.redis = true;
  } catch (error) {
    console.error("[Health] Redis check failed:", error);
  }

  const allHealthy = checks.database && checks.redis;
  const status = allHealthy ? 200 : 503;

  return Response.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    },
    { status }
  );
}

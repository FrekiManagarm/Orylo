import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { lt } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * Data Retention Cron Job
 * 
 * Story 3.5 AC1: Delete fraud detections older than 90 days (GDPR compliance)
 * 
 * Vercel Cron: Runs daily at 2 AM UTC
 * Configured in vercel.json
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sets Authorization header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error("CRON_SECRET not configured");
    return new Response("Cron secret not configured", { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    logger.warn("Unauthorized cron request", {
      ip: request.headers.get("x-forwarded-for"),
    });
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // AC1: Delete fraud detections older than 90 days (GDPR compliance)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await db
      .delete(fraudDetections)
      .where(lt(fraudDetections.createdAt, ninetyDaysAgo))
      .returning({ id: fraudDetections.id });

    logger.info("Data retention job completed", {
      deletedCount: deleted.length,
      cutoffDate: ninetyDaysAgo.toISOString(),
    });

    return Response.json({
      success: true,
      deletedCount: deleted.length,
      cutoffDate: ninetyDaysAgo.toISOString(),
    });
  } catch (error) {
    logger.error("Data retention job failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return Response.json(
      { success: false, error: "Failed to delete records" },
      { status: 500 }
    );
  }
}

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and, gte, desc } from "drizzle-orm";

/**
 * GET /api/events
 * 
 * Story 2.10 - Server-Sent Events (SSE) Real-Time Updates
 * ADR-008: Real-Time Updates Strategy (Polling-based SSE)
 * 
 * Security (from Dev Notes):
 * - AC3: Requires Better Auth session
 * - AC4: Filters events by organizationId (multi-tenancy)
 * - Returns 401 if unauthorized
 * 
 * Features:
 * - AC1: SSE stream endpoint
 * - AC2: Event types: detection.created, detection.updated
 * - AC5: Auto-reconnect support (EventSource built-in)
 * - AC9: Heartbeat every 30s
 * - ADR-008: Poll DB every 5s for new detections (backend polling strategy)
 * 
 * TODO (Epic 3):
 * - AC8: Rate limiting (max 100 concurrent connections)
 */
export async function GET(request: Request) {
  try {
    // AC3: Verify Better Auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const organization = await auth.api.getFullOrganization({
      headers: request.headers,
    });

    // AC4: Extract organizationId for multi-tenancy

    if (!organization) {
      return new Response("Organization ID not found", { status: 400 });
    }

    // AC1: Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        controller.enqueue(
          encoder.encode(
            `event: connected\ndata: ${JSON.stringify({ id: organization.id, name: organization.name })}\n\n`
          )
        );

        // ADR-008: Poll DB every 5s for new detections (backend polling strategy)
        // Initialize lastCheck to now to avoid sending historical detections on first poll
        let lastCheck = Date.now();
        let lastHeartbeat = Date.now();

        const pollInterval = setInterval(async () => {
          try {
            const pollStartTime = Date.now();

            // Poll for new detections since last check
            const newDetections = await db
              .select()
              .from(fraudDetections)
              .where(
                and(
                  eq(fraudDetections.organizationId, organization.id),
                  gte(fraudDetections.createdAt, new Date(lastCheck))
                )
              )
              .orderBy(desc(fraudDetections.createdAt))
              .limit(50);

            // AC2: Send detection.created events for new detections
            for (const detection of newDetections) {
              controller.enqueue(
                encoder.encode(
                  `event: detection.created\ndata: ${JSON.stringify({
                    id: detection.id,
                    paymentIntentId: detection.paymentIntentId,
                    customerEmail: detection.customerEmail,
                    amount: detection.amount,
                    currency: detection.currency,
                    decision: detection.decision,
                    score: detection.score,
                    createdAt: detection.createdAt.toISOString(),
                  })}\n\n`
                )
              );
            }

            // Update last check time after poll (to avoid duplicates)
            lastCheck = pollStartTime;

            // AC9: Heartbeat every 30s to keep connection alive
            const now = Date.now();
            if (now - lastHeartbeat >= 30000) {
              controller.enqueue(encoder.encode(": ping\n\n"));
              lastHeartbeat = now;
            }
          } catch (error) {
            console.error("[SSE] Poll error:", error);
            // Don't close connection on error, just log it
          }
        }, 5000); // Poll every 5s (ADR-008)

        // Cleanup on connection close
        request.signal.addEventListener("abort", () => {
          clearInterval(pollInterval);
        });
      },
    });

    // AC1: Return SSE response with proper headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (err) {
    console.error("SSE endpoint error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

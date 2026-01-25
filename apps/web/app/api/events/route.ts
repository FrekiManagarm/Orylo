import { auth } from "@/lib/auth";

/**
 * GET /api/events
 * 
 * Story 2.10 - Server-Sent Events (SSE) Real-Time Updates
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
 * 
 * TODO (Epic 3):
 * - AC8: Rate limiting (max 100 concurrent connections)
 * - Integrate with event emitter for webhook-triggered events
 * - Connect to fraud detection webhook processing
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

    // AC4: Extract organizationId for multi-tenancy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organizationId = (session.user as any).organizationId as string | undefined;

    if (!organizationId) {
      return new Response("Organization ID not found", { status: 400 });
    }

    // AC1: Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        controller.enqueue(
          encoder.encode(
            `event: connected\ndata: ${JSON.stringify({ organizationId })}\n\n`
          )
        );

        // AC9: Heartbeat to keep connection alive (every 30s)
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // TODO (Epic 3): Listen for detection events from webhook processing
        // Example implementation:
        // eventEmitter.on(`detection.created:${organizationId}`, (detection) => {
        //   controller.enqueue(
        //     encoder.encode(
        //       `event: detection.created\ndata: ${JSON.stringify(detection)}\n\n`
        //     )
        //   );
        // });
        //
        // eventEmitter.on(`detection.updated:${organizationId}`, (detection) => {
        //   controller.enqueue(
        //     encoder.encode(
        //       `event: detection.updated\ndata: ${JSON.stringify(detection)}\n\n`
        //     )
        //   );
        // });

        // Cleanup on connection close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeatInterval);
          // TODO (Epic 3): Remove event listeners
          // eventEmitter.off(`detection.created:${organizationId}`, handler);
          // eventEmitter.off(`detection.updated:${organizationId}`, handler);
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

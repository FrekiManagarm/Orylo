import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentProcessorsConnections } from "@orylo/database";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { processStripeWebhook } from "@/lib/webhook-handler";
import { processWebhookWithRetry } from "@/lib/webhook-processor";
import { webhookEvents } from "@orylo/database";
import { logger } from "@/lib/logger";

/**
 * POST /api/webhooks/stripe/[accountId]
 *
 * Per-account Stripe webhook endpoint.
 * Account ID in URL → direct org lookup, no need for event.account or metadata.
 *
 * Used when setupWebhooks creates endpoints with URL .../stripe/acct_xxx
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const startTime = Date.now();
  const { accountId } = await params;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    // Get webhook secret for this account from connection
    const connection = await db.query.paymentProcessorsConnections.findFirst({
      where: eq(paymentProcessorsConnections.accountId, accountId),
      columns: { webhookSecret: true, organizationId: true },
    });

    if (!connection?.webhookSecret) {
      logger.warn("No webhook secret for account", { accountId });
      return NextResponse.json({ error: "Unknown account" }, { status: 404 });
    }

    const webhookSecret = decrypt(connection.webhookSecret);

    const result = await processStripeWebhook({
      body,
      signature,
      webhookSecret,
      accountIdFromUrl: accountId,
    });

    if (!result.ok) {
      if (result.status === 400) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { event, organizationId } = result;

    await db.insert(webhookEvents).values({
      stripeEventId: event.id,
      type: event.type,
      organizationId,
      processed: false,
      retryCount: 0,
    });

    void processWebhookWithRetry(event, organizationId);

    const duration = Date.now() - startTime;
    logger.info("Webhook received and queued for processing", {
      eventId: event.id,
      eventType: event.type,
      accountId,
      responseTimeMs: duration,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Webhook processing error", {
      error: error instanceof Error ? error.message : "Unknown error",
      accountId,
      responseTimeMs: responseTime,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { db } from "@/lib/db";
import { webhookEvents, deadLetterQueue } from "@orylo/database";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import type { DetectionContext } from "@orylo/fraud-engine";
import { createOrganizationId, createPaymentIntentId } from "@orylo/fraud-engine";
import { detectFraud } from "@/lib/fraud/detect-fraud";
import { applyChargebackPenalty } from "@/lib/trust-score-updater";
import { stripe } from "@/lib/stripe";
import { trackWebhookProcessed } from "@/lib/posthog";
import { logger } from "@/lib/logger";

/**
 * Webhook Processor with Retry Logic and Dead Letter Queue
 * 
 * AC4: Retry logic with exponential backoff (3 attempts: 1s, 2s, 4s)
 * AC5: Dead letter queue for failed events after max retries
 * AC3: Atomic transaction for processing state updates
 */

const MAX_RETRIES = 3;

/**
 * Extract organization ID from Stripe event
 */
function getOrgIdFromEvent(event: Stripe.Event): string | null {
  // Try to get from event.account (connected account)
  if (event.account) {
    // In production, this would query organizations table by stripeAccountId
    // For now, we'll extract from metadata if available
    return null; // Will be handled by caller
  }

  // Try metadata
  if (event.data?.object && "metadata" in event.data.object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata = (event.data.object as any).metadata;
    if (metadata?.organizationId) {
      return metadata.organizationId;
    }
  }

  return null;
}

/**
 * Build DetectionContext from Stripe event
 */
function buildDetectionContext(
  event: Stripe.Event,
  organizationId: string
): DetectionContext {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  return {
    organizationId: createOrganizationId(organizationId),
    paymentIntentId: createPaymentIntentId(paymentIntent.id),
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customerEmail: null, // TODO: Get from Stripe customer lookup
    customerIp: paymentIntent.metadata?.customer_ip || null,
    cardCountry: null, // TODO: Get from payment method
    cardLast4: null, // TODO: Get from payment method
    metadata: paymentIntent.metadata || {},
    timestamp: new Date(),
  };
}

/**
 * Process webhook with retry logic and exponential backoff
 * 
 * AC4: Retries up to 3 times with delays: 1s, 2s, 4s
 * AC3: Atomic transaction for marking as processed
 * AC5: Saves to dead letter queue after max retries
 * AC6: Only processes fraud detection for payment_intent.created
 */
export async function processWebhookWithRetry(
  event: Stripe.Event,
  organizationId: string
): Promise<void> {
  const startTime = Date.now();
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      // AC6: Route events to appropriate handlers
      if (event.type === "payment_intent.created") {
        // Build detection context
        const context = buildDetectionContext(event, organizationId);

        // Call existing detection logic from Story 1.3
        await detectFraud(context);
      } else if (event.type === "charge.dispute.created") {
        // Story 3.2: Handle chargeback
        await handleChargeDispute(event, organizationId);
      } else {
        // For other event types (charge.succeeded, charge.failed), just log
        logger.info(`Event ${event.type} recorded (no processing needed)`, {
          eventId: event.id,
          eventType: event.type,
        });
      }

      // AC3: Mark as processed (atomic transaction)
      await db
        .update(webhookEvents)
        .set({
          processed: true,
          processedAt: new Date(),
          retryCount,
        })
        .where(eq(webhookEvents.stripeEventId, event.id));

      const duration = Date.now() - startTime;
      logger.info(`Successfully processed webhook`, {
        eventId: event.id,
        eventType: event.type,
        duration,
        retryCount,
      });

      // Story 3.3 AC4: Track webhook processed event
      trackWebhookProcessed(organizationId, event.type, duration, retryCount, true);

      return; // Success - exit retry loop
    } catch (error) {
      retryCount++;

      // Update retry count in database
      await db
        .update(webhookEvents)
        .set({ retryCount })
        .where(eq(webhookEvents.stripeEventId, event.id));

      logger.error(`Processing failed`, {
        eventId: event.id,
        attempt: retryCount,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (retryCount <= MAX_RETRIES) {
        // AC4: Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        // AC5: Save to dead letter queue after 3 retries
        await saveToDeadLetterQueue(event, error as Error, retryCount, organizationId);

        // Track failed webhook
        const duration = Date.now() - startTime;
        trackWebhookProcessed(organizationId, event.type, duration, retryCount, false);
      }
    }
  }
}

/**
 * Handle charge.dispute.created event
 * 
 * Story 3.2: Apply chargeback penalty to trust score
 */
async function handleChargeDispute(
  event: Stripe.Event,
  organizationId: string
): Promise<void> {
  const dispute = event.data.object as Stripe.Dispute;
  const customerId = dispute.customer as string;
  const chargeId = dispute.charge as string;

  if (!customerId) {
    console.error(`[Chargeback] No customerId found in dispute ${dispute.id}`);
    return;
  }

  // Get organizationId from charge metadata (if not already provided)
  let finalOrgId = organizationId;
  if (!finalOrgId && chargeId) {
    try {
      const charge = await stripe.charges.retrieve(chargeId);
      if (charge.metadata?.organizationId) {
        finalOrgId = charge.metadata.organizationId;
      }
    } catch (error) {
      console.error(`[Chargeback] Failed to retrieve charge ${chargeId}:`, error);
    }
  }

  if (!finalOrgId) {
    console.error(`[Chargeback] No organizationId found for charge ${chargeId}`);
    return;
  }

  // Apply penalty
  await applyChargebackPenalty(customerId, finalOrgId);
}

/**
 * Save failed event to dead letter queue
 * 
 * AC5: Stores event payload, error details, and retry count
 */
async function saveToDeadLetterQueue(
  event: Stripe.Event,
  error: Error,
  retryCount: number,
  organizationId: string
): Promise<void> {
  try {
    await db.insert(deadLetterQueue).values({
      stripeEventId: event.id,
      eventType: event.type,
      payload: event as any, // Full Stripe event (JSON field)
      errorMessage: error.message,
      errorStack: error.stack || null,
      retryCount,
      organizationId,
    });

    console.error(`[DLQ] Event moved to dead letter queue: ${event.id}`);
  } catch (dlqError) {
    // If DLQ save fails, log but don't throw (we've already failed)
    console.error(`[DLQ] Failed to save to DLQ:`, dlqError);
  }
}

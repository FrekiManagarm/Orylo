import { NextRequest, NextResponse } from "next/server";
import { stripe, webhookSecret } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organizations } from "@orylo/database";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * 
 * Stripe Webhook Handler
 * - AC1: Webhook endpoint
 * - AC2: Signature verification
 * - AC3: Filter payment_intent.created events
 * - AC4: Extract payment data
 * - AC5: Async fraud detection
 * - AC6: Response <2s
 * - AC7: Error handling (400/500)
 * - AC8: Logging
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // AC2: Extract raw body and signature for verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("[stripe_webhook] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // AC2: Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe_webhook_signature_invalid]", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      // AC7: Return 400 for invalid signature
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // AC8: Log webhook received
    console.info("[stripe_webhook_received]", {
      eventId: event.id,
      eventType: event.type,
      timestamp: new Date().toISOString(),
    });

    // AC3: Filter - only process payment_intent.created
    if (event.type !== "payment_intent.created") {
      console.info("[stripe_webhook_ignored]", {
        eventId: event.id,
        eventType: event.type,
        reason: "Not payment_intent.created",
      });
      // Return 200 OK for other event types (Stripe doesn't retry)
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // AC4: Extract payment intent data
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // AC4: Extract required fields
    const paymentData = {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer as string | null,
      metadata: paymentIntent.metadata || {},
      status: paymentIntent.status,
      created: paymentIntent.created,
    };

    // Validate required fields
    if (!paymentData.amount || !paymentData.currency) {
      console.error("[stripe_webhook_missing_field]", {
        eventId: event.id,
        paymentIntentId: paymentData.paymentIntentId,
        missingFields: {
          amount: !paymentData.amount,
          currency: !paymentData.currency,
        },
      });
      // AC7: Return 500 for missing required fields (Stripe will retry)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 500 }
      );
    }

    // Get organization ID from Stripe account
    // Note: In production, you'd get this from the connected account
    // For now, we'll use a simpler approach
    const stripeAccountId = event.account as string | null;
    let organizationId: string | null = null;

    if (stripeAccountId) {
      // Query organization by Stripe account ID
      const orgs = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.stripeAccountId, stripeAccountId))
        .limit(1);

      organizationId = orgs[0]?.id || null;
    }

    if (!organizationId) {
      console.warn("[stripe_webhook_no_org]", {
        eventId: event.id,
        stripeAccountId,
        message: "No organization found for Stripe account",
      });
      // Still return 200 OK (we received the webhook successfully)
      // But don't process fraud detection without an org
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // AC5: Trigger fraud detection asynchronously (fire-and-forget)
    // Don't await - let it run in background
    void processFraudDetection({
      organizationId,
      paymentIntentId: paymentData.paymentIntentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      customerId: paymentData.customerId,
      metadata: paymentData.metadata,
      eventId: event.id,
    });

    // AC6: Return 200 OK immediately (response time <2s)
    const responseTime = Date.now() - startTime;
    console.info("[stripe_webhook_success]", {
      eventId: event.id,
      paymentIntentId: paymentData.paymentIntentId,
      responseTimeMs: responseTime,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // AC7: Return 500 for internal errors (Stripe will retry)
    const responseTime = Date.now() - startTime;
    console.error("[stripe_webhook_error]", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTimeMs: responseTime,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Async Fraud Detection Processing
 * 
 * AC5: Runs in background, doesn't block webhook response
 * Builds FraudDetectionContext and triggers detection engine
 */
async function processFraudDetection(data: {
  organizationId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  customerId: string | null;
  metadata: Record<string, string>;
  eventId: string;
}) {
  try {
    console.info("[fraud_detection_triggered]", {
      eventId: data.eventId,
      organizationId: data.organizationId,
      paymentIntentId: data.paymentIntentId,
    });

    // Story 1.3: Call fraud detection orchestrator
    const { detectFraud } = await import("@/lib/fraud/detect-fraud");
    const { OrganizationIdSchema, PaymentIntentIdSchema } = await import(
      "@orylo/fraud-engine"
    );

    // Build FraudDetectionContext
    const context = {
      organizationId: OrganizationIdSchema.parse(data.organizationId),
      paymentIntentId: PaymentIntentIdSchema.parse(data.paymentIntentId),
      amount: data.amount,
      currency: data.currency,
      customerEmail: null, // TODO: Get from Stripe customer lookup (Story 1.4+)
      customerIp: data.metadata.customer_ip || null,
      cardCountry: null, // TODO: Get from payment method (Story 1.4+)
      cardLast4: null, // TODO: Get from payment method (Story 1.4+)
      metadata: data.metadata,
      timestamp: new Date(),
    };

    // Run fraud detection
    const result = await detectFraud(context);

    console.info("[fraud_detection_completed]", {
      eventId: data.eventId,
      paymentIntentId: data.paymentIntentId,
      decision: result.decision,
      riskScore: result.riskScore,
      latencyMs: result.latencyMs,
    });

    // Story 1.6: Update trust score async (AC6)
    // Fire-and-forget: don't await, don't block webhook response
    if (data.customerId && result.decision === "ALLOW") {
      const { updateTrustScore } = await import("@/lib/fraud/trust-score");
      void updateTrustScore(
        data.organizationId,
        data.customerId,
        "successful_payment"
      );
    }
  } catch (error) {
    // AC5: Detection errors don't affect webhook response
    console.error("[fraud_detection_error]", {
      eventId: data.eventId,
      paymentIntentId: data.paymentIntentId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

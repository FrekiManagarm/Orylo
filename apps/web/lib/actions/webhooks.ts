import Stripe from "stripe";
import { db } from "@/lib/db";
import { paymentProcessorsConnections } from "@orylo/database";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

/**
 * Setup webhook endpoint on connected Stripe account
 */
export async function setupWebhooks(
  stripeAccountId: string,
  accessToken: string,
  organizationId: string,
): Promise<{ webhookEndpointId: string; webhookSecret: string } | null> {
  try {
    // URL utilisée pour les webhooks (reste spécifique au compte pour le routage)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";
    const webhookUrl = `${baseUrl}/api/webhooks/stripe/${stripeAccountId}`;

    // En développement local, skip la création du webhook
    // Utiliser Stripe CLI à la place : stripe listen --forward-to localhost:3000/api/webhooks/stripe/{accountId}
    if (
      baseUrl.includes("localhost") ||
      baseUrl.includes("127.0.0.1") ||
      baseUrl.startsWith("http://")
    ) {
      console.warn(
        `⚠️ Skipping webhook creation for local development (${baseUrl})`,
      );
      console.warn(
        `💡 Use Stripe CLI to test webhooks locally:`,
      );
      console.warn(
        `   stripe listen --forward-to ${baseUrl}/api/webhooks/stripe/${stripeAccountId}`,
      );

      // Retourner des valeurs temporaires pour le développement local
      await db
        .update(paymentProcessorsConnections)
        .set({
          webhookSecret: encrypt("whsec_local_dev_secret"),
          lastSyncAt: new Date(),
        })
        .where(eq(paymentProcessorsConnections.accountId, stripeAccountId));

      return {
        webhookEndpointId: "local_dev_webhook",
        webhookSecret: "whsec_local_dev_secret",
      };
    }

    console.log(`🔗 Setting up Connect webhook for account ${stripeAccountId}`);

    // Créer un webhook Connect au niveau plateforme
    // (Les comptes Standard ne permettent pas de créer des webhooks directement)
    const platformStripe = new Stripe(accessToken, {
      apiVersion: "2025-12-15.clover",
    });

    const webhookEndpoint = await platformStripe.webhookEndpoints.create({
      url: webhookUrl,
      connect: true, // Recevoir les événements des comptes connectés
      enabled_events: [
        'payment_intent.created',        // 🎯 Principal : détection précoce
        'payment_intent.succeeded',      // Pour remboursement si trop tard
        'payment_intent.payment_failed', // Analyse des échecs
        'charge.dispute.created',        // Chargeback = fraude confirmée
        'customer.created',               // Création d'un nouveau client
        'charge.refund.updated',         // Suivi des remboursements
        'checkout.session.completed',    // Card testing detection
        'checkout.session.expired',      // Card testing detection
        'checkout.session.async_payment_succeeded', // Card testing detection
      ],
      description: `Orylo Fraud Shield - Connect (${stripeAccountId})`,
    }, {
      stripeAccount: stripeAccountId,
    });

    console.log(
      `✅ Platform-level Connect webhook created: ${webhookEndpoint.id} for account ${stripeAccountId}`,
    );

    await db
      .update(paymentProcessorsConnections)
      .set({
        webhookSecret: encrypt(webhookEndpoint.secret!),
        lastSyncAt: new Date(),
      })
      .where(eq(paymentProcessorsConnections.accountId, stripeAccountId));

    return {
      webhookEndpointId: webhookEndpoint.id,
      webhookSecret: webhookEndpoint.secret!,
    };
  } catch (error) {
    console.error(
      `❌ Error setting up webhooks for account ${stripeAccountId}:`,
      error,
    );
    return null;
  }
}

/**
 * Delete webhook endpoint (Connect webhook at platform level)
 */
export async function deleteWebhooks(
  stripeAccountId: string,
  accessToken: string,
  webhookEndpointId: string,
): Promise<boolean> {
  try {
    // Les webhooks Connect sont gérés au niveau plateforme (pas de stripeAccount)
    const stripe = new Stripe(accessToken, {
      apiVersion: "2025-12-15.clover",
    });

    await stripe.webhookEndpoints.del(webhookEndpointId, {
      stripeAccount: stripeAccountId,
    });

    console.log(
      `✅ Deleted Connect webhook endpoint ${webhookEndpointId} for account ${stripeAccountId}`,
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Error deleting webhook endpoint ${webhookEndpointId}:`,
      error,
    );
    return false;
  }
}

/**
 * Update webhook endpoint events (Connect webhook at platform level)
 */
export async function updateWebhookEvents(
  accessToken: string,
  webhookEndpointId: string,
  stripeAccountId: string,
  events: string[],
): Promise<boolean> {
  try {
    // Les webhooks Connect sont gérés au niveau plateforme (pas de stripeAccount)
    const stripe = new Stripe(accessToken, {
      apiVersion: "2025-12-15.clover",
    });

    await stripe.webhookEndpoints.update(webhookEndpointId, {
      enabled_events: events as any,
    }, {
      stripeAccount: stripeAccountId,
    });

    console.log(
      `✅ Updated Connect webhook endpoint ${webhookEndpointId} events`,
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Error updating webhook endpoint ${webhookEndpointId}:`,
      error,
    );
    return false;
  }
}

/**
 * List all Connect webhook endpoints at platform level
 */
export async function listWebhooks(
  accessToken: string,
  stripeAccountId: string,
): Promise<Stripe.WebhookEndpoint[]> {
  try {
    // Les webhooks Connect sont gérés au niveau plateforme (pas de stripeAccount)
    const stripe = new Stripe(accessToken, {
      apiVersion: "2025-12-15.clover",
    });

    // Lister tous les webhooks Connect (filtrer côté client si nécessaire)
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 }, {
      stripeAccount: stripeAccountId,
    });
    return endpoints.data.filter((endpoint) => endpoint.url?.includes(stripeAccountId));
  } catch (error) {
    console.error("❌ Error listing webhook endpoints:", error);
    return [];
  }
}

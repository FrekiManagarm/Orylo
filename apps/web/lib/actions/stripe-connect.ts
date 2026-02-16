"use server";

import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { getCurrentOrganization, requireAuthAndOrganization } from "./auth";
import { stripe } from "../stripe";
import { PaymentProcessorsConnections, paymentProcessorsConnections } from "@orylo/database";

/**
 * Disconnect a payment processor connection.
 * For Stripe: deauthorizes the account and removes webhooks.
 * For other processors: marks inactive and deletes the record.
 */
export async function disconnectConnection(connectionId: string) {
  try {
    const isAuthorized = await requireAuthAndOrganization();
    if (!isAuthorized) {
      throw new Error("Unauthorized");
    };

    const organization = await getCurrentOrganization();
    const connection = await db.query.paymentProcessorsConnections.findFirst({
      where: and(eq(paymentProcessorsConnections.organizationId, organization.id), eq(paymentProcessorsConnections.id, connectionId)),
    });

    if (!connection) {
      throw new Error("Connection not found");
    }

    // Stripe-specific: deauthorize and delete webhooks
    if (connection.paymentProcessor === "stripe") {
      try {
        await stripe.oauth.deauthorize({
          client_id: process.env.STRIPE_CONNECT_CLIENT_ID!,
          stripe_user_id: connection.accountId,
        });
      } catch (error) {
        console.warn("Error deauthorizing Stripe account:", error);
      }

      if (connection.webhookEndpointId) {
        try {
          await stripe.webhookEndpoints.del(connection.webhookEndpointId);
          console.log(
            `✅ Deleted Connect webhook ${connection.webhookEndpointId}`,
          );
        } catch (error) {
          console.warn("Error deleting webhook endpoint:", error);
        }
      }
    }

    // Mark connection as inactive
    await db
      .update(paymentProcessorsConnections)
      .set({ isActive: false })
      .where(eq(paymentProcessorsConnections.id, connection.id));

    console.log(
      `✅ Disconnected Stripe account ${connection.accountId} for organization ${organization.id}`,
    );

    await db.delete(paymentProcessorsConnections).where(and(eq(paymentProcessorsConnections.organizationId, organization.id), eq(paymentProcessorsConnections.id, connectionId)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/connections");

    return true;
  } catch (error) {
    console.error("❌ Error disconnecting Stripe:", error);
    throw new Error("Failed to disconnect Stripe account");
  }
}

export async function connectStripeAccount() {
  try {
    // Authenticate user
    const isAuthorized = await requireAuthAndOrganization();
    if (!isAuthorized) {
      throw new Error("Unauthorized");
    }

    const organization = await getCurrentOrganization();
    // Construct Stripe Connect OAuth URL
    const stripeClientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    if (!stripeClientId) {
      throw new Error("STRIPE_CONNECT_CLIENT_ID is not configured");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";
    const redirectUri = `${baseUrl}/api/stripe/callback`;

    const stripeAuthUrl = new URL("https://connect.stripe.com/oauth/authorize");
    stripeAuthUrl.searchParams.set("client_id", stripeClientId);
    stripeAuthUrl.searchParams.set("state", organization.id);
    stripeAuthUrl.searchParams.set("redirect_uri", redirectUri);
    stripeAuthUrl.searchParams.set("response_type", "code");
    stripeAuthUrl.searchParams.set("scope", "read_write");
    stripeAuthUrl.searchParams.set("stripe_user[business_type]", "company");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    const url = stripe.oauth.authorizeUrl({
      client_id: stripeClientId,
      state: organization.id,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "read_write",
      stripe_user: {
        business_type: "company",
      },
    });

    console.log(`🔗 Generated Stripe Connect URL for org ${organization.id}`);

    return {
      url: url.toString(),
    };
  } catch (error) {
    console.error("❌ Error generating Stripe Connect URL:", error);
    return {
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}

export async function getStripeConnection(connectionId: string) {
  const isAuthorized = await requireAuthAndOrganization();
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const organization = await getCurrentOrganization();
  const connection = await db.query.paymentProcessorsConnections.findFirst({
    where: and(eq(paymentProcessorsConnections.organizationId, organization.id), eq(paymentProcessorsConnections.id, connectionId)),
  });

  return connection as PaymentProcessorsConnections;
}

export async function getStripeConnections() {
  const isAuthorized = await requireAuthAndOrganization();
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const organization = await getCurrentOrganization();
  const connections = await db.query.paymentProcessorsConnections.findMany({
    where: eq(paymentProcessorsConnections.organizationId, organization.id),
  });

  return connections;
}
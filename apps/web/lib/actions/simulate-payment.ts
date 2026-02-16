"use server";

import { getStripeClient } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { auth } from "../auth/auth";

/**
 * Simulate a payment intent for testing fraud detection
 */
export async function simulatePaymentIntent(options?: {
  amount?: number;
  email?: string;
  name?: string;
  riskLevel?: "low" | "medium" | "high";
  stripeAccountId?: string;
}) {
  try {
    const organization = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!organization?.id) {
      return { success: false, error: "Organization not found" };
    }

    const organizationId = organization?.id;

    console.log("organization", organization);

    if (!organizationId) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    const stripe = getStripeClient();

    // Generate test data based on risk level
    const riskLevel = options?.riskLevel || "medium";
    const testData = generateTestData(riskLevel);

    // Get base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create checkout session
    // If stripeAccountId is provided, create on connected account
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Test Payment - ${riskLevel} risk`,
              description: `Simulated payment for fraud detection testing`,
            },
            unit_amount: options?.amount || testData.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/transactions?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
      customer_email: options?.email || testData.email,
      metadata: {
        test: "true",
        simulated: "true",
        risk_level: riskLevel,
        organizationId,
      },
      // payment_intent_data ensures metadata flows to PaymentIntent (required for webhook)
      payment_intent_data: {
        metadata: {
          organizationId,
        },
      },
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "DE", "ES", "IT", "NG"],
      },
    };

    // Create session with optional Stripe-Account header
    const session = options?.stripeAccountId
      ? await stripe?.checkout.sessions.create(sessionParams, {
        stripeAccount: options.stripeAccountId,
      })
      : await stripe?.checkout.sessions.create(sessionParams);

    console.log(`✅ Simulated checkout session created: ${session?.id}`);

    return {
      success: true,
      sessionId: session?.id,
      sessionUrl: session?.url,
      amount: options?.amount || testData.amount,
      riskLevel,
    };
  } catch (error) {
    console.error("Error simulating payment:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la simulation du paiement",
    };
  }
}

/**
 * Generate test data based on risk level
 */
function generateTestData(riskLevel: "low" | "medium" | "high") {
  const lowRiskEmails = [
    "client.regulier@example.com",
    "utilisateur.fidele@gmail.com",
    "acheteur.confiance@outlook.com",
  ];

  const mediumRiskEmails = [
    "nouveau.client@tempmail.com",
    "acheteur.occasionnel@yahoo.com",
    "utilisateur.inconnu@mail.com",
  ];

  const highRiskEmails = [
    "suspicious.user@10minutemail.com",
    "fraud.test@guerrillamail.com",
    "test123@mailinator.com",
  ];

  const lowRiskAmounts = [1000, 2500, 5000]; // 10-50€
  const mediumRiskAmounts = [15000, 25000, 50000]; // 150-500€
  const highRiskAmounts = [100000, 250000, 500000]; // 1000-5000€

  let email: string;
  let amount: number;
  let shipping: Stripe.PaymentIntentCreateParams.Shipping;

  switch (riskLevel) {
    case "low":
      email = lowRiskEmails[Math.floor(Math.random() * lowRiskEmails.length)];
      amount =
        lowRiskAmounts[Math.floor(Math.random() * lowRiskAmounts.length)];
      shipping = {
        name: "Jean Dupont",
        address: {
          line1: "123 Rue de la République",
          city: "Paris",
          postal_code: "75001",
          country: "FR",
        },
      };
      break;

    case "high":
      email =
        highRiskEmails[Math.floor(Math.random() * highRiskEmails.length)];
      amount =
        highRiskAmounts[Math.floor(Math.random() * highRiskAmounts.length)];
      shipping = {
        name: "Unknown User",
        address: {
          line1: "123 Suspicious Street",
          city: "Lagos",
          postal_code: "100001",
          country: "NG", // Nigeria - pays à risque élevé
        },
      };
      break;

    case "medium":
    default:
      email =
        mediumRiskEmails[Math.floor(Math.random() * mediumRiskEmails.length)];
      amount =
        mediumRiskAmounts[Math.floor(Math.random() * mediumRiskAmounts.length)];
      shipping = {
        name: "Marie Martin",
        address: {
          line1: "456 Avenue des Champs",
          city: "Lyon",
          postal_code: "69001",
          country: "FR",
        },
      };
      break;
  }

  return { email, amount, shipping };
}

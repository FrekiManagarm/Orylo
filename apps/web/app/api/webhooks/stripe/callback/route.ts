import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { organization, paymentProcessorsConnections } from "@orylo/database";
import { encrypt } from "@/lib/encryption";
import { setupWebhooks } from "@/lib/actions/webhooks";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

  // Handle OAuth errors
  if (error) {
    console.error(`❌ Stripe OAuth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=stripe_connection_failed&reason=${error}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=stripe_connection_failed&reason=missing_params`,
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    console.log(`🔄 Exchanging OAuth code for client ${state}`);

    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    console.log(`✅ Received tokens for Stripe account: ${response.stripe_user_id}`);

    // Encrypt sensitive tokens
    const encryptedAccessToken = encrypt(response.access_token!);
    const encryptedRefreshToken = response.refresh_token
      ? encrypt(response.refresh_token)
      : null;

    // Check if connection already exists for this specific Stripe Account
    const existingConnection = await db.query.paymentProcessorsConnections.findFirst({
      where: (connections, { and, eq }) =>
        and(
          eq(connections.organizationId, state),
          eq(connections.accountId, response.stripe_user_id!),
        ),
    });

    let connectionId: string;

    if (existingConnection) {
      // Update existing connection
      await db
        .update(paymentProcessorsConnections)
        .set({
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken ?? existingConnection.refreshToken,
          scope: response.scope,
          isActive: true,
          lastSyncAt: new Date(),
        })
        .where(eq(paymentProcessorsConnections.id, existingConnection.id));

      connectionId = existingConnection.id;

      revalidatePath(`/dashboard/connections`);

      console.log(
        `✅ Updated existing Stripe connection ${connectionId} for account ${response.stripe_user_id}`,
      );
    } else {
      // Create new connection
      const [newConnection] = await db
        .insert(paymentProcessorsConnections)
        .values({
          organizationId: state as string,
          accountId: response.stripe_user_id!,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken ?? "",
          scope: response.scope!,
          isActive: true,
          paymentProcessor: "stripe",
          livemode: response.livemode!,
          connectedAt: new Date(),
          lastSyncAt: new Date(),
        })
        .returning();

      connectionId = newConnection.id;
      console.log(
        `✅ Created new Stripe connection ${connectionId} for org ${state}`,
      );
    }

    // Setup webhooks on the connected account
    await setupWebhooks(response.stripe_user_id!, response.access_token!, state as string);
    console.log(
      `✅ Webhook setup initiated for account ${response.stripe_user_id}`,
    );

    // Get current organization to check onboarding status
    const [currentOrg] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, state as string))
      .limit(1);

    // Update organization settings with complete configuration
    // If this is the first connection and onboarding not completed, mark it as complete
    await db
      .update(organization)
      .set({
        settings: {
          // Alert preferences
          emailAlerts: true,
          alertSeverityThreshold: "HIGH",
          // Detection settings
          autoBlock: true,
          autoBlockThreshold: 80,
          reviewThreshold: 60,
          blockThreshold: 80,
          require3DSScore: 70,
          whitelistTrustedCustomers: true,
          shadowMode: false,
          // Custom rules
          customRules: [],
          // Notifications
          notifyOnBlock: true,
          notifyOnReview: true,
          dailySummary: false,
        },
        // Complete onboarding if it's not already completed
        ...(currentOrg && !currentOrg.onboardingCompleted
          ? { onboardingCompleted: true }
          : {}),
      })
      .where(eq(organization.id, state as string));

    revalidatePath(`/dashboard/connections`);

    console.log(`✅ Updated organization settings for org ${state}`);

    // Redirect to dashboard/connect with success message (handles both onboarding and settings)
    return NextResponse.redirect(
      `${baseUrl}/dashboard/connections?success=stripe_connected`,
    );
  } catch (error) {
    console.error("❌ Error processing Stripe OAuth callback:", error);

    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=stripe_connection_failed&reason=server_error`,
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";

/**
 * GET /api/stripe/callback
 * 
 * Handles Stripe OAuth callback
 * - Verifies CSRF state parameter
 * - Exchanges authorization code for access token (AC3)
 * - Stores stripe_account_id in organizations table (AC3)
 * - Handles errors with user-friendly messages (AC5)
 */
const baseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    // Validate Better Auth session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect(
        `${baseUrl()}/login?error=unauthorized`
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors from Stripe

    if (error) {
      console.error("Stripe OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        `${baseUrl()}/dashboard/connect?error=${encodeURIComponent("Failed to connect Stripe. Please try again.")}`
      );
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get("stripe_oauth_state")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        `${baseUrl()}/dashboard/connect?error=${encodeURIComponent("Connection expired. Please restart the process.")}`
      );
    }

    // Verify authorization code exists
    if (!code) {
      return NextResponse.redirect(
        `${baseUrl()}/dashboard/connect?error=${encodeURIComponent("Failed to connect Stripe. Please try again.")}`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_secret: process.env.STRIPE_SECRET_KEY!,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Stripe token exchange error:", errorData);

      // AC5: User-friendly error messages
      let errorMessage = "Failed to connect Stripe. Please try again.";
      if (errorData.error === "invalid_grant") {
        errorMessage = "Connection expired. Please restart the process.";
      }

      return NextResponse.redirect(
        `${baseUrl()}/dashboard/connect?error=${encodeURIComponent(errorMessage)}`
      );
    }

    const tokenData = await tokenResponse.json();
    const stripeAccountId = tokenData.stripe_user_id;

    if (!stripeAccountId) {
      return NextResponse.redirect(
        `${baseUrl()}/dashboard/connect?error=${encodeURIComponent("Failed to connect Stripe. Please try again.")}`
      );
    }

    // AC3 & AC6: Store stripe_account_id in organization table (multi-tenant isolated)
    const fullOrg = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!fullOrg?.id) {
      return NextResponse.redirect(
        `${baseUrl()}/dashboard/connect?error=${encodeURIComponent("No organization found. Please contact support.")}`
      );
    }

    await db
      .update(organization)
      .set({
        stripeAccountId,
        stripeAccessToken: tokenData.access_token ?? null,
        stripeRefreshToken: tokenData.refresh_token ?? null,
        stripeScope: tokenData.scope ?? null,
        stripeConnectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organization.id, fullOrg.id));

    // Clear CSRF state cookie — redirect to connect page for success message
    const response = NextResponse.redirect(
      `${baseUrl()}/dashboard/connect?success=${encodeURIComponent("Stripe connected successfully")}` // AC4
    );
    response.cookies.delete("stripe_oauth_state");

    return response;
  } catch (error) {
    console.error("Stripe OAuth callback error:", error);

    // AC5: Network error handling
    const errorMessage = error instanceof Error
      ? `Network error: ${error.message}`
      : "Network error. Check your internet connection.";
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    return NextResponse.redirect(
      `${baseUrl()}/dashboard/connect?error=${encodeURIComponent(errorMessage)}`
    );
  }
}

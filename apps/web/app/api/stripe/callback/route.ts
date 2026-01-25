import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { organizations } from "@orylo/database";
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
export async function GET(request: NextRequest) {
  try {
    // Validate Better Auth session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=unauthorized`
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent("Failed to connect Stripe. Please try again.")}`
      );
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get("stripe_oauth_state")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent("Connection expired. Please restart the process.")}`
      );
    }

    // Verify authorization code exists
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent("Failed to connect Stripe. Please try again.")}`
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent(errorMessage)}`
      );
    }

    const tokenData = await tokenResponse.json();
    const stripeAccountId = tokenData.stripe_user_id;

    if (!stripeAccountId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent("Failed to connect Stripe. Please try again.")}`
      );
    }

    // AC3 & AC6: Store stripe_account_id in organizations table (multi-tenant isolated)
    // Get active organization from session
    // Note: In Better Auth with organization plugin, the active org is stored in session metadata
    // For this implementation, we'll use the first organization or require explicit org selection
    // TODO: In production, get from session.activeOrganization or implement org selector UI
    
    // For now, we'll get the user's primary organization
    // This is a simplified approach for MVP - production should have explicit org selection
    // Better Auth organization plugin stores org in session.user.organizationId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organizationId = (session.user as any).organizationId as string | undefined;
    
    if (!organizationId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent("No organization found. Please contact support.")}`
      );
    }

    // Update organization with Stripe account ID
    await db
      .update(organizations)
      .set({
        stripeAccountId,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    // Clear CSRF state cookie
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=${encodeURIComponent("Stripe connected successfully")}` // AC4
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
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent(errorMessage)}`
    );
  }
}

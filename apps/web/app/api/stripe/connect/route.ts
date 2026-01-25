import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/stripe/connect
 * 
 * Initiates Stripe OAuth flow
 * - Validates Better Auth session (AC7)
 * - Generates Stripe OAuth URL with CSRF protection
 * - Redirects to Stripe consent screen (AC2)
 */
export async function GET() {
  try {
    // AC7: Validate Better Auth session before OAuth redirect
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    // Generate CSRF state parameter
    const state = crypto.randomUUID();
    
    // Store state in session for verification in callback
    // Note: In production, store in Redis or encrypted cookie
    // For now, we'll pass it through and verify in callback
    
    // Build Stripe OAuth URL (AC1, AC2)
    const stripeClientId = process.env.STRIPE_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/stripe/callback`;

    if (!stripeClientId) {
      return NextResponse.json(
        { error: "Stripe client ID not configured" },
        { status: 500 }
      );
    }

    const stripeOAuthUrl = new URL("https://connect.stripe.com/oauth/authorize");
    stripeOAuthUrl.searchParams.set("client_id", stripeClientId);
    stripeOAuthUrl.searchParams.set("redirect_uri", redirectUri);
    stripeOAuthUrl.searchParams.set("response_type", "code");
    stripeOAuthUrl.searchParams.set("scope", "read_only"); // AC2: read-only scope
    stripeOAuthUrl.searchParams.set("state", state);

    // Store state in cookie for CSRF verification
    const response = NextResponse.redirect(stripeOAuthUrl.toString());
    response.cookies.set("stripe_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Stripe OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Stripe connection" },
      { status: 500 }
    );
  }
}

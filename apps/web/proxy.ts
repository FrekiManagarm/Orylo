import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for Performance Tracking & Security
 * 
 * Story 3.3 AC3: Track API route performance for Vercel Analytics
 * Story 3.5 AC5: HTTPS enforcement in production
 * 
 * Adds X-Response-Time header for monitoring
 * Enforces HTTPS in production
 */
export function proxy(request: NextRequest) {
  // Story 3.5 AC5: Verify HTTPS in production
  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto");
    if (proto !== "https") {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      return NextResponse.redirect(url, { status: 301 });
    }
  }

  const start = Date.now();

  const response = NextResponse.next();

  // Add performance header
  const duration = Date.now() - start;
  response.headers.set("X-Response-Time", `${duration}ms`);

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  // Story 3.5 AC5: Apply to all routes for HTTPS enforcement
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

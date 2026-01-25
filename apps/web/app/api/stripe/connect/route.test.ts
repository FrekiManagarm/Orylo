import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "@/lib/auth";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

describe("GET /api/stripe/connect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_CLIENT_ID = "ca_test_123";
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  it("should generate valid OAuth URL with correct params", async () => {
    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", organizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    const request = new NextRequest("http://localhost:3000/api/stripe/connect");
    const response = await GET(request);

    expect(response.status).toBe(307); // Redirect status
    const location = response.headers.get("location");
    expect(location).toContain("https://connect.stripe.com/oauth/authorize");
    expect(location).toContain("client_id=ca_test_123");
    expect(location).toContain("scope=read_only");
    expect(location).toContain("redirect_uri=");
    expect(location).toContain("state=");
  });

  it("should reject unauthenticated requests (no session)", async () => {
    // Mock no session
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/stripe/connect");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toContain("Unauthorized");
  });

  it("should store state parameter in cookie", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", organizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    const request = new NextRequest("http://localhost:3000/api/stripe/connect");
    const response = await GET(request);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("stripe_oauth_state=");
    expect(setCookie).toContain("HttpOnly");
  });

  it("should return error if STRIPE_CLIENT_ID not configured", async () => {
    delete process.env.STRIPE_CLIENT_ID;

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", organizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    const request = new NextRequest("http://localhost:3000/api/stripe/connect");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain("Stripe client ID not configured");
  });
});

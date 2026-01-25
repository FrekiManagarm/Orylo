import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Session } from "@/lib/auth";

// Mock modules
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

// Mock global fetch
global.fetch = vi.fn();

describe("GET /api/stripe/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
  });

  it("should validate state parameter (CSRF protection)", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", activeOrganizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    // Request with mismatched state
    const request = new NextRequest(
      "http://localhost:3000/api/stripe/callback?code=auth_code&state=wrong_state"
    );
    // Mock cookie with different state
    Object.defineProperty(request, "cookies", {
      value: {
        get: vi.fn(() => ({ value: "correct_state" })),
      },
      writable: true,
    });

    const response = await GET(request);

    expect(response.status).toBe(307); // Redirect
    const location = response.headers.get("location");
    expect(location).toContain("error=");
    expect(location).toContain("Connection%20expired");
  });

  it("should exchange code for access token successfully", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", activeOrganizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    // Mock Stripe API response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        stripe_user_id: "acct_test123",
        access_token: "sk_test_token",
      }),
    } as Response);

    const state = "test_state_123";
    const request = new NextRequest(
      `http://localhost:3000/api/stripe/callback?code=auth_code&state=${state}`
    );
    Object.defineProperty(request, "cookies", {
      value: {
        get: vi.fn(() => ({ value: state })),
      },
      writable: true,
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("success=");
    expect(location).toContain("Stripe%20connected%20successfully");

    // Verify Stripe API was called
    expect(global.fetch).toHaveBeenCalledWith(
      "https://connect.stripe.com/oauth/token",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should store stripeAccountId in database", async () => {
    const organizationId = "org123";
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", activeOrganizationId: organizationId },
      session: { id: "session123" },
    } as Session);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        stripe_user_id: "acct_test123",
        access_token: "sk_test_token",
      }),
    } as Session);

    const state = "test_state_123";
    const request = new NextRequest(
      `http://localhost:3000/api/stripe/callback?code=auth_code&state=${state}`
    );
    Object.defineProperty(request, "cookies", {
      value: {
        get: vi.fn(() => ({ value: state })),
      },
      writable: true,
    });

    await GET(request);

    // Verify DB update was called
    expect(db.update).toHaveBeenCalled();
  });

  it("should handle invalid_grant error", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", activeOrganizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    // Mock Stripe API error
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "invalid_grant",
        error_description: "Authorization code expired",
      }),
    } as Response);

    const state = "test_state_123";
    const request = new NextRequest(
      `http://localhost:3000/api/stripe/callback?code=expired_code&state=${state}`
    );
    Object.defineProperty(request, "cookies", {
      value: {
        get: vi.fn(() => ({ value: state })),
      },
      writable: true,
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("error=");
    expect(location).toContain("Connection%20expired");
  });

  it("should handle network failures", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user123", activeOrganizationId: "org123" },
      session: { id: "session123" },
    } as Session);

    // Mock network error
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    const state = "test_state_123";
    const request = new NextRequest(
      `http://localhost:3000/api/stripe/callback?code=auth_code&state=${state}`
    );
    Object.defineProperty(request, "cookies", {
      value: {
        get: vi.fn(() => ({ value: state })),
      },
      writable: true,
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("error=");
    expect(location).toContain("Network%20error");
  });
});

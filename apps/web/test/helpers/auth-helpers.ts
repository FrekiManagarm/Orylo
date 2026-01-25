/**
 * Auth Test Helpers
 * 
 * Story 3.6: Helper functions for creating test sessions
 * 
 * Note: Better Auth doesn't have a simple test session creation API.
 * For integration tests, we'll mock the session or use a test user.
 */

/**
 * Create test session headers
 * 
 * For integration tests, we'll need to either:
 * 1. Create a real test user and sign in
 * 2. Mock the auth.api.getSession call
 * 
 * This helper provides headers structure for authenticated requests
 */
export function getAuthHeaders(sessionToken?: string): HeadersInit {
  if (sessionToken) {
    return {
      Cookie: `better-auth.session_token=${sessionToken}`,
    };
  }

  // For now, return empty headers (tests will need to mock auth)
  return {};
}

/**
 * Create a mock session object for testing
 */
export function createMockSession(organizationId: string = "org_test_123") {
  return {
    user: {
      id: "user_test_123",
      email: "test@example.com",
      organizationId,
    },
    session: {
      id: "session_test_123",
      userId: "user_test_123",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  };
}

/**
 * Mock auth.api.getSession for testing
 * 
 * Usage in tests:
 * vi.mock('@/lib/auth', () => ({
 *   auth: {
 *     api: {
 *       getSession: vi.fn().mockResolvedValue(createMockSession('org_test_123'))
 *     }
 *   }
 * }))
 */
export const mockAuth = {
  getSession: (organizationId: string = "org_test_123") =>
    Promise.resolve(createMockSession(organizationId)),
};

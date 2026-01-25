import { Page } from "@playwright/test";

/**
 * Auth Test Helpers
 * 
 * Story 3.7: Helper functions for E2E authentication
 */

/**
 * Login helper function
 * 
 * Uses semantic selectors (no data-testid needed)
 * Handles Better Auth login page variations
 */
export async function login(
  page: Page,
  email: string = "test@orylo.com",
  password: string = "test123"
) {
  // Try /login first, fallback to /sign-in
  await page.goto("/login");

  // Check if page exists, if not try sign-in
  const isLoginPage = await page
    .getByRole("heading", { name: /sign in|login/i })
    .isVisible()
    .catch(() => false);

  if (!isLoginPage) {
    await page.goto("/sign-in");
  }

  // Use semantic selectors - try multiple approaches
  const emailInput = page.getByRole("textbox", { name: /email/i }).first();
  const passwordInput = page
    .locator('input[type="password"]')
    .first();

  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email);
  }

  if (await passwordInput.isVisible().catch(() => false)) {
    await passwordInput.fill(password);
  }

  // Click sign in button
  const signInButton = page
    .getByRole("button", { name: /sign in|login/i })
    .first();
  await signInButton.click();

  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Create test user (optional)
 * 
 * For now, assumes user exists in test DB
 * Can be extended to create user via API if needed
 */
export async function createTestUser(email: string, password: string) {
  // Optional: API call to create test user
  // For now, assumes user exists in test DB
  console.log(`[Test Helper] Assuming test user exists: ${email}`);
}

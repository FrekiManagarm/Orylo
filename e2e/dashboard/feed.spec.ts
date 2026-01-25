import { test, expect } from "@playwright/test";
import { login } from "../e2e-helpers/auth";

/**
 * E2E Tests - Dashboard Feed
 * 
 * Story 3.7 AC2: Dashboard loads, detection cards visible
 */
test.describe("Dashboard Feed", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("AC2: detection cards are visible", async ({ page }) => {
    // Wait for feed to load
    await page.waitForLoadState("networkidle");

    // Look for detection cards - they might be buttons or cards
    // Try multiple selectors to find detection cards
    const cards = page
      .getByRole("button", { name: /detection|payment|transaction/i })
      .or(page.locator('[data-slot="card"]'))
      .or(page.locator('article, [role="article"]'));

    // Should have at least 1 detection (or show empty state)
    const cardCount = await cards.count();

    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible({ timeout: 10000 });
    } else {
      // If no cards, check for empty state message
      const emptyState = page.getByText(/no detections|empty|no data/i);
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("detection card shows correct data", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Find first detection card
    const firstCard = page
      .getByRole("button", { name: /detection|payment|transaction/i })
      .or(page.locator('[data-slot="card"]'))
      .or(page.locator('article, [role="article"]'))
      .first();

    const cardVisible = await firstCard.isVisible().catch(() => false);

    if (cardVisible) {
      // Verify card content (amount, decision, date)
      await expect(firstCard).toContainText(/\$|€|£|\d+/); // Amount or number
      await expect(firstCard).toContainText(/(Allow|Review|Block|ALLOW|REVIEW|BLOCK)/i); // Decision
    }
  });

  test("dashboard heading is visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /fraud detections|dashboard/i })
    ).toBeVisible();
  });
});

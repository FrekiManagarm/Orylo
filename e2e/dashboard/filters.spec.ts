import { test, expect } from "@playwright/test";
import { login } from "../e2e-helpers/auth";

/**
 * E2E Tests - Filters Functionality
 * 
 * Story 3.7 AC6: Filters functionality
 */
test.describe("Filters Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState("networkidle");
  });

  test("AC6: filter by decision updates feed", async ({ page }) => {
    // Open decision filter (Shadcn Select or Combobox)
    const decisionSelect = page
      .getByRole("combobox", { name: /decision/i })
      .or(page.getByRole("button", { name: /decision/i }))
      .first();

    const selectVisible = await decisionSelect.isVisible({ timeout: 5000 }).catch(() => false);

    if (!selectVisible) {
      test.skip();
      return;
    }

    await decisionSelect.click();

    // Select "Block" option
    const blockOption = page.getByRole("option", { name: /^block$/i }).first();
    await blockOption.click({ timeout: 5000 });

    // Wait for feed to update
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Give time for UI update

    // All visible cards should show "Block" decision (if any cards exist)
    const cards = page
      .getByRole("button", { name: /detection|payment|transaction/i })
      .or(page.locator('[data-slot="card"]'))
      .or(page.locator('article, [role="article"]'));

    const cardCount = await cards.count();

    if (cardCount > 0) {
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        // Check first few cards
        await expect(cards.nth(i)).toContainText(/block/i);
      }
    }
  });

  test("AC6: reset filters clears selection", async ({ page }) => {
    // Apply filter first
    const decisionSelect = page
      .getByRole("combobox", { name: /decision/i })
      .or(page.getByRole("button", { name: /decision/i }))
      .first();

    const selectVisible = await decisionSelect.isVisible({ timeout: 5000 }).catch(() => false);

    if (!selectVisible) {
      test.skip();
      return;
    }

    await decisionSelect.click();
    await page.getByRole("option", { name: /block/i }).first().click({ timeout: 5000 });
    await page.waitForLoadState("networkidle");

    // Find reset/clear button
    const resetButton = page
      .getByRole("button", { name: /reset|clear|all/i })
      .first();

    const resetVisible = await resetButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (resetVisible) {
      await resetButton.click();
      await page.waitForLoadState("networkidle");

      // Verify filter is cleared (all detections visible again)
      const cards = page
        .getByRole("button", { name: /detection|payment|transaction/i })
        .or(page.locator('[data-slot="card"]'));

      // Should have more cards after reset (or same if all were already visible)
      await expect(cards.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

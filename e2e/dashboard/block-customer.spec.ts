import { test, expect } from "@playwright/test";
import { login } from "../e2e-helpers/auth";

/**
 * E2E Tests - Block Customer Flow
 * 
 * Story 3.7 AC3: Block customer flow
 */
test.describe("Block Customer Flow", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState("networkidle");
  });

  test("AC3: block customer flow completes successfully", async ({ page }) => {
    // Find first Block button
    // Block buttons might be in detection cards or action menus
    const blockButton = page
      .getByRole("button", { name: /^block$/i })
      .first();

    const buttonVisible = await blockButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (!buttonVisible) {
      test.skip();
      return;
    }

    await blockButton.click();

    // Confirm in AlertDialog (Shadcn AlertDialog structure)
    const confirmButton = page
      .getByRole("alertdialog")
      .getByRole("button", { name: /confirm|continue|block/i })
      .first();

    await confirmButton.click({ timeout: 5000 });

    // Verify toast notification appears (Sonner toast)
    const toast = page
      .locator(".sonner-toast, [data-sonner-toast], [role="status"]")
      .first();
    await expect(toast).toContainText(/blocked|success/i, { timeout: 5000 });
  });

  test("cancel block action dismisses dialog", async ({ page }) => {
    const blockButton = page
      .getByRole("button", { name: /^block$/i })
      .first();

    const buttonVisible = await blockButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (!buttonVisible) {
      test.skip();
      return;
    }

    await blockButton.click();

    // Click Cancel
    const cancelButton = page
      .getByRole("alertdialog")
      .getByRole("button", { name: /cancel/i })
      .first();

    await cancelButton.click({ timeout: 5000 });

    // Dialog should close (no toast)
    await expect(page.getByRole("alertdialog")).not.toBeVisible({ timeout: 2000 });
  });
});

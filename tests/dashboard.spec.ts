import { test, expect, Page } from "@playwright/test";

async function registerAndLogin(page: Page) {
  const email = `dashboard_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;
  await page.goto("/register");
  const nameInput = page.locator("input[placeholder*='name' i], input[name='name'], input[type='text']").first();
  await nameInput.fill("Dashboard Tester");
  await page.fill("input[type='email']", email);
  const passwordInputs = page.locator("input[type='password']");
  await passwordInputs.nth(0).fill("Test@1234");
  if (await passwordInputs.count() > 1) {
    await passwordInputs.nth(1).fill("Test@1234");
  }
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("Dashboard loads with stats cards", async ({ page }) => {
    await expect(page.locator("text=Total Surveys")).toBeVisible();
    await expect(page.locator("text=Active")).toBeVisible();
    await expect(page.locator("text=Questions")).toBeVisible();
    await expect(page.getByText("Responses", { exact: true })).toBeVisible();
  });

  test("Dashboard shows empty state when no surveys", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "No surveys yet" })).toBeVisible();
  });

  test("New Survey button navigates to create page", async ({ page }) => {
    await page.getByRole("button", { name: /new survey/i }).click();
    await page.waitForURL("**/dashboard/create", { timeout: 5000 });
    await expect(page).toHaveURL(/dashboard\/create/);
  });

  test("Logout redirects to login", async ({ page }) => {
    await page.getByRole("button", { name: /logout/i }).click();
    await page.waitForURL("**/login", { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });
});

import { test, expect } from "@playwright/test";

const TEST_USER = {
  name: "Test User",
  email: `testuser_${Date.now()}@example.com`,
  password: "Test@1234",
};

test.describe("Authentication", () => {
  test("Landing page loads and has login/register links", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Survey/i);
  });

  test("Login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: /login|sign in/i })).toBeVisible();
  });

  test("Login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", "invalid@test.com");
    await page.fill("input[type='password']", "wrongpassword");
    await page.getByRole("button", { name: /login|sign in/i }).click();
    await expect(page.locator("text=/invalid|error|incorrect/i")).toBeVisible({ timeout: 5000 });
  });

  test("Register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /register|sign up|create/i })).toBeVisible();
  });

  test("Register a new user and redirect to dashboard", async ({ page }) => {
    await page.goto("/register");
    // Fill name field
    const nameInput = page.locator("input[placeholder*='name' i], input[name='name'], input[type='text']").first();
    await nameInput.fill(TEST_USER.name);
    await page.fill("input[type='email']", TEST_USER.email);
    // Fill password fields
    const passwordInputs = page.locator("input[type='password']");
    await passwordInputs.nth(0).fill(TEST_USER.password);
    if (await passwordInputs.count() > 1) {
      await passwordInputs.nth(1).fill(TEST_USER.password);
    }
    await page.getByRole("button", { name: /register|sign up|create/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("Login with registered user", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", TEST_USER.email);
    await page.fill("input[type='password']", TEST_USER.password);
    await page.getByRole("button", { name: /login|sign in/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });
});

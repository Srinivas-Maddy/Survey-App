import { test, expect, Page } from "@playwright/test";

async function registerAndLogin(page: Page) {
  const email = `surveycrud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;
  await page.goto("/register");
  const nameInput = page.locator("input[placeholder*='name' i], input[name='name'], input[type='text']").first();
  await nameInput.fill("Survey Tester");
  await page.fill("input[type='email']", email);
  const passwordInputs = page.locator("input[type='password']");
  await passwordInputs.nth(0).fill("Test@1234");
  if (await passwordInputs.count() > 1) {
    await passwordInputs.nth(1).fill("Test@1234");
  }
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Survey CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("Create a survey with text question", async ({ page }) => {
    await page.getByRole("button", { name: /new survey/i }).click();
    await page.waitForURL("**/dashboard/create", { timeout: 5000 });

    // Fill survey details
    await page.locator("input[placeholder*='Customer Satisfaction']").fill("Test Survey");
    await page.locator("textarea").first().fill("Test Description");

    // Add a question
    await page.getByRole("button", { name: /add question/i }).click();
    await page.locator("input[placeholder*='Type your question']").first().fill("What is your name?");

    // Submit
    await page.getByRole("button", { name: /publish|create/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Verify survey appears
    await expect(page.locator("text=Test Survey")).toBeVisible();
  });

  test("Create survey with multiple question types", async ({ page }) => {
    await page.getByRole("button", { name: /new survey/i }).click();
    await page.waitForURL("**/dashboard/create", { timeout: 5000 });

    await page.locator("input[placeholder*='Customer Satisfaction']").fill("Multi-Type Survey");

    // Add text question
    await page.getByRole("button", { name: /add question/i }).click();
    await page.locator("input[placeholder*='Type your question']").first().fill("Your feedback?");

    // Add rating question
    await page.getByRole("button", { name: /add question/i }).click();
    let questionInputs = page.locator("input[placeholder*='Type your question']");
    await questionInputs.nth(1).fill("Rate our service");
    let selects = page.locator("select");
    await selects.nth(1).selectOption("rating");

    // Add phone question
    await page.getByRole("button", { name: /add question/i }).click();
    questionInputs = page.locator("input[placeholder*='Type your question']");
    await questionInputs.nth(2).fill("Your phone number?");
    selects = page.locator("select");
    await selects.nth(2).selectOption("phone");

    // Add email question
    await page.getByRole("button", { name: /add question/i }).click();
    questionInputs = page.locator("input[placeholder*='Type your question']");
    await questionInputs.nth(3).fill("Your email address?");
    selects = page.locator("select");
    await selects.nth(3).selectOption("email");

    // Submit
    await page.getByRole("button", { name: /publish|create/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.locator("text=Multi-Type Survey")).toBeVisible();
  });

  test("Toggle survey active/inactive", async ({ page }) => {
    // First create a survey
    await page.getByRole("button", { name: /new survey/i }).click();
    await page.waitForURL("**/dashboard/create", { timeout: 5000 });
    await page.locator("input[placeholder*='Customer Satisfaction']").fill("Toggle Test Survey");
    await page.getByRole("button", { name: /add question/i }).click();
    await page.locator("input[placeholder*='Type your question']").first().fill("Test question");
    await page.getByRole("button", { name: /publish|create/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Survey should be active (Live badge)
    await expect(page.locator("text=Live")).toBeVisible();

    // Click Pause
    await page.getByRole("button", { name: /pause/i }).first().click();
    await expect(page.locator("text=Paused")).toBeVisible({ timeout: 5000 });

    // Click Resume
    await page.getByRole("button", { name: /resume/i }).first().click();
    await expect(page.locator("text=Live")).toBeVisible({ timeout: 5000 });
  });

  test("Delete a survey", async ({ page }) => {
    // Create a survey
    await page.getByRole("button", { name: /new survey/i }).click();
    await page.waitForURL("**/dashboard/create", { timeout: 5000 });
    await page.locator("input[placeholder*='Customer Satisfaction']").fill("Delete Me Survey");
    await page.getByRole("button", { name: /add question/i }).click();
    await page.locator("input[placeholder*='Type your question']").first().fill("Temporary question");
    await page.getByRole("button", { name: /publish|create/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.locator("text=Delete Me Survey")).toBeVisible();

    // Delete it
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /delete/i }).first().click();

    // Should be gone
    await expect(page.locator("text=Delete Me Survey")).not.toBeVisible({ timeout: 5000 });
  });

  test("Copy share link works", async ({ page }) => {
    // Create a survey
    await page.getByRole("button", { name: /new survey/i }).click();
    await page.waitForURL("**/dashboard/create", { timeout: 5000 });
    await page.locator("input[placeholder*='Customer Satisfaction']").fill("Share Test");
    await page.getByRole("button", { name: /add question/i }).click();
    await page.locator("input[placeholder*='Type your question']").first().fill("Share question");
    await page.getByRole("button", { name: /publish|create/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Click Share
    await page.getByRole("button", { name: /share/i }).first().click();
    await expect(page.locator("text=Copied!")).toBeVisible({ timeout: 3000 });
  });
});

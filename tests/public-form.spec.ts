import { test, expect, Page } from "@playwright/test";

async function registerAndCreateSurvey(page: Page): Promise<string> {
  const email = `formtest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;
  // Register
  await page.goto("/register");
  const nameInput = page.locator("input[placeholder*='name' i], input[name='name'], input[type='text']").first();
  await nameInput.fill("Form Tester");
  await page.fill("input[type='email']", email);
  const passwordInputs = page.locator("input[type='password']");
  await passwordInputs.nth(0).fill("Test@1234");
  if (await passwordInputs.count() > 1) {
    await passwordInputs.nth(1).fill("Test@1234");
  }
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Create survey with various question types
  await page.getByRole("button", { name: /new survey/i }).click();
  await page.waitForURL("**/dashboard/create", { timeout: 5000 });

  await page.locator("input[placeholder*='Customer Satisfaction']").fill("Public Form Test Survey");
  await page.locator("textarea").first().fill("Testing the public form");

  // Add text question
  await page.getByRole("button", { name: /add question/i }).click();
  await page.locator("input[placeholder*='Type your question']").first().fill("What is your name?");

  // Add radio question
  await page.getByRole("button", { name: /add question/i }).click();
  let questionInputs = page.locator("input[placeholder*='Type your question']");
  await questionInputs.nth(1).fill("Favorite color?");
  let selects = page.locator("select");
  await selects.nth(1).selectOption("radio");
  // Add options
  const addOptionBtns = page.locator("button", { hasText: /add option/i });
  await page.locator("input[placeholder*='Option 1']").last().fill("Red");
  await addOptionBtns.last().click();
  await page.locator("input[placeholder*='Option 2']").last().fill("Blue");

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

  // Publish
  await page.getByRole("button", { name: /publish|create/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 10000 });

  // Get the public link by clicking Share and reading clipboard
  // Instead, get publicId from the Share button's data or navigate to results
  await page.getByRole("button", { name: /share/i }).first().click();
  await page.waitForTimeout(500);

  // Read clipboard
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  return clipboardText;
}

test.describe("Public Survey Form", () => {
  test("Submit a public survey form", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const publicUrl = await registerAndCreateSurvey(page);
    expect(publicUrl).toContain("/s/");

    // Visit public form
    await page.goto(publicUrl);
    await expect(page.locator("text=Public Form Test Survey")).toBeVisible({ timeout: 10000 });

    // Fill text question
    const textInput = page.locator("input[type='text']").first();
    await textInput.fill("John Doe");

    // Select radio option
    await page.getByText("Red", { exact: true }).click();

    // Fill phone number
    await page.locator("input[type='tel']").fill("+1234567890");

    // Fill email
    await page.locator("input[type='email']").fill("john@example.com");

    // Submit
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible({ timeout: 10000 });
  });

  test("Public form shows validation for required fields", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const publicUrl = await registerAndCreateSurvey(page);

    await page.goto(publicUrl);
    await expect(page.locator("text=Public Form Test Survey")).toBeVisible({ timeout: 10000 });

    // Try to submit without filling (if required fields exist, browser validation should prevent)
    await page.getByRole("button", { name: /submit/i }).click();
    // Page should still be on the form (not submitted)
    await expect(page.locator("text=Public Form Test Survey")).toBeVisible();
  });

  test("Inactive survey shows not available message", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const publicUrl = await registerAndCreateSurvey(page);

    // Go back to dashboard and pause the survey
    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await page.getByRole("button", { name: /pause/i }).first().click();
    await expect(page.locator("text=Paused")).toBeVisible({ timeout: 5000 });

    // Now visit public link
    await page.goto(publicUrl);
    await expect(page.locator("text=/not available|inactive|closed|not found/i")).toBeVisible({ timeout: 10000 });
  });
});

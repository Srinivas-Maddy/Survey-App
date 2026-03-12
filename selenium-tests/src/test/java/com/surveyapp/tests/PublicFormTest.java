package com.surveyapp.tests;

import com.surveyapp.utils.BaseTest;
import com.surveyapp.utils.WaitHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class PublicFormTest extends BaseTest {

    private String registerAndCreateSurvey() {
        String email = generateUniqueEmail("formtest");
        registerAndLogin("Form Tester", email, "Test@1234");

        // Navigate to create survey
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'new survey')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard/create", 5);

        // Fill survey title
        WaitHelper.waitForVisible(driver, "input[placeholder*='Customer Satisfaction']")
                .sendKeys("Public Form Test Survey");
        driver.findElement(By.cssSelector("textarea")).sendKeys("Testing the public form");

        // Add text question
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'add question')]");
        driver.findElements(By.cssSelector("input[placeholder*='Type your question']"))
                .get(0).sendKeys("What is your name?");

        // Add radio question
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'add question')]");
        List<WebElement> questionInputs = driver.findElements(By.cssSelector("input[placeholder*='Type your question']"));
        questionInputs.get(1).sendKeys("Favorite color?");

        // Change type to radio
        List<WebElement> selects = driver.findElements(By.cssSelector("select"));
        new org.openqa.selenium.support.ui.Select(selects.get(selects.size() - 1)).selectByValue("radio");

        // Fill options
        driver.findElement(By.cssSelector("input[placeholder*='Option 1']")).sendKeys("Red");
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'add option')]");
        driver.findElement(By.cssSelector("input[placeholder*='Option 2']")).sendKeys("Blue");

        // Add phone question
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'add question')]");
        questionInputs = driver.findElements(By.cssSelector("input[placeholder*='Type your question']"));
        questionInputs.get(2).sendKeys("Your phone number?");
        selects = driver.findElements(By.cssSelector("select"));
        new org.openqa.selenium.support.ui.Select(selects.get(selects.size() - 1)).selectByValue("phone");

        // Add email question
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'add question')]");
        questionInputs = driver.findElements(By.cssSelector("input[placeholder*='Type your question']"));
        questionInputs.get(3).sendKeys("Your email address?");
        selects = driver.findElements(By.cssSelector("select"));
        new org.openqa.selenium.support.ui.Select(selects.get(selects.size() - 1)).selectByValue("email");

        // Publish
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'publish')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard", 10);

        // Get public URL via API using the browser's auth cookie
        Cookie tokenCookie = driver.manage().getCookieNamed("token");
        if (tokenCookie != null) {
            try {
                HttpClient client = HttpClient.newBuilder()
                        .version(HttpClient.Version.HTTP_1_1)
                        .build();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/api/surveys"))
                        .header("Cookie", "token=" + tokenCookie.getValue())
                        .GET()
                        .build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                JsonObject data = new Gson().fromJson(response.body(), JsonObject.class);
                JsonArray surveys = data.getAsJsonArray("surveys");
                if (surveys.size() > 0) {
                    String publicId = surveys.get(0).getAsJsonObject().get("publicId").getAsString();
                    return BASE_URL + "/s/" + publicId;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return BASE_URL + "/s/unknown";
    }

    @Test(priority = 1)
    public void testSubmitPublicSurveyForm() {
        String publicUrl = registerAndCreateSurvey();
        Assert.assertFalse(publicUrl.contains("/s/unknown"), "Should get a valid public URL");

        driver.get(publicUrl);
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Public Form Test Survey", 10),
                "Public survey title should be visible");

        // Fill text question
        driver.findElement(By.cssSelector("input[type='text']")).sendKeys("John Doe");

        // Select radio option - use exact text match
        WaitHelper.clickByXpath(driver, "//span[text()='Red']");

        // Fill phone number
        driver.findElement(By.cssSelector("input[type='tel']")).sendKeys("+1234567890");

        // Fill email
        driver.findElement(By.cssSelector("input[type='email']")).sendKeys("john@example.com");

        // Submit
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit')]");

        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Thank You!", 10),
                "Thank you message should appear after submission");
    }

    @Test(priority = 2)
    public void testPublicFormValidation() {
        String publicUrl = registerAndCreateSurvey();
        Assert.assertFalse(publicUrl.contains("/s/unknown"), "Should get a valid public URL");

        driver.get(publicUrl);
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Public Form Test Survey", 10),
                "Public survey title should be visible");

        // Try to submit without filling
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit')]");

        // Page should still show the survey form
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Public Form Test Survey", 5),
                "Form should still be visible (not submitted)");
    }

    @Test(priority = 3)
    public void testInactiveSurveyShowsNotAvailable() {
        String publicUrl = registerAndCreateSurvey();
        Assert.assertFalse(publicUrl.contains("/s/unknown"), "Should get a valid public URL");

        // Go back to dashboard and pause the survey
        driver.get(BASE_URL + "/dashboard");
        WaitHelper.waitForUrlContains(driver, "/dashboard", 5);

        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'pause')]");
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Paused", 5),
                "Survey should be paused");

        // Visit public link
        driver.get(publicUrl);

        Assert.assertTrue(
                WaitHelper.isTextVisibleCaseInsensitive(driver, "not available", 10) ||
                        WaitHelper.isTextVisibleCaseInsensitive(driver, "inactive", 10) ||
                        WaitHelper.isTextVisibleCaseInsensitive(driver, "not found", 10),
                "Inactive survey should show not available message");
    }
}

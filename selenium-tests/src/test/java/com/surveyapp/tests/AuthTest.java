package com.surveyapp.tests;

import com.surveyapp.utils.BaseTest;
import com.surveyapp.utils.WaitHelper;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AuthTest extends BaseTest {

    private final String testEmail = "testuser_" + System.currentTimeMillis() + "@example.com";
    private final String testPassword = "Test@1234";
    private final String testName = "Test User";

    @Test(priority = 1)
    public void testLandingPageLoads() {
        driver.get(BASE_URL + "/");
        Assert.assertTrue(driver.getTitle().toLowerCase().contains("survey"),
                "Landing page title should contain 'Survey'");
    }

    @Test(priority = 2)
    public void testLoginPageRendersCorrectly() {
        driver.get(BASE_URL + "/login");
        Assert.assertTrue(driver.findElement(By.cssSelector("input[type='email']")).isDisplayed(),
                "Email input should be visible");
        Assert.assertTrue(driver.findElement(By.cssSelector("input[type='password']")).isDisplayed(),
                "Password input should be visible");
        Assert.assertTrue(driver.findElement(By.xpath(
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sign in')]"
        )).isDisplayed(), "Login button should be visible");
    }

    @Test(priority = 3)
    public void testLoginWithInvalidCredentials() {
        driver.get(BASE_URL + "/login");
        driver.findElement(By.cssSelector("input[type='email']")).sendKeys("invalid@test.com");
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys("wrongpassword");
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sign in')]");

        Assert.assertTrue(
                WaitHelper.isTextVisibleCaseInsensitive(driver, "invalid", 5) ||
                        WaitHelper.isTextVisibleCaseInsensitive(driver, "error", 5) ||
                        WaitHelper.isTextVisibleCaseInsensitive(driver, "incorrect", 5),
                "Error message should be visible for invalid credentials");
    }

    @Test(priority = 4)
    public void testRegisterPageRendersCorrectly() {
        driver.get(BASE_URL + "/register");
        Assert.assertTrue(driver.findElement(By.cssSelector("input[type='email']")).isDisplayed(),
                "Email input should be visible");
        Assert.assertTrue(driver.findElement(By.cssSelector("input[type='password']")).isDisplayed(),
                "Password input should be visible");
        Assert.assertTrue(driver.findElement(By.xpath(
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'create account')]"
        )).isDisplayed(), "Create Account button should be visible");
    }

    @Test(priority = 5)
    public void testRegisterNewUser() {
        registerAndLogin(testName, testEmail, testPassword);
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Should redirect to dashboard after registration");
    }

    @Test(priority = 6, dependsOnMethods = "testRegisterNewUser")
    public void testLoginWithRegisteredUser() {
        driver.get(BASE_URL + "/login");
        driver.findElement(By.cssSelector("input[type='email']")).sendKeys(testEmail);
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys(testPassword);
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sign in')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard", 10);
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Should redirect to dashboard after login");
    }
}

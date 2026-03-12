package com.surveyapp.tests;

import com.surveyapp.utils.BaseTest;
import com.surveyapp.utils.WaitHelper;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class DashboardTest extends BaseTest {

    @BeforeMethod(dependsOnMethods = "setUp")
    public void loginToDashboard() {
        String email = generateUniqueEmail("dashboard");
        registerAndLogin("Dashboard Tester", email, "Test@1234");
    }

    @Test(priority = 1)
    public void testDashboardLoadsWithStatsCards() {
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Total Surveys", 5),
                "'Total Surveys' stat card should be visible");
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Active", 5),
                "'Active' stat card should be visible");
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Questions", 5),
                "'Questions' stat card should be visible");

        // Use exact match for "Responses" to avoid matching other text
        Assert.assertTrue(driver.findElement(By.xpath(
                "//p[text()='Responses']")).isDisplayed(),
                "'Responses' stat card should be visible");
    }

    @Test(priority = 2)
    public void testDashboardShowsEmptyState() {
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "No surveys yet", 5),
                "Empty state 'No surveys yet' should be visible");
    }

    @Test(priority = 3)
    public void testNewSurveyButtonNavigatesToCreatePage() {
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'new survey')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard/create", 5);
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard/create"),
                "Should navigate to create survey page");
    }

    @Test(priority = 4)
    public void testLogoutRedirectsToLogin() {
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'logout')]");
        WaitHelper.waitForUrlContains(driver, "/login", 5);
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"),
                "Should redirect to login after logout");
    }
}

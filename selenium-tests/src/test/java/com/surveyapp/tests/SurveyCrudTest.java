package com.surveyapp.tests;

import com.surveyapp.utils.BaseTest;
import com.surveyapp.utils.WaitHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

public class SurveyCrudTest extends BaseTest {

    @BeforeMethod(dependsOnMethods = "setUp")
    public void loginToDashboard() {
        String email = generateUniqueEmail("surveycrud");
        registerAndLogin("Survey Tester", email, "Test@1234");
    }

    private void navigateToCreateSurvey() {
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'new survey')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard/create", 5);
    }

    private void fillSurveyTitle(String title) {
        WaitHelper.waitForVisible(driver, "input[placeholder*='Customer Satisfaction']").sendKeys(title);
    }

    private void addQuestion(String questionText) {
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'add question')]");
        List<WebElement> questionInputs = driver.findElements(By.cssSelector("input[placeholder*='Type your question']"));
        questionInputs.get(questionInputs.size() - 1).sendKeys(questionText);
    }

    private void publishSurvey() {
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'publish')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard", 10);
    }

    private void createSurvey(String title, String questionText) {
        navigateToCreateSurvey();
        fillSurveyTitle(title);
        addQuestion(questionText);
        publishSurvey();
    }

    @Test(priority = 1)
    public void testCreateSurveyWithTextQuestion() {
        createSurvey("Test Survey", "What is your name?");

        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Test Survey", 5),
                "Created survey should appear on dashboard");
    }

    @Test(priority = 2)
    public void testCreateSurveyWithMultipleQuestionTypes() {
        navigateToCreateSurvey();
        fillSurveyTitle("Multi-Type Survey");

        // Add text question
        addQuestion("Your feedback?");

        // Add second question
        addQuestion("Rate our service");

        // Change second question type to rating
        List<WebElement> selects = driver.findElements(By.cssSelector("select"));
        new org.openqa.selenium.support.ui.Select(selects.get(selects.size() - 1)).selectByValue("rating");

        // Add phone question
        addQuestion("Your phone number?");
        selects = driver.findElements(By.cssSelector("select"));
        new org.openqa.selenium.support.ui.Select(selects.get(selects.size() - 1)).selectByValue("phone");

        // Add email question
        addQuestion("Your email address?");
        selects = driver.findElements(By.cssSelector("select"));
        new org.openqa.selenium.support.ui.Select(selects.get(selects.size() - 1)).selectByValue("email");

        publishSurvey();

        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Multi-Type Survey", 5),
                "Multi-type survey should appear on dashboard");
    }

    @Test(priority = 3)
    public void testToggleSurveyActiveInactive() {
        createSurvey("Toggle Test Survey", "Test question");

        // Survey should be active (Live badge)
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Live", 5),
                "Survey should show 'Live' badge");

        // Click Pause
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'pause')]");
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Paused", 5),
                "Survey should show 'Paused' badge");

        // Click Resume
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'resume')]");
        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Live", 5),
                "Survey should show 'Live' badge again");
    }

    @Test(priority = 4)
    public void testDeleteSurvey() {
        createSurvey("Delete Me Survey", "Temporary question");

        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Delete Me Survey", 5),
                "Survey should be visible before deletion");

        // Click Delete
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'delete')]");

        // Accept confirmation dialog
        WaitHelper.acceptAlert(driver, 5);

        // Survey should be gone
        WaitHelper.waitForInvisible(driver, "//*[contains(text(), 'Delete Me Survey')]", 5);
        Assert.assertFalse(WaitHelper.isTextVisible(driver, "Delete Me Survey", 2),
                "Deleted survey should no longer be visible");
    }

    @Test(priority = 5)
    public void testCopyShareLinkWorks() {
        createSurvey("Share Test", "Share question");

        // Click Share
        WaitHelper.clickByXpath(driver,
                "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'share')]");

        Assert.assertTrue(WaitHelper.isTextVisible(driver, "Copied!", 3),
                "'Copied!' confirmation should appear");
    }
}

package com.surveyapp.utils;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class WaitHelper {

    private static final int DEFAULT_TIMEOUT = 10;

    public static WebElement waitForVisible(WebDriver driver, String cssSelector) {
        return waitForVisible(driver, cssSelector, DEFAULT_TIMEOUT);
    }

    public static WebElement waitForVisible(WebDriver driver, String cssSelector, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(cssSelector)));
    }

    public static WebElement waitForVisibleByXpath(WebDriver driver, String xpath) {
        return waitForVisibleByXpath(driver, xpath, DEFAULT_TIMEOUT);
    }

    public static WebElement waitForVisibleByXpath(WebDriver driver, String xpath, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
    }

    public static void clickByXpath(WebDriver driver, String xpath) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(DEFAULT_TIMEOUT));
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath(xpath))).click();
    }

    public static void clickByCss(WebDriver driver, String cssSelector) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(DEFAULT_TIMEOUT));
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(cssSelector))).click();
    }

    public static void waitForUrlContains(WebDriver driver, String urlPart, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        wait.until(ExpectedConditions.urlContains(urlPart));
    }

    public static boolean isTextVisible(WebDriver driver, String text, int timeoutSeconds) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(text(), '" + text + "')]")));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }

    public static boolean isTextVisibleCaseInsensitive(WebDriver driver, String text, int timeoutSeconds) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
            String lower = text.toLowerCase();
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '" + lower + "')]")));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }

    public static void waitForInvisible(WebDriver driver, String xpath, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath(xpath)));
    }

    public static void selectByValue(WebDriver driver, String cssSelector, String value) {
        WebElement selectElement = waitForVisible(driver, cssSelector);
        new Select(selectElement).selectByValue(value);
    }

    public static WebElement waitForClickable(WebDriver driver, String cssSelector, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(cssSelector)));
    }

    public static void acceptAlert(WebDriver driver, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        wait.until(ExpectedConditions.alertIsPresent());
        driver.switchTo().alert().accept();
    }
}

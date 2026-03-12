package com.surveyapp.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.time.Duration;

public class BaseTest {

    protected WebDriver driver;
    private WebDriver rawDriver; // keep reference to actual driver for quit()
    protected static final String BASE_URL = "http://localhost:3000";

    @BeforeMethod
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--disable-notifications");
        rawDriver = new ChromeDriver(options);
        rawDriver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        rawDriver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));

        // Demo mode: wrap driver with SlowDriver for visible delays
        boolean demoMode = Boolean.parseBoolean(System.getProperty("demo.mode", "false"));
        if (demoMode) {
            long delay = Long.parseLong(System.getProperty("demo.delay", "1000"));
            driver = new SlowDriver(rawDriver, delay);
        } else {
            driver = rawDriver;
        }
    }

    @AfterMethod
    public void tearDown() {
        if (rawDriver != null) {
            rawDriver.quit();
        }
    }

    protected String generateUniqueEmail(String prefix) {
        return prefix + "_" + System.currentTimeMillis() + "_" +
                ((int) (Math.random() * 10000)) + "@example.com";
    }

    protected void registerAndLogin(String name, String email, String password) {
        driver.get(BASE_URL + "/register");

        WaitHelper.waitForVisible(driver, "input[type='text']").sendKeys(name);
        driver.findElement(org.openqa.selenium.By.cssSelector("input[type='email']")).sendKeys(email);

        var passwordInputs = driver.findElements(org.openqa.selenium.By.cssSelector("input[type='password']"));
        passwordInputs.get(0).sendKeys(password);
        if (passwordInputs.size() > 1) {
            passwordInputs.get(1).sendKeys(password);
        }

        WaitHelper.clickByXpath(driver, "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'create account')]");
        WaitHelper.waitForUrlContains(driver, "/dashboard", 15);
    }
}

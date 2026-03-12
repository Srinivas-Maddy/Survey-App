package com.surveyapp.utils;

import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.print.PrintOptions;

import java.util.*;

/**
 * A WebDriver wrapper that adds a configurable delay before every interaction.
 * Perfect for demos so the audience can follow each step.
 *
 * Usage: Set system property "demo.delay" to milliseconds (default: 1000)
 *   mvn test -Ddemo.mode=true -Ddemo.delay=1500
 */
public class SlowDriver implements WebDriver, JavascriptExecutor {

    private final WebDriver delegate;
    private final long delayMs;

    public SlowDriver(WebDriver delegate, long delayMs) {
        this.delegate = delegate;
        this.delayMs = delayMs;
    }

    private void pause() {
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // Highlight element before interacting
    private void highlight(WebElement element) {
        try {
            ((JavascriptExecutor) delegate).executeScript(
                    "arguments[0].style.outline='3px solid #6366f1'; arguments[0].style.outlineOffset='2px';",
                    element);
        } catch (Exception ignored) {
        }
    }

    private void removeHighlight(WebElement element) {
        try {
            ((JavascriptExecutor) delegate).executeScript(
                    "arguments[0].style.outline=''; arguments[0].style.outlineOffset='';",
                    element);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void get(String url) {
        pause();
        delegate.get(url);
    }

    @Override
    public String getCurrentUrl() {
        return delegate.getCurrentUrl();
    }

    @Override
    public String getTitle() {
        return delegate.getTitle();
    }

    @Override
    public List<WebElement> findElements(By by) {
        List<WebElement> elements = delegate.findElements(by);
        List<WebElement> wrapped = new ArrayList<>();
        for (WebElement el : elements) {
            wrapped.add(new SlowWebElement(el));
        }
        return wrapped;
    }

    @Override
    public WebElement findElement(By by) {
        return new SlowWebElement(delegate.findElement(by));
    }

    @Override
    public String getPageSource() {
        return delegate.getPageSource();
    }

    @Override
    public void close() {
        delegate.close();
    }

    @Override
    public void quit() {
        delegate.quit();
    }

    @Override
    public Set<String> getWindowHandles() {
        return delegate.getWindowHandles();
    }

    @Override
    public String getWindowHandle() {
        return delegate.getWindowHandle();
    }

    @Override
    public TargetLocator switchTo() {
        return delegate.switchTo();
    }

    @Override
    public Navigation navigate() {
        return delegate.navigate();
    }

    @Override
    public Options manage() {
        return delegate.manage();
    }

    // JavascriptExecutor delegation
    @Override
    public Object executeScript(String script, Object... args) {
        return ((JavascriptExecutor) delegate).executeScript(script, unwrapArgs(args));
    }

    @Override
    public Object executeAsyncScript(String script, Object... args) {
        return ((JavascriptExecutor) delegate).executeAsyncScript(script, unwrapArgs(args));
    }

    private Object[] unwrapArgs(Object[] args) {
        Object[] unwrapped = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            if (args[i] instanceof SlowWebElement) {
                unwrapped[i] = ((SlowWebElement) args[i]).delegate;
            } else {
                unwrapped[i] = args[i];
            }
        }
        return unwrapped;
    }

    /**
     * Inner class that wraps WebElement to add delays and highlights on interactions.
     */
    private class SlowWebElement implements WebElement, WrapsElement {

        private final WebElement delegate;

        SlowWebElement(WebElement delegate) {
            this.delegate = delegate;
        }

        @Override
        public WebElement getWrappedElement() {
            return delegate;
        }

        @Override
        public void click() {
            highlight(delegate);
            pause();
            removeHighlight(delegate);
            delegate.click();
        }

        @Override
        public void submit() {
            pause();
            delegate.submit();
        }

        @Override
        public void sendKeys(CharSequence... keysToSend) {
            highlight(delegate);
            pause();
            removeHighlight(delegate);
            delegate.sendKeys(keysToSend);
        }

        @Override
        public void clear() {
            pause();
            delegate.clear();
        }

        @Override
        public String getTagName() {
            return delegate.getTagName();
        }

        @Override
        public String getAttribute(String name) {
            return delegate.getAttribute(name);
        }

        @Override
        public boolean isSelected() {
            return delegate.isSelected();
        }

        @Override
        public boolean isEnabled() {
            return delegate.isEnabled();
        }

        @Override
        public String getText() {
            return delegate.getText();
        }

        @Override
        public List<WebElement> findElements(By by) {
            List<WebElement> elements = delegate.findElements(by);
            List<WebElement> wrapped = new ArrayList<>();
            for (WebElement el : elements) {
                wrapped.add(new SlowWebElement(el));
            }
            return wrapped;
        }

        @Override
        public WebElement findElement(By by) {
            return new SlowWebElement(delegate.findElement(by));
        }

        @Override
        public boolean isDisplayed() {
            return delegate.isDisplayed();
        }

        @Override
        public Point getLocation() {
            return delegate.getLocation();
        }

        @Override
        public Dimension getSize() {
            return delegate.getSize();
        }

        @Override
        public Rectangle getRect() {
            return delegate.getRect();
        }

        @Override
        public String getCssValue(String propertyName) {
            return delegate.getCssValue(propertyName);
        }

        @Override
        public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
            return delegate.getScreenshotAs(target);
        }

        @Override
        public String getDomProperty(String name) {
            return delegate.getDomProperty(name);
        }

        @Override
        public String getDomAttribute(String name) {
            return delegate.getDomAttribute(name);
        }

        @Override
        public String getAriaRole() {
            return delegate.getAriaRole();
        }

        @Override
        public String getAccessibleName() {
            return delegate.getAccessibleName();
        }

        @Override
        public SearchContext getShadowRoot() {
            return delegate.getShadowRoot();
        }
    }
}

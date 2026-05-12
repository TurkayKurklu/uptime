/**
 * Screenshot service using Playwright
 * Takes full-page screenshots of target URLs
 * 
 * NOTE: Requires `npx playwright install chromium` to be run first
 * For serverless environments, consider using @browserless/browserless instead
 */

let playwrightAvailable = true;

interface ScreenshotResult {
  buffer: Buffer | null;
  error: string | null;
}

/**
 * Takes a full-page screenshot of a URL using Playwright
 */
export async function takeScreenshot(url: string): Promise<ScreenshotResult> {
  if (!playwrightAvailable) {
    return { buffer: null, error: "Playwright is not available" };
  }

  try {
    // Dynamic import to avoid issues when playwright is not installed
    const { chromium } = await import("playwright");

    // Common paths for chromium on Linux/Railway
    const executablePath = "/usr/bin/chromium";
    const fs = await import("fs");
    const launchOptions: any = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    };

    if (fs.existsSync(executablePath)) {
      launchOptions.executablePath = executablePath;
    }

    const browser = await chromium.launch(launchOptions);

    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent:
          "AntigravityUptimeBot/1.0 (+https://github.com/antigravity-uptime)",
      });

      const page = await context.newPage();

      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // Wait a bit for any animations to settle
      await page.waitForTimeout(1000);

      const buffer = await page.screenshot({
        fullPage: true,
        type: "png",
      });

      await context.close();

      return { buffer: Buffer.from(buffer), error: null };
    } finally {
      await browser.close();
    }
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Executable doesn't exist") ||
        error.message.includes("browserType.launch"))
    ) {
      playwrightAvailable = false;
      console.warn(
        "Playwright browser not found. Run: npx playwright install chromium"
      );
    }

    return {
      buffer: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

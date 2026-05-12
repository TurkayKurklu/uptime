import { parseError, parseStatusCode } from "@/lib/error-parser";
import type { CheckResult } from "@/types";

const CHECK_TIMEOUT = 15000; // 15 seconds

/**
 * Performs an HTTP health check on a given URL
 * Returns status, response time, and error details
 */
export async function checkSite(url: string): Promise<CheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "AntigravityUptimeBot/1.0 (+https://github.com/antigravity-uptime)",
      },
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    clearTimeout(timeout);

    const statusError = parseStatusCode(response.status);

    if (statusError) {
      return {
        isUp: false,
        statusCode: response.status,
        responseTime,
        errorMessage: statusError.message,
        errorCategory: statusError.category,
      };
    }

    // Consider "degraded" if response is slow (> 5s) but still successful
    return {
      isUp: true,
      statusCode: response.status,
      responseTime,
      errorMessage: null,
      errorCategory: null,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    clearTimeout(timeout);

    const parsed = parseError(error);

    return {
      isUp: false,
      statusCode: null,
      responseTime,
      errorMessage: parsed.message,
      errorCategory: parsed.category,
    };
  }
}

/**
 * Determines site status based on check result
 */
export function determineSiteStatus(result: CheckResult): string {
  if (!result.isUp) return "down";
  if (result.responseTime > 5000) return "degraded";
  return "up";
}

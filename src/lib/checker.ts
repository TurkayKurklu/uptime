import { parseError, parseStatusCode } from "@/lib/error-parser";
import type { CheckResult } from "@/types";
import https from "https";
import http from "http";
import { URL } from "url";

const CHECK_TIMEOUT = 15000; // 15 seconds

/**
 * Performs an HTTP health check on a given URL
 * Returns status, response time, and detailed timing metrics
 */
export async function checkSite(urlStr: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let dnsTime: number | null = null;
    let connectTime: number | null = null;
    let sslTime: number | null = null;

    try {
      const url = new URL(urlStr);
      const isHttps = url.protocol === "https:";
      const requester = isHttps ? https : http;

      const request = requester.request(
        urlStr,
        {
          method: "GET",
          timeout: CHECK_TIMEOUT,
          headers: {
            "User-Agent":
              "AntigravityUptimeBot/1.0 (+https://github.com/antigravity-uptime)",
          },
        },
        (res) => {
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);
          const statusError = parseStatusCode(res.statusCode || 0);

          resolve({
            isUp: !statusError,
            statusCode: res.statusCode || null,
            responseTime,
            dnsTime,
            connectTime,
            sslTime,
            errorMessage: statusError?.message || null,
            errorCategory: statusError?.category || null,
          });

          // Consume response data to free up memory
          res.on("data", () => {});
          res.on("end", () => {});
        }
      );

      request.on("socket", (socket) => {
        socket.on("lookup", () => {
          dnsTime = Math.round(performance.now() - startTime);
        });
        socket.on("connect", () => {
          connectTime = Math.round(performance.now() - startTime);
        });
        if (isHttps) {
          socket.on("secureConnect", () => {
            sslTime = Math.round(performance.now() - startTime);
          });
        }
      });

      request.on("error", (error) => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        const parsed = parseError(error);
        resolve({
          isUp: false,
          statusCode: null,
          responseTime,
          dnsTime,
          connectTime,
          sslTime,
          errorMessage: parsed.message,
          errorCategory: parsed.category,
        });
      });

      request.on("timeout", () => {
        request.destroy();
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        resolve({
          isUp: false,
          statusCode: null,
          responseTime,
          dnsTime,
          connectTime,
          sslTime,
          errorMessage: "Zaman aşımı (Timeout)",
          errorCategory: "timeout",
        });
      });

      request.end();
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      resolve({
        isUp: false,
        statusCode: null,
        responseTime,
        dnsTime: null,
        connectTime: null,
        sslTime: null,
        errorMessage: error instanceof Error ? error.message : "Geçersiz URL",
        errorCategory: "config",
      });
    }
  });
}

/**
 * Determines site status based on check result
 */
export function determineSiteStatus(result: CheckResult): string {
  if (!result.isUp) return "down";
  if (result.responseTime > 5000) return "degraded";
  return "up";
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSite, determineSiteStatus } from "@/lib/checker";
import { takeScreenshot } from "@/lib/screenshot";
import { uploadScreenshot } from "@/lib/r2";

/**
 * Cron endpoint — checks all active sites
 * Protected by CRON_SECRET header
 * Designed for 30-minute intervals
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sites = await prisma.site.findMany({
      where: { isActive: true },
    });

    if (sites.length === 0) {
      return NextResponse.json({ message: "No active sites to check" });
    }

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        // 1. HTTP health check
        const checkResult = await checkSite(site.url);
        const status = determineSiteStatus(checkResult);

        // 2. Take screenshot (regardless of status)
        let screenshotUrl: string | null = null;
        try {
          const screenshot = await takeScreenshot(site.url);
          if (screenshot.buffer) {
            const key = `${site.id}/${Date.now()}.png`;
            screenshotUrl = await uploadScreenshot(screenshot.buffer, key);
          }
        } catch (screenshotError) {
          console.error(
            `Screenshot failed for ${site.url}:`,
            screenshotError
          );
        }

        // 3. Log the check result
        const log = await prisma.checkLog.create({
          data: {
            siteId: site.id,
            statusCode: checkResult.statusCode,
            responseTime: checkResult.responseTime,
            isUp: checkResult.isUp,
            errorMessage: checkResult.errorMessage,
            errorCategory: checkResult.errorCategory,
            screenshotUrl,
          },
        });

        // 4. Update site status
        await prisma.site.update({
          where: { id: site.id },
          data: {
            lastStatus: status,
            lastCheckedAt: new Date(),
          },
        });

        return {
          siteId: site.id,
          siteName: site.name,
          status,
          responseTime: checkResult.responseTime,
          logId: log.id,
        };
      })
    );

    const summary = results.map((r, i) => ({
      site: sites[i].name,
      status: r.status === "fulfilled" ? r.value.status : "error",
      ...(r.status === "rejected" && { error: String(r.reason) }),
    }));

    return NextResponse.json({
      message: `Checked ${sites.length} sites`,
      results: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron check failed:", error);
    return NextResponse.json(
      { error: "Cron check failed" },
      { status: 500 }
    );
  }
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResponseSpark } from "@/components/ui/response-spark";
import { formatRelativeTime, formatResponseTime } from "@/lib/utils";
import type { SiteWithLogs } from "@/types";
import Link from "next/link";

interface SiteDetailProps {
  siteId: string;
}

export function SiteDetail({ siteId }: SiteDetailProps) {
  const [site, setSite] = useState<SiteWithLogs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await fetch("/api/sites");
        if (res.ok) {
          const sites: SiteWithLogs[] = await res.json();
          const found = sites.find((s) => s.id === siteId);
          setSite(found || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId]);

  if (loading) {
    return (
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="glass p-8 animate-pulse">
          <div className="h-6 w-48 rounded mb-4" style={{ background: "var(--bg-card-hover)" }} />
          <div className="h-4 w-32 rounded" style={{ background: "var(--bg-card-hover)" }} />
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 text-center">
        <p style={{ color: "var(--text-secondary)" }}>Site not found</p>
        <Link href="/" className="text-sm mt-4 inline-block" style={{ color: "var(--neon-neutral)" }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const responseTimes = site.logs.map((l) => l.responseTime ?? 0).reverse().filter((t) => t > 0);
  const upCount = site.logs.filter((l) => l.isUp).length;
  const uptimePercent = site.logs.length ? Math.round((upCount / site.logs.length) * 100) : 0;
  const avgResponse = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <Link href="/" className="text-sm mb-6 inline-flex items-center gap-1.5 transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Dashboard
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">{site.name}</h1>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>
              {site.url} ↗
            </a>
          </div>
          <StatusBadge status={site.lastStatus} size="lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Uptime</p>
            <p className="text-lg font-bold font-mono" style={{ color: uptimePercent >= 99 ? "var(--neon-up)" : uptimePercent >= 95 ? "var(--neon-degraded)" : "var(--neon-down)" }}>
              {uptimePercent}%
            </p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Avg Response</p>
            <p className="text-lg font-bold font-mono text-white">{avgResponse ? formatResponseTime(avgResponse) : "—"}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Total Checks</p>
            <p className="text-lg font-bold font-mono text-white">{site.logs.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Last Check</p>
            <p className="text-lg font-bold text-white">{site.lastCheckedAt ? formatRelativeTime(site.lastCheckedAt) : "Never"}</p>
          </div>
        </div>
      </motion.div>

      {/* Response Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 mb-6">
        <h2 className="text-sm font-medium text-white mb-4">Response Time Trend</h2>
        <ResponseSpark data={responseTimes} width={800} height={100} color="#6366f1" />
      </motion.div>

      {/* Log Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6">
        <h2 className="text-sm font-medium text-white mb-4">Check History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--text-tertiary)" }}>
                <th className="text-left py-2 px-3 text-xs font-medium">Status</th>
                <th className="text-left py-2 px-3 text-xs font-medium">Code</th>
                <th className="text-left py-2 px-3 text-xs font-medium">Response</th>
                <th className="text-left py-2 px-3 text-xs font-medium">Error</th>
                <th className="text-left py-2 px-3 text-xs font-medium">Screenshot</th>
                <th className="text-left py-2 px-3 text-xs font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {site.logs.map((log) => (
                <tr key={log.id} className="border-t" style={{ borderColor: "var(--border-glass)" }}>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={log.isUp ? "up" : "down"} size="sm" showLabel={false} />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs">{log.statusCode ?? "—"}</td>
                  <td className="py-2.5 px-3 font-mono text-xs">{log.responseTime ? formatResponseTime(log.responseTime) : "—"}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: log.errorMessage ? "var(--neon-down)" : "var(--text-tertiary)" }}>
                    {log.errorCategory?.replace(/_/g, " ") || "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    {log.screenshotUrl ? (
                      <a href={log.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: "var(--neon-neutral)" }}>
                        View
                      </a>
                    ) : <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {formatRelativeTime(log.checkedAt)}
                  </td>
                </tr>
              ))}
              {site.logs.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>No checks yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

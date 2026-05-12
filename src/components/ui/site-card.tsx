"use client";

import { motion } from "framer-motion";
import { StatusBadge } from "./status-badge";
import { ResponseSpark } from "./response-spark";
import { formatRelativeTime, formatResponseTime } from "@/lib/utils";
import type { SiteWithLogs } from "@/types";

interface SiteCardProps {
  site: SiteWithLogs;
  onDelete: (id: string) => void;
  onCheck: (id: string) => void;
}

export function SiteCard({ site, onDelete, onCheck }: SiteCardProps) {
  const latestLog = site.logs[0];
  const responseTimes = site.logs
    .slice(0, 20)
    .reverse()
    .map((l) => l.responseTime ?? 0)
    .filter((t) => t > 0);

  const avgResponseTime = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  const sparkColor =
    site.lastStatus === "up" ? "#00ff88" :
    site.lastStatus === "down" ? "#ff3366" :
    site.lastStatus === "degraded" ? "#ffaa00" : "#6366f1";

  const hostname = (() => {
    try { return new URL(site.url).hostname; }
    catch { return site.url; }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="glass glass-hover p-5 cursor-default group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-white truncate">{site.name}</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            {hostname}
          </p>
        </div>
        <StatusBadge status={site.lastStatus} size="sm" />
      </div>

      {/* Spark Chart */}
      <div className="mb-4">
        <ResponseSpark data={responseTimes} width={260} height={40} color={sparkColor} />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Avg Response
          </p>
          <p className="text-sm font-mono font-medium" style={{ color: "var(--text-primary)" }}>
            {avgResponseTime ? formatResponseTime(avgResponseTime) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Status Code
          </p>
          <p className="text-sm font-mono font-medium" style={{ color: "var(--text-primary)" }}>
            {latestLog?.statusCode ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Last Check
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {site.lastCheckedAt ? formatRelativeTime(site.lastCheckedAt) : "Never"}
          </p>
        </div>
      </div>

      {/* Screenshot Preview */}
      {latestLog?.screenshotUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glass)" }}>
          <img
            src={latestLog.screenshotUrl}
            alt={`Screenshot of ${site.name}`}
            className="w-full h-24 object-cover object-top opacity-60 group-hover:opacity-80 transition-opacity"
          />
        </div>
      )}

      {/* Error Message */}
      {latestLog && !latestLog.isUp && latestLog.errorMessage && (
        <div
          className="text-xs px-3 py-2 rounded-lg mb-4"
          style={{ background: "var(--neon-down-dim)", color: "var(--neon-down)" }}
        >
          {latestLog.errorCategory?.replace(/_/g, " ") ?? latestLog.errorMessage}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onCheck(site.id)} className="btn-ghost text-xs py-1.5 px-3 flex-1">
          Check Now
        </button>
        <button onClick={() => onDelete(site.id)} className="btn-danger text-xs py-1.5 px-3">
          Delete
        </button>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const statusConfig = {
  up: {
    label: "Online",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  down: {
    label: "Offline",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  degraded: {
    label: "Sorunlu",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
  },
};

const sizeMap = {
  sm: { dot: 6, text: "text-[10px]", px: "px-2", py: "py-0.5", gap: "gap-1.5" },
  md: { dot: 8, text: "text-[11px]", px: "px-3", py: "py-1", gap: "gap-2" },
  lg: { dot: 10, text: "text-xs", px: "px-4", py: "py-1.5", gap: "gap-2.5" },
};

export function StatusBadge({
  status,
  size = "md",
  showLabel = true,
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? {
    label: "Belirsiz",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.1)",
  };

  const s = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center ${s.gap} ${s.px} ${s.py} rounded-full border border-current transition-all`}
      style={{ background: config.bg, color: config.color, borderColor: 'rgba(0,0,0,0.05)' }}
    >
      <div className="relative flex items-center justify-center">
        {status === "up" || status === "down" ? (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: s.dot * 2.2,
              height: s.dot * 2.2,
              background: config.color,
              opacity: 0.3,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : null}
        <div
          className="rounded-full relative z-10"
          style={{
            width: s.dot,
            height: s.dot,
            background: config.color,
          }}
        />
      </div>
      {showLabel && (
        <span className={`${s.text} font-black uppercase tracking-tighter`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

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
    color: "var(--neon-up)",
    bg: "var(--neon-up-dim)",
    glowClass: "neon-glow-up",
  },
  down: {
    label: "Offline",
    color: "var(--neon-down)",
    bg: "var(--neon-down-dim)",
    glowClass: "neon-glow-down",
  },
  degraded: {
    label: "Degraded",
    color: "var(--neon-degraded)",
    bg: "var(--neon-degraded-dim)",
    glowClass: "neon-glow-degraded",
  },
};

const sizeMap = {
  sm: { dot: 6, text: "text-[11px]", px: "px-2", py: "py-0.5", gap: "gap-1.5" },
  md: { dot: 8, text: "text-xs", px: "px-3", py: "py-1", gap: "gap-2" },
  lg: { dot: 10, text: "text-sm", px: "px-4", py: "py-1.5", gap: "gap-2.5" },
};

export function StatusBadge({
  status,
  size = "md",
  showLabel = true,
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? {
    label: "Unknown",
    color: "var(--text-tertiary)",
    bg: "rgba(255,255,255,0.05)",
    glowClass: "",
  };

  const s = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center ${s.gap} ${s.px} ${s.py} rounded-full`}
      style={{ background: config.bg }}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        {status === "up" || status === "down" ? (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: s.dot * 2.5,
              height: s.dot * 2.5,
              background: config.color,
              opacity: 0.2,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : null}
        {/* Inner dot */}
        <div
          className="rounded-full relative z-10"
          style={{
            width: s.dot,
            height: s.dot,
            background: config.color,
            boxShadow: `0 0 ${s.dot}px ${config.color}`,
          }}
        />
      </div>
      {showLabel && (
        <span
          className={`${s.text} font-medium tracking-wide`}
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

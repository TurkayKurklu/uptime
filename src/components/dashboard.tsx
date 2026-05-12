"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteCard } from "@/components/ui/site-card";
import { AddSiteModal } from "@/components/ui/add-site-modal";
import type { SiteWithLogs } from "@/types";

import { signOut } from "next-auth/react";

export function Dashboard() {
  const [sites, setSites] = useState<SiteWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 30000);
    return () => clearInterval(interval);
  }, [fetchSites]);

  const handleAdd = async (data: { name: string; url: string }) => {
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add site");
    }
    await fetchSites();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return;
    try {
      await fetch(`/api/sites?id=${id}`, { method: "DELETE" });
      setSites((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleCheck = async (id: string) => {
    setCheckingId(id);
    try {
      await fetch("/api/cron", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}` },
      });
      await fetchSites();
    } finally {
      setCheckingId(null);
    }
  };

  const upCount = sites.filter((s) => s.lastStatus === "up").length;
  const downCount = sites.filter((s) => s.lastStatus === "down").length;
  const degradedCount = sites.filter((s) => s.lastStatus === "degraded").length;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gradient-brand">Antigravity</h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Uptime monitoring & visual regression engine
          </p>
        </div>

        <button 
          onClick={() => signOut()}
          className="btn-ghost text-xs py-2 px-4"
        >
          Logout
        </button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--neon-up)" }} />
            <span className="text-sm font-medium">{upCount} Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--neon-down)" }} />
            <span className="text-sm font-medium">{downCount} Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--neon-degraded)" }} />
            <span className="text-sm font-medium">{degradedCount} Degraded</span>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2 px-5">
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Site
          </span>
        </button>
      </motion.div>

      {/* Site Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass p-5 animate-pulse" style={{ height: 220 }}>
              <div className="h-4 w-1/2 rounded" style={{ background: "var(--bg-card-hover)" }} />
              <div className="h-3 w-1/3 rounded mt-2" style={{ background: "var(--bg-card-hover)" }} />
              <div className="h-10 rounded mt-6" style={{ background: "var(--bg-card-hover)" }} />
            </div>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="empty-state-icon mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No sites monitored yet</h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Add your first site to start monitoring
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Your First Site
            </span>
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onDelete={handleDelete}
                onCheck={handleCheck}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AddSiteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { AddSiteModal } from "@/components/ui/add-site-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import type { SiteWithLogs } from "@/types";
import Link from "next/link";

export function Dashboard() {
  const [sites, setSites] = useState<SiteWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    const interval = setInterval(fetchSites, 60000);
    return () => clearInterval(interval);
  }, [fetchSites]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/sites?id=${id}`, { method: "DELETE" });
    fetchSites();
  };

  const upCount = sites.filter((s) => s.lastStatus === "up").length;
  const downCount = sites.filter((s) => s.lastStatus === "down").length;

  return (
    <div className="flex min-h-screen bg-[#f5f5f9]">
      {/* Sidebar */}
      <aside className={`sidebar w-64 fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 lg:relative lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-up rounded-md flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">UPTIME</span>
        </div>

        <nav className="mt-6">
          <Link href="/" className="sidebar-item active">
            <svg className="mr-3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Dashboard
          </Link>
          <button onClick={() => setModalOpen(true)} className="sidebar-item w-[calc(100%-20px)]">
            <svg className="mr-3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Monitor
          </button>
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-4">
          <button onClick={() => signOut()} className="sidebar-item w-full justify-center bg-white/5 hover:bg-white/10 text-white">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Auto-refresh in 60s</span>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="widget-card flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase mb-1">Total Monitors</p>
                <h3 className="text-3xl font-bold">{sites.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
            </div>
            <div className="widget-card flex items-center justify-between border-l-4 border-up">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase mb-1">Up Monitors</p>
                <h3 className="text-3xl font-bold text-up">{upCount}</h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-up">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div className="widget-card flex items-center justify-between border-l-4 border-down">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase mb-1">Down Monitors</p>
                <h3 className="text-3xl font-bold text-down">{downCount}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-down">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>
          </div>

          {/* Monitors Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">My Monitors</h3>
              <button onClick={() => setModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                + Add New
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading monitors...</div>
            ) : sites.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">You haven't added any monitors yet.</p>
                <button onClick={() => setModalOpen(true)} className="bg-up text-white px-6 py-2 rounded-lg font-bold">
                  Create Your First Monitor
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {sites.map((site) => (
                  <div key={site.id} className="monitor-row flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <StatusBadge status={site.lastStatus} size="sm" showLabel={false} />
                      <div className="min-w-0">
                        <Link href={`/sites/${site.id}`} className="font-bold text-gray-800 hover:text-blue-600 truncate block">
                          {site.name}
                        </Link>
                        <p className="text-xs text-gray-400 truncate">{site.url}</p>
                      </div>
                    </div>

                    <div className="flex-1 hidden md:flex flex-col items-center">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Last Checked</p>
                      <p className="text-xs font-medium">{site.lastCheckedAt ? formatRelativeTime(site.lastCheckedAt) : "Never"}</p>
                    </div>

                    <div className="flex-1 hidden lg:flex flex-col items-center">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Uptime (24h)</p>
                      <div className="uptime-bar">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className={`uptime-tick ${site.lastStatus === "up" ? "bg-up" : "bg-down"} opacity-${100 - i * 4}`} />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => handleDelete(site.id)} className="p-2 text-gray-400 hover:text-down transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AddSiteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={async (d) => {
        await fetch("/api/sites", { method: "POST", body: JSON.stringify(d) });
        fetchSites();
      }} />
    </div>
  );
}

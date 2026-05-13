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
    if (!confirm("Bu izlemeyi silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/sites?id=${id}`, { method: "DELETE" });
    fetchSites();
  };

  const handleRunChecks = async () => {
    const btn = document.getElementById("run-checks-btn");
    if (btn) btn.innerText = "Kontrol Ediliyor...";
    try {
      await fetch("/api/cron", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "sifre123"}` },
      });
      fetchSites();
    } finally {
      if (btn) btn.innerText = "Kontrolleri Çalıştır";
    }
  };

  const upCount = sites.filter((s) => s.lastStatus === "up").length;
  const downCount = sites.filter((s) => s.lastStatus === "down").length;

  return (
    <div className="flex min-h-screen bg-main-bg">
      {/* Sidebar */}
      <aside className={`sidebar w-64 fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 lg:relative lg:translate-x-0`}>
        <div className="px-8 py-12 mb-4 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] p-4 backdrop-blur-md border border-white/10 shadow-2xl transition-transform hover:scale-110">
              <img src="/webisse-icon.png" alt="Webisse" className="w-full h-full object-contain" />
            </div>
          </div>
          <span className="font-black text-2xl tracking-[0.3em] text-white">WEBISSE</span>
          <div className="h-1 w-10 bg-primary rounded-full mt-3 opacity-60" />
        </div>

        <nav className="flex flex-col gap-1">
          <Link href="/" className="sidebar-item active">
            <svg className="mr-3 opacity-70" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Panel
          </Link>
          <button onClick={() => setModalOpen(true)} className="sidebar-item w-[calc(100%-24px)] text-left">
            <svg className="mr-3 opacity-70" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni İzleme Ekle
          </button>
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-6">
          <button onClick={() => signOut()} className="flex items-center gap-2 w-full p-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 glass-header px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -ml-2 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sistem Paneli</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Genel Bakış ve Durum</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              id="run-checks-btn"
              onClick={handleRunChecks}
              className="hidden md:flex items-center gap-2 btn-secondary text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Manuel Kontrol
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block" />
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Yeni İzleme
            </button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="widget-card group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Toplam İzleme</span>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-slate-800">{sites.length}</h3>
            </div>
            <div className="widget-card group border-b-4 border-b-up">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Online Siteler</span>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-up group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-up">{upCount}</h3>
            </div>
            <div className="widget-card group border-b-4 border-b-down">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Offline Siteler</span>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-down group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-down">{downCount}</h3>
            </div>
          </div>

          {/* Monitors Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">İzlenen Adresler</h3>
              <span className="text-xs text-slate-400 font-semibold uppercase">60 Saniyede Bir Yenilenir</span>
            </div>

            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Yükleniyor...</p>
              </div>
            ) : sites.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-slate-500 font-medium mb-6">Henüz bir site eklemediniz.</p>
                <button onClick={() => setModalOpen(true)} className="btn-primary">
                  İlk İzlemeyi Oluştur
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sites.map((site) => (
                  <div key={site.id} className="monitor-row flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <StatusBadge status={site.lastStatus} size="sm" showLabel={false} />
                      <div className="min-w-0">
                        <Link href={`/sites/${site.id}`} className="font-bold text-slate-800 hover:text-primary transition-colors truncate block text-base mb-0.5">
                          {site.name}
                        </Link>
                        <p className="text-xs text-slate-400 font-medium truncate">{site.url}</p>
                      </div>
                    </div>

                    <div className="flex-1 hidden md:flex flex-col items-center">
                      <p className="text-[10px] text-slate-300 uppercase font-black mb-1">Son Kontrol</p>
                      <p className="text-xs font-bold text-slate-600">{site.lastCheckedAt ? formatRelativeTime(site.lastCheckedAt) : "Henüz Yapılmadı"}</p>
                    </div>

                    <div className="flex-1 hidden lg:flex flex-col items-center">
                      <p className="text-[10px] text-slate-300 uppercase font-black mb-1">Uptime (Son 24 Saat)</p>
                      <div className="flex gap-1">
                        {[...Array(15)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-5 rounded-full ${site.lastStatus === "up" ? "bg-up" : "bg-down"} opacity-${Math.max(20, 100 - i * 6)}`} />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-8">
                      <button onClick={() => handleDelete(site.id)} className="p-2.5 text-slate-300 hover:text-down hover:bg-red-50 rounded-xl transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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

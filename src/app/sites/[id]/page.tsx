"use client";

import { useState, useEffect, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export default function SiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sites`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((s: any) => s.id === id);
        setSite(found);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!site) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-main-bg p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Site Bulunamadı</h1>
      <Link href="/" className="text-primary font-bold hover:underline">Panale Dön</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-main-bg p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Panele Geri Dön
          </Link>
          <div className="flex gap-3">
             <button onClick={() => window.location.reload()} className="p-2.5 bg-white border rounded-xl text-slate-500 hover:text-primary transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
             </button>
          </div>
        </header>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{site.name}</h1>
                <StatusBadge status={site.lastStatus} size="lg" />
              </div>
              <p className="text-slate-400 font-medium text-lg">{site.url}</p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-[10px] text-slate-300 font-black uppercase mb-1">Durum</p>
                <p className={`text-lg font-bold ${site.lastStatus === 'up' ? 'text-up' : 'text-down'}`}>
                  {site.lastStatus === 'up' ? 'Aktif' : 'Erişilemiyor'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Last Screenshot */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Son Ekran Görüntüsü
              </h3>
              {site.logs?.[0]?.screenshotUrl ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 group">
                  <img 
                    src={site.logs[0].screenshotUrl} 
                    alt="Canlı durum"
                    className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <p className="font-semibold text-sm">Henüz ekran görüntüsü alınmadı.</p>
                </div>
              )}
            </div>

            {/* Recent Logs */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                Olay Geçmişi
              </h3>
              <div className="space-y-4">
                {site.logs?.length > 0 ? site.logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-white hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'up' ? 'bg-up' : 'bg-down'}`} />
                      <span className="text-sm font-bold text-slate-700 uppercase">{log.status === 'up' ? 'Online' : 'Offline'}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold group-hover:text-slate-600 transition-colors">
                      {formatDistanceToNow(new Date(log.checkedAt), { addSuffix: true, locale: tr })}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 font-medium">Henüz bir olay kaydedilmedi.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { CheckLogData } from "@/types";

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
    <div className="min-h-screen flex items-center justify-center bg-main-bg text-slate-400">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!site) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-main-bg p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">İzleme Bulunamadı</h1>
      <Link href="/" className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">Panele Geri Dön</Link>
    </div>
  );

  const latestLog = site.logs?.[0] as CheckLogData | undefined;

  return (
    <div className="min-h-screen bg-main-bg pb-20">
      {/* Header & Title */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-10 mb-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary transition-all uppercase mb-6 group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><polyline points="15 18 9 12 15 6"/></svg>
            Tüm İzlemeler
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{site.name}</h1>
                <StatusBadge status={site.lastStatus} size="lg" />
              </div>
              <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {site.url}
              </p>
            </div>
            
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-white hover:shadow-md transition-all active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Yenile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 space-y-10">
        
        {/* --- NETWORK ANALYZER PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Timing Visualization */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                <div className="w-2 h-6 bg-primary rounded-full" />
                Network Analizörü
              </h3>
              <span className="text-xs font-black text-slate-400 uppercase">Son Ölçüm: {latestLog ? formatDistanceToNow(new Date(latestLog.checkedAt), { addSuffix: true, locale: tr }) : "-"}</span>
            </div>

            {latestLog ? (
              <div className="space-y-10">
                {/* Visual Timeline Bar */}
                <div className="relative h-14 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner">
                  {latestLog.dnsTime && (
                    <div 
                      className="h-full bg-indigo-500 relative group" 
                      style={{ width: `${Math.max(5, (latestLog.dnsTime / (latestLog.responseTime || 1)) * 100)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">DNS</div>
                    </div>
                  )}
                  {latestLog.connectTime && (
                    <div 
                      className="h-full bg-blue-500 relative group" 
                      style={{ width: `${Math.max(5, (latestLog.connectTime / (latestLog.responseTime || 1)) * 100)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">TCP</div>
                    </div>
                  )}
                  {latestLog.sslTime && (
                    <div 
                      className="h-full bg-purple-500 relative group" 
                      style={{ width: `${Math.max(5, (latestLog.sslTime / (latestLog.responseTime || 1)) * 100)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">SSL</div>
                    </div>
                  )}
                  <div className="h-full bg-emerald-500 flex-1 relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">YÜKLEME</div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { label: "DNS Çözümleme", value: latestLog.dnsTime, color: "text-indigo-600", bg: "bg-indigo-50" },
                     { label: "Bağlantı (TCP)", value: latestLog.connectTime, color: "text-blue-600", bg: "bg-blue-50" },
                     { label: "SSL Sertifika", value: latestLog.sslTime, color: "text-purple-600", bg: "bg-purple-50" },
                     { label: "Toplam Yanıt", value: latestLog.responseTime, color: "text-emerald-600", bg: "bg-emerald-50" }
                   ].map((item, i) => (
                     <div key={i} className={`${item.bg} rounded-2xl p-5 border border-white transition-transform hover:scale-105`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{item.label}</p>
                        <p className={`text-2xl font-black ${item.color}`}>{item.value ? `${item.value}ms` : "N/A"}</p>
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 font-bold">Analiz verisi bekleniyor...</div>
            )}
          </div>

          {/* Status & Error Reason */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col justify-center text-center">
             <h3 className="text-xs font-black text-slate-300 uppercase mb-4 tracking-widest">Hata Sebebi / Not</h3>
             {latestLog?.isUp ? (
               <div className="space-y-3">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <p className="text-slate-800 font-black text-lg">Sistem Sağlıklı</p>
                 <p className="text-slate-400 text-sm font-medium">Herhangi bir sorun tespit edilmedi.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </div>
                 <p className="text-red-600 font-black text-lg uppercase tracking-tight">Kritik Hata!</p>
                 <p className="text-slate-600 text-sm font-bold bg-slate-50 p-4 rounded-xl border border-slate-100 leading-tight">
                   {latestLog?.errorMessage || "Bağlantı Reddedildi (Refused)"}
                 </p>
               </div>
             )}
          </div>
        </div>

        {/* --- SECONDARY PANEL: SCREENSHOT & HISTORY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Screenshot Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Son Ekran Görüntüsü
                  </h3>
                  {latestLog?.screenshotUrl && (
                    <a href={latestLog.screenshotUrl} target="_blank" className="text-[10px] font-black text-primary hover:underline uppercase">Tam Boyutu Gör</a>
                  )}
                </div>
                
                <div className="p-4">
                  {latestLog?.screenshotUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner group cursor-zoom-in">
                      <img 
                        src={latestLog.screenshotUrl} 
                        alt="Monitor Screenshot" 
                        className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      </div>
                      <p className="font-bold text-sm">Görüntü İşleniyor...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event History Panel */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                  Olay Geçmişi
                </h3>
              </div>
              <div className="p-6 flex-1 overflow-y-auto max-h-[600px] space-y-3">
                {site.logs?.map((log: any) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${log.isUp ? 'bg-up animate-pulse' : 'bg-down'}`} />
                      <span className="text-xs font-black text-slate-800 uppercase">{log.isUp ? 'UP' : 'DOWN'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{formatDistanceToNow(new Date(log.checkedAt), { addSuffix: true, locale: tr })}</p>
                      <p className="text-[10px] text-slate-300 font-black">{log.responseTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

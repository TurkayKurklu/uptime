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
      <div className="glass-header pt-12 pb-10 px-10 mb-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <Link href="/" className="absolute top-8 left-10 hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><polyline points="15 18 9 12 15 6"/></svg>
            Panoya Dön
          </Link>
          
          <div className="mb-6 transition-transform hover:scale-110 duration-500">
            <img src="/webisse-icon.png" alt="Webisse" className="w-20 h-20 object-contain drop-shadow-2xl" />
          </div>

          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{site.name}</h1>
              <StatusBadge status={site.lastStatus} size="md" />
            </div>
            <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
              <svg className="opacity-30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              {site.url}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setLoading(true);
                window.location.reload();
              }} 
              className="btn-secondary flex items-center gap-2 text-xs px-8"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Verileri Yenile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 space-y-10">
        
        {/* --- NETWORK ANALYZER PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Timing Visualization */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                  <div className="w-2 h-6 bg-primary rounded-full" />
                  Network Analizörü
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sinyal ve Yanıt Performansı</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase">Son Ölçüm: {latestLog ? formatDistanceToNow(new Date(latestLog.checkedAt), { addSuffix: true, locale: tr }) : "-"}</span>
              </div>
            </div>

            {latestLog ? (
              <div className="space-y-12">
                {/* Visual Timeline Bar */}
                <div className="relative h-16 w-full bg-slate-50 rounded-2xl p-2 border border-slate-100 overflow-hidden flex shadow-inner">
                  {latestLog.dnsTime && (
                    <div 
                      className="h-full bg-indigo-500 rounded-l-lg relative group transition-all hover:brightness-110" 
                      style={{ width: `${Math.max(8, (latestLog.dnsTime / (latestLog.responseTime || 1)) * 100)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">DNS</div>
                    </div>
                  )}
                  {latestLog.connectTime && (
                    <div 
                      className="h-full bg-blue-500 relative group transition-all hover:brightness-110" 
                      style={{ width: `${Math.max(8, (latestLog.connectTime / (latestLog.responseTime || 1)) * 100)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">TCP</div>
                    </div>
                  )}
                  {latestLog.sslTime && (
                    <div 
                      className="h-full bg-purple-500 relative group transition-all hover:brightness-110" 
                      style={{ width: `${Math.max(8, (latestLog.sslTime / (latestLog.responseTime || 1)) * 100)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">SSL</div>
                    </div>
                  )}
                  <div className="h-full bg-emerald-500 flex-1 rounded-r-lg relative group transition-all hover:brightness-110">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">DATA</div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { label: "DNS Çözümleme", value: latestLog.dnsTime, color: "text-indigo-600", bg: "bg-indigo-50/30", icon: "DNS" },
                     { label: "Bağlantı (TCP)", value: latestLog.connectTime, color: "text-blue-600", bg: "bg-blue-50/30", icon: "TCP" },
                     { label: "SSL Sertifika", value: latestLog.sslTime, color: "text-purple-600", bg: "bg-purple-50/30", icon: "SSL" },
                     { label: "Toplam Yanıt", value: latestLog.responseTime, color: "text-emerald-600", bg: "bg-emerald-50/30", icon: "RSP" }
                   ].map((item, i) => (
                     <div key={i} className={`${item.bg} rounded-3xl p-6 border border-white shadow-sm transition-all hover:-translate-y-1`}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                          <span className="text-[10px] font-black opacity-20">{item.icon}</span>
                        </div>
                        <p className={`text-3xl font-black ${item.color}`}>{item.value ? `${item.value}ms` : "N/A"}</p>
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 font-bold">Analiz verisi bekleniyor...</div>
            )}
          </div>

          {/* Status & Error Reason */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
             <div className="mb-8">
               {latestLog?.isUp ? (
                 <div className="space-y-4">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-100/50">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                   </div>
                   <div>
                     <p className="text-slate-900 font-black text-xl mb-1">Sistem Sağlıklı</p>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Normal Çalışıyor</p>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-red-100/50">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                   </div>
                   <div>
                     <p className="text-red-600 font-black text-xl mb-1 uppercase">Kritik Hata</p>
                     <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Sistem Çevrimdışı</p>
                   </div>
                 </div>
               )}
             </div>

             <div className="w-full">
               <p className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-widest">Hata Kaydı / Not</p>
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-[80px] flex items-center justify-center">
                  <p className="text-slate-600 text-xs font-bold leading-relaxed">
                    {latestLog?.isUp ? "Şu anda tüm parametreler normal görünüyor. Herhangi bir kesinti tespit edilmedi." : (latestLog?.errorMessage || "Bağlantı Zaman Aşımı (Timeout)")}
                  </p>
               </div>
             </div>
          </div>
        </div>

        {/* --- SECONDARY PANEL: FULL WIDTH HISTORY --- */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                Olay Geçmişi
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Son 20 Kontrolün Detaylı Özeti</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200/50">
              <div className="w-2 h-2 rounded-full bg-up animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase">Canlı Takip Aktif</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-10 py-6">Durum</th>
                  <th className="px-10 py-6">Yanıt Süresi</th>
                  <th className="px-10 py-6">Kontrol Zamanı</th>
                  <th className="px-10 py-6 text-right">Hata / Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {site.logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${log.isUp ? 'bg-up shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-down shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                        <span className={`text-xs font-black uppercase tracking-tight ${log.isUp ? 'text-up' : 'text-down'}`}>
                          {log.isUp ? 'AKTİF' : 'OFFLINE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{log.responseTime}ms</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${log.responseTime < 300 ? 'bg-up' : log.responseTime < 800 ? 'bg-indigo-400' : 'bg-down'}`} 
                            style={{ width: `${Math.min(100, (log.responseTime / 1500) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-500">{formatDistanceToNow(new Date(log.checkedAt), { addSuffix: true, locale: tr })}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-xs font-medium text-slate-400 italic">
                        {log.isUp ? "Başarılı bağlantı sağlandı." : (log.errorMessage || "Bağlantı Hatası")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!site.logs || site.logs.length === 0) && (
              <div className="p-20 text-center text-slate-300 font-bold">Henüz olay geçmişi kaydı bulunmuyor.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

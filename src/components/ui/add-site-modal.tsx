"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; url: string }) => Promise<void>;
}

export function AddSiteModal({ isOpen, onClose, onAdd }: AddSiteModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), url: url.trim() });
      setName("");
      setUrl("");
      onClose();
    } catch (err) {
      setError("İzleme eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Yeni İzleme Ekle</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">Sitenizi 7/24 takip etmeye başlayın.</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">İzleme Adı</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  placeholder="Örn: Benim Blog Sitem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">URL Adresi (veya IP)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-down font-bold">{error}</p>}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all">
                  İptal
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {loading ? "Ekleniyor..." : "İzlemeyi Başlat"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

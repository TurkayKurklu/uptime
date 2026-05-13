"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) router.push("/login");
    else {
        alert("Kayıt sırasında bir hata oluştu!");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main-bg flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 mb-12">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200 border border-slate-100 p-4">
          <img src="/webisse-icon.png" alt="Webisse" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-4xl font-black tracking-[0.2em] text-slate-900">WEBISSE</h1>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-slate-800 text-center">Hesap Oluştur</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ad Soyad</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">E-posta Adresi</label>
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="isim@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Şifre</label>
            <input
              type="password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98]">
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Zaten üye misiniz? <Link href="/login" className="text-primary font-bold hover:underline">Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
}

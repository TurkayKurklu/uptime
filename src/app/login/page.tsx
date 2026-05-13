"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result?.error) {
      router.push("/");
      router.refresh();
    } else {
      alert("Hatalı e-posta veya şifre!");
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
        <h2 className="text-2xl font-bold mb-8 text-slate-800 text-center">Hoş Geldiniz</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Hesabınız yok mu? <Link href="/register" className="text-primary font-bold hover:underline">Hemen Kaydolun</Link>
        </p>
      </div>
    </div>
  );
}

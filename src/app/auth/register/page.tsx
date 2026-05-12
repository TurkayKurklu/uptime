"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/auth/login");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">Create Account</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Join Antigravity Uptime Monitoring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-glass"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-glass"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              type="password"
              className="input-glass"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: "var(--neon-down)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            <span>{loading ? "Creating account..." : "Register"}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--neon-neutral)" }}>
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

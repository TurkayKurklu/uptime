"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">Welcome Back</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Login to your Antigravity account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <span>{loading ? "Logging in..." : "Login"}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-medium hover:underline" style={{ color: "var(--neon-neutral)" }}>
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

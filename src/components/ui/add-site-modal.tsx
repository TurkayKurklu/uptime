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
    if (!name.trim() || !url.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), url: url.trim() });
      setName("");
      setUrl("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add site");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-1">Add New Site</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Enter the URL you want to monitor
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Site Name
                </label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="My Website"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  URL
                </label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "var(--neon-down)" }}>{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  <span>{loading ? "Adding..." : "Add Site"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

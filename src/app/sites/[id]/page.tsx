"use client";

import { useState, useEffect, use } from "react";
import { formatDistanceToNow } from "date-fns";
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

  if (loading) return <div className="p-10 text-center">Loading details...</div>;
  if (!site) return <div className="p-10 text-center">Site not found.</div>;

  return (
    <div className="min-h-screen bg-[#f5f5f9] p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm font-bold text-blue-600 mb-6 inline-block">← Back to Dashboard</Link>
        
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{site.name}</h1>
              <p className="text-gray-500">{site.url}</p>
            </div>
            <StatusBadge status={site.lastStatus} size="lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Last Screenshot */}
            <div>
              <h3 className="text-lg font-bold mb-4">Latest Screenshot</h3>
              {site.logs?.[0]?.screenshotUrl ? (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <img 
                    src={site.logs[0].screenshotUrl} 
                    alt="Latest status"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  No screenshot available yet.
                </div>
              )}
            </div>

            {/* Recent Logs */}
            <div>
              <h3 className="text-lg font-bold mb-4">Recent Events</h3>
              <div className="space-y-3">
                {site.logs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <StatusBadge status={log.status} size="sm" />
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(log.checkedAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

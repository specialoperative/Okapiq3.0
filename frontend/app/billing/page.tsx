"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function BillingPage() {
  const { user, token, loading } = useAuth();
  const [status, setStatus] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001').replace(/\/$/, "");

  React.useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBase}/auth/subscription-status`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('status_failed');
        const data = await res.json();
        setStatus(data);
      } catch {
        setError('Unable to load subscription status');
      }
    };
    run();
  }, [token, apiBase]);

  const onUpgrade = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/auth/upgrade-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: 'professional' })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {}
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      {loading && <p>Loading…</p>}
      {!loading && !user && (
        <p className="text-sm">You are not signed in. <a href="/signin" className="text-emerald-700">Sign in</a></p>
      )}
      {user && (
        <div className="space-y-4">
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-gray-600">Current plan</div>
            <div className="text-lg font-semibold">{user.subscription_tier || 'Free'}</div>
            {status && (
              <div className="mt-2 text-sm text-gray-600">{status.detail || ''}</div>
            )}
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>
          <div className="flex gap-3">
            <button onClick={onUpgrade} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Upgrade to Professional</button>
            <a href="/account" className="px-4 py-2 rounded border">Back to Account</a>
          </div>
        </div>
      )}
    </main>
  );
}



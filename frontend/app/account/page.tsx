"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AccountPage() {
  const { user, loading, refreshMe, logout } = useAuth();
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => { if (!loading) refreshMe(); }, [loading, refreshMe]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      {loading && <p>Loading…</p>}
      {!loading && !user && (
        <p className="text-sm">You are not signed in. <a href="/signin" className="text-emerald-700">Sign in</a></p>
      )}
      {user && (
        <div className="space-y-4">
          <div className="rounded border p-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Full name</div>
                <div className="font-medium">{user.full_name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Company</div>
                <div className="font-medium">{user.company || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Plan</div>
                <div className="font-medium">{user.subscription_tier || "Free"}</div>
              </div>
            </div>
          </div>

          {message && <p className="text-sm text-emerald-700">{message}</p>}

          <div className="flex gap-3">
            <a href="/billing" className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Manage billing</a>
            <button onClick={logout} className="px-4 py-2 rounded border">Sign out</button>
          </div>
        </div>
      )}
    </main>
  );
}



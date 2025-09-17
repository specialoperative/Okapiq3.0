"use client";

import React from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001').replace(/\/$/, "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      // Placeholder: backend endpoint not implemented yet; show success message
      // When implemented, call: `${apiBase}/auth/forgot-password`
      setMessage('If an account exists for this email, you will receive reset instructions shortly.');
    } catch {
      setMessage('Please try again later.');
    }
  };

  return (
    <main className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Reset your password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="you@company.com" />
        </div>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        <button type="submit" className="w-full bg-emerald-600 text-white rounded-md py-2 font-medium hover:bg-emerald-700">Send reset link</button>
        <div className="text-sm mt-2">
          <a href="/signin" className="text-emerald-700 hover:text-emerald-900">Back to sign in</a>
        </div>
      </form>
    </main>
  );
}



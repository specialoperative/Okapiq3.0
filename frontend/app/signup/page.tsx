"use client";

import React from "react";

export default function SignUpPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001').replace(/\/$/, "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, company })
      });
      if (res.ok) {
        setMessage('Account created! You can now sign in.');
      } else {
        const err = await res.json().catch(()=>({detail:'Failed to sign up'}));
        setMessage(err?.detail || 'Failed to sign up');
      }
    } catch {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <main className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input value={fullName} onChange={(e)=>setFullName(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company (optional)</label>
          <input value={company} onChange={(e)=>setCompany(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="••••••••" />
        </div>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        <button type="submit" className="w-full bg-emerald-600 text-white rounded-md py-2 font-medium hover:bg-emerald-700">Create account</button>
        <div className="text-sm mt-2">
          <a href="/signin" className="text-emerald-700 hover:text-emerald-900">Already have an account? Sign in</a>
        </div>
      </form>
    </main>
  );
}



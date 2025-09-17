"use client";

import React from "react";
import { useAuth } from "./AuthProvider";

export default function LoginMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open]);

  if (!user) {
    return (
      <a
        href="/signin"
        className="text-gray-700 hover:text-black"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-700 hover:text-black hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-medium">
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:block text-sm font-medium">
          {user.full_name || user.email}
        </span>
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              {user.subscription_tier && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full capitalize">
                  {user.subscription_tier}
                </span>
              )}
            </div>
            <a href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              Account Settings
            </a>
            <a href="/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              Billing & Subscription
            </a>
            <div className="border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



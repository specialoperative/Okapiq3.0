"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import AIChat from './AIChat';

export default function AIChatWrapper() {
  const pathname = usePathname();
  
  // Convert pathname to readable page name
  const getPageName = (path: string) => {
    if (path === '/') return 'Landing Page';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/oppy') return 'Market Scanner';
    if (path === '/fragment-finder') return 'Fragment Finder';
    if (path === '/crm') return 'CRM';
    if (path === '/pricing') return 'Pricing';
    if (path === '/signin') return 'Sign In';
    if (path === '/signup') return 'Sign Up';
    if (path === '/account') return 'Account Settings';
    if (path === '/billing') return 'Billing';
    if (path === '/case-studies') return 'Case Studies';
    
    // Fallback: capitalize and clean up path
    return path
      .split('/')
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '))
      .join(' > ') || 'Home';
  };

  return <AIChat currentPage={getPageName(pathname)} />;
}

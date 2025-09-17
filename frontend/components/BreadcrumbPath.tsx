"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

function toTitle(label: string): string {
  return label
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BreadcrumbPath() {
  const pathname = usePathname() || '/';
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0) {
    return <span className="text-gray-500">Home</span>;
  }

  let acc = '';
  return (
    <span className="flex items-center gap-2">
      {parts.map((seg, idx) => {
        acc += `/${seg}`;
        const isLast = idx === parts.length - 1;
        const label = toTitle(seg);
        return (
          <span key={acc} className="flex items-center gap-2">
            {!isLast ? (
              <a href={acc} className="text-emerald-700 hover:text-emerald-900">
                {label}
              </a>
            ) : (
              <span className="text-gray-800 font-medium">{label}</span>
            )}
            {!isLast && <span className="text-gray-400">/</span>}
          </span>
        );
      })}
    </span>
  );
}



"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MarketScannerPage from "@/components/market-scanner-page";
import { Button } from "@/ui/button";

export default function OppyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-open scanner with provided location
  useEffect(() => {
    // The MarketScannerPage already exposes controls; it will read location via props we pass below
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      {/* Rely on global layout header; keep solid background */}

      <header className="bg-[#fcfbfa] py-12 border-b border-okapi-brown-200">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-okapi-brown-900">Oppy – Opportunity Finder</h1>
          <p className="text-okapi-brown-700 mt-4 text-lg max-w-3xl">
            Scan markets without API keys. Use mock public data to find SMB leads, score opportunities, and export CRM-ready lists.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <MarketScannerPage
          showHeader={false}
          onNavigate={(page: string) => {
            // Keep SPA nav compatibility while allowing deep-links
            router.push(`/?page=${page}`);
          }}
          // Pass initial location from query if present
          initialLocation={searchParams.get("location") || undefined}
        />
      </main>
    </div>
  );
}



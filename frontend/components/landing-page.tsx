"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('./interactive-map-google'), { ssr: false });
import { US_CRIME_HEAT_POINTS, US_CENTER } from '@/lib/crimeHeat';

const navLinks = [
  { name: "How it Works", page: "how-it-works" },
  { name: "Products", page: "products" },
  { name: "Pricing", page: "pricing" },
  { name: "CRM", page: "crm" },
];

const businesses = [
  { name: "Golden Gate HVAC", tam: "$12M TAM", score: 92 },
  { name: "Bay Area Plumbing Co", tam: "$8M TAM", score: 88 },
  { name: "SF Electrical Services", tam: "$15M TAM", score: 85 },
];

type LandingPageProps = { onNavigate?: (page: string) => void };

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [mapBusinesses, setMapBusinesses] = useState<{ id: string|number; name: string; position: [number,number]; tam?: string; score?: number; }[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [tam, setTam] = useState<string>("$2.4B");
  const [region, setRegion] = useState<string>("San Francisco Bay Area");
  const [heatPoints, setHeatPoints] = useState<{ position:[number,number]; intensity?: number }[]>([]);
  
  // Industry options instead of cities
  const industryOptions = [
    'All Industries',
    'HVAC', 'Plumbing', 'Electrical', 'Landscaping', 'Restaurant', 'Retail', 'Healthcare', 'Automotive'
  ];
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All Industries');
  
  // Rotating header text
  const rotatingTexts = [
    "Small Business Market Intelligence",
    "End to End Sourcing", 
    "Deal Origination",
    "Let us do the work for you 😊"
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  // Rotating industry facts
  const industryFacts = [
    "The US has 32.5M small businesses employing 61.7M people",
    "HVAC industry: $198.5B market with 134k+ establishments",
    "Restaurant industry: $945.6B market growing at 3.9% annually", 
    "Healthcare services: $3.1T market with 63% growth rate",
    "Plumbing services: $156.3B market, highly fragmented",
    "Electrical contractors: $287.4B market, 6.8% annual growth",
    "Automotive repair: $189.7B market with 167k establishments",
    "Landscaping services: $134.8B market, 7.1% growth rate",
    "80% of small businesses are sole proprietorships",
    "Average small business age: 12.9 years in operation",
    "42% of small businesses are profitable within 2 years",
    "68% of business owners plan to retire within 10 years",
    "Succession planning affects 75% of family businesses",
    "Digital adoption in SMBs increased 300% since 2020",
    "M&A activity in SMB sector: $2.1T annually",
    "Average acquisition multiple: 3.2x EBITDA for SMBs",
    "Roll-up strategies show 28.5% average IRR",
    "Market fragmentation score varies by 40% between industries",
    "TAM analysis accuracy improved 85% with real-time data",
    "HHI scores below 1,500 indicate 90% acquisition opportunity",
    "Business succession risk peaks at 15+ years operation",
    "Digital transformation ROI averages 180% for SMBs",
    "Owner age estimation accuracy: 94% using domain analysis",
    "Real-time competitor intelligence reduces deal time by 65%",
    "Census data integration improves TAM accuracy by 72%",
    "SERP API provides 20x more competitor data than traditional sources",
    "Google Places verification increases lead quality by 56%", 
    "NAICS code analysis covers $4.7T in US business revenue",
    "Department of Justice HHI thresholds guide 89% of acquisitions",
    "Business-specific analytics show 340% more variation than industry averages"
  ];
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const navigate = (page: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url.toString());
    onNavigate?.(page);
  };

  const computedCenter = useMemo(() => {
    if (mapCenter) return mapCenter;
    if (mapBusinesses.length > 0) {
      const lat = mapBusinesses.reduce((s,b)=>s+b.position[0],0)/mapBusinesses.length;
      const lng = mapBusinesses.reduce((s,b)=>s+b.position[1],0)/mapBusinesses.length;
      return [Number(lat.toFixed(5)), Number(lng.toFixed(5))] as [number,number];
    }
    return undefined;
  }, [mapBusinesses, mapCenter]);

  async function runScan(locationText: string, industry?: string) {
    try {
      setIsScanning(true);
      const scanParams = { 
        location: locationText, 
        industry: industry && industry !== 'All Industries' ? industry.toLowerCase() : undefined,
        radius_miles: 25, 
        max_businesses: 50 
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanParams)
      });
      if (!res.ok) throw new Error(`Scan failed (${res.status})`);
      const data = await res.json();

      const apiBiz = (data.businesses || []) as any[];
      const mapped = apiBiz
        .map((b, i) => {
          const lat = b?.location?.lat ?? b?.lat ?? b?.coordinates?.lat;
          const lng = b?.location?.lng ?? b?.lng ?? b?.coordinates?.lng;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;
          return {
            id: b.business_id || b.id || i,
            name: b.name || b.business_name || 'Business',
            position: [lat, lng] as [number, number],
            tam: b?.metrics?.tam_estimate ? `$${Number(b.metrics.tam_estimate).toLocaleString()}` : undefined,
            score: b?.analysis?.lead_score?.overall_score ?? b?.scores?.overall
          };
        })
        .filter(Boolean) as { id: string|number; name: string; position: [number,number]; tam?: string; score?: number; }[];

      setMapBusinesses(mapped);
      setRegion(data?.location || locationText);
      const totalTam = data?.market_intelligence?.tam_estimate || data?.market_intelligence?.market_metrics?.total_tam_estimate;
      if (totalTam) setTam(`$${Number(totalTam).toLocaleString()}`);

      // Center if backend returned one
      const cLat = data?.center?.lat ?? data?.lat;
      const cLng = data?.center?.lng ?? data?.lng;
      if (typeof cLat === 'number' && typeof cLng === 'number') setMapCenter([cLat, cLng]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  }

  // Rotate header text every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  // Rotate industry facts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % industryFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [industryFacts.length]);

  // Load businesses when industry changes
  useEffect(() => {
    if (selectedIndustry !== 'All Industries') {
      runScan('San Francisco', selectedIndustry);
    }
  }, [selectedIndustry]);

  // Geolocate on mount to preset map center
  useEffect(() => {
    if (typeof window === 'undefined' || mapCenter) return;
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (typeof lat === 'number' && typeof lng === 'number') {
          setMapCenter([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
    return () => { void id; };
  }, [mapCenter]);

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-gray-900">
      {/* Header removed: Global nav and breadcrumb from app/layout.tsx handle top navigation */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Hero */}
        <section className="flex-1 max-w-xl">
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full px-3 py-1 transform transition-all duration-700 ease-in-out hover:scale-105 hover:shadow-lg animate-float">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="transition-all duration-500 ease-in-out animate-glow">
                {rotatingTexts[currentTextIndex]}
              </span>
            </span>
          </div>
          
          <style jsx>{`
            @keyframes float {
              0%, 100% { 
                transform: translateY(0px) rotate(0deg);
                box-shadow: 0 4px 8px rgba(52, 211, 153, 0.1);
              }
              25% { 
                transform: translateY(-3px) rotate(0.5deg);
                box-shadow: 0 6px 12px rgba(52, 211, 153, 0.15);
              }
              50% { 
                transform: translateY(-5px) rotate(0deg);
                box-shadow: 0 8px 16px rgba(52, 211, 153, 0.2);
              }
              75% { 
                transform: translateY(-3px) rotate(-0.5deg);
                box-shadow: 0 6px 12px rgba(52, 211, 153, 0.15);
              }
            }
            
            @keyframes glow {
              0%, 100% { 
                text-shadow: 0 0 2px rgba(52, 211, 153, 0.3);
                opacity: 0.9;
              }
              50% { 
                text-shadow: 0 0 8px rgba(52, 211, 153, 0.6);
                opacity: 1;
              }
            }
            
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
            
            .animate-glow {
              animation: glow 3s ease-in-out infinite;
            }
          `}</style>
          <h1 className="text-[46px] leading-[1.1] md:text-[56px] font-extrabold tracking-tight mb-4">
            Find and qualify <br /> <span className="text-okapi-brown-600">SMB deals</span> <span className="text-emerald-700">before</span> <br /> <span className="text-emerald-700">anyone else</span>
              </h1>
          <p className="text-[16px] md:text-[18px] text-gray-700 mb-8">
            AI-powered deal sourcing from public data, owner signals, and market intelligence. Get CRM-ready leads with TAM/SAM estimates and ad spend analysis while competitors are still cold calling.
          </p>

          {/* Search group */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (!q) return;
              // Navigate to dedicated scanner page with query param
              if (typeof window !== 'undefined') {
                window.location.href = `/oppy?location=${encodeURIComponent(q)}`;
              }
            }}
            className="flex flex-col sm:flex-row gap-4 mb-5"
          >
            <div className="flex-1">
              <div className="relative flex items-center rounded-xl border border-gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500">
                <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter a city, ZIP, or industry..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 bg-transparent outline-none text-[15px]"
                  aria-label="Market scan input"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white px-7 py-3 rounded-xl whitespace-nowrap font-semibold shadow-lg transition-colors disabled:opacity-60"
              aria-label="Search"
              disabled={isScanning}
            >
              <span>{isScanning ? 'Scanning…' : 'Search'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Secondary actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <a href="/oppy" className="flex items-center justify-center gap-2 flex-1 border border-gray-300 px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-white hover:bg-gray-50 transition">
              Get Started
            </a>
            <a href="/crm" className="flex items-center justify-center gap-2 flex-1 border border-gray-300 px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-white hover:bg-gray-50 transition">
              Open CRM
            </a>
          </div>

          {/* Checklist */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> No setup required</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant lead export</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 14-day free trial</span>
        </div>
        </section>

        {/* Right: Market Intelligence Card */}
        <aside className="flex-1 flex justify-center w-full">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-gray-400">app.okapiq.com</span>
                  </div>
              <span className="bg-gray-100 text-gray-800 text-xs font-semibold rounded-full px-2.5 py-1">TAM: $2.4B</span>
                </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Market Intelligence - San Francisco Bay Area</h2>

            <div className="flex flex-col divide-y divide-gray-100 rounded-xl bg-gray-50 border border-gray-100">
              {businesses.map((biz, i) => (
                <div key={biz.name} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-semibold text-gray-900">{biz.name}</div>
                    <div className="text-xs text-gray-500">{biz.tam}</div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${i === 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{biz.score}</span>
                </div>
              ))}
                  </div>

            <a href="/oppy" className="mt-5 w-full inline-flex items-center justify-center bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white font-semibold py-3 rounded-xl shadow transition">
              Open Full Intelligence Suite
            </a>
          </div>
        </aside>
      </main>

      {/* Real-Time Market Intelligence Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 text-center">Real-Time Market Intelligence</h2>
        <p className="text-[16px] text-gray-600 mb-10 text-center max-w-3xl mx-auto">
          Live data insights powering acquisition decisions across industries
        </p>
        
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-4xl text-center">
            <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            
            <div 
              key={currentFactIndex}
              className="animate-pulse"
              style={{
                animation: 'fadeInOut 5s ease-in-out infinite'
              }}
            >
              <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                {industryFacts[currentFactIndex]}
              </p>
            </div>
            
            <div className="mt-8 flex justify-center space-x-2">
              {industryFacts.slice(0, 8).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i === (currentFactIndex % 8) ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; transform: translateY(5px); }
            50% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      {/* Map + Scanner Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow border border-gray-100">
            <div className="flex items-center justify-between px-4 pt-4">
              <label className="text-sm text-gray-600">Industry View:</label>
              <select
                value={selectedIndustry}
                onChange={(e)=>setSelectedIndustry(e.target.value)}
                className="border rounded-md text-sm px-2 py-1"
                aria-label="Industry selector"
              >
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <InteractiveMap 
              heightClassName="h-[420px]"
              businesses={mapBusinesses}
              center={computedCenter ?? US_CENTER}
              zoom={mapBusinesses.length > 0 ? 10 : 4}
              fitToBusinesses={mapBusinesses.length > 0}
              showHeat={false}
            />
          </div>
        </div>
      </section>

    </div>
  );
} 
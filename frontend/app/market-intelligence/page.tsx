"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Search, Building2, Users, BarChart3, Target, ChevronRight } from "lucide-react";

type Tab = "overview" | "oppy" | "fragment" | "assistant";

export default function MarketIntelligenceDashboardPage() {
  const [active, setActive] = useState<Tab>("overview");
  const router = useRouter();

  const TabButton = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setActive(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active === id
          ? "bg-okapi-brown-600 text-white shadow"
          : "text-okapi-brown-800 hover:bg-okapi-brown-100"
      }`}
      aria-current={active === id ? "page" : undefined}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      {/* remove duplicate local nav; global top bar covers this */}

      <header className="bg-gradient-to-br from-okapi-brown-50 to-white py-10 border-b border-okapi-brown-200">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-okapi-brown-900 mb-4">Market Intelligence Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <TabButton id="overview" label="Overview" />
            <TabButton id="oppy" label="Oppy - Opportunities" />
            <TabButton id="fragment" label="Fragment Finder" />
            <TabButton id="assistant" label="Acquisition Assistant" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {active === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-okapi-brown-600" /> Oppy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-okapi-brown-700">Active Markets</span><span className="font-semibold text-okapi-brown-900">12</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-okapi-brown-700">Opportunities Found</span><span className="font-semibold text-okapi-brown-900">247</span></div>
                <Link href="/oppy" className="inline-block"><Button className="bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">Launch Oppy</Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-okapi-brown-600" /> Fragment Finder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-okapi-brown-700">Fragmented Markets</span><span className="font-semibold text-okapi-brown-900">8</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-okapi-brown-700">Roll-up Targets</span><span className="font-semibold text-okapi-brown-900">156</span></div>
                <Link href="/fragment-finder" className="inline-block"><Button className="bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">Analyze Fragmentation</Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-okapi-brown-600" /> Acquisition Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-okapi-brown-700">Active Deals</span><span className="font-semibold text-okapi-brown-900">34</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-okapi-brown-700">Pipeline Value</span><span className="font-semibold text-okapi-brown-900">$12.8M</span></div>
                <Link href="/acquisition-assistant" className="inline-block"><Button className="bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">Manage Pipeline</Button></Link>
              </CardContent>
            </Card>
          </div>
        )}

        {active === "oppy" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-okapi-brown-900">Oppy - Opportunity Finder</h2>
              <Link href="/oppy"><Button className="bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">Launch Full Scanner</Button></Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Active Market Opportunities</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {["Bay Area HVAC","Arizona Auto Detail","Texas Landscaping","Florida Pool Services"].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-okapi-brown-200">
                      <div>
                        <div className="font-semibold text-okapi-brown-900">{name}</div>
                        <div className="text-xs text-okapi-brown-600">TAM: ${(1.2 + i*0.6).toFixed(1)}B • {40 + i*7} targets</div>
                      </div>
                      <div className="flex items-center gap-2 text-green-700 text-sm">{(7.5 + i*2.6).toFixed(1)}%<span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded-full">hot</span></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/oppy" className="block">
                    <Button className="w-full justify-between bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">New Market Scan <ChevronRight className="w-4 h-4" /></Button>
                  </Link>
                  <Link href="/fragment-finder" className="block">
                    <Button variant="outline" className="w-full justify-between border-okapi-brown-300">Analyze Fragmentation <ChevronRight className="w-4 h-4" /></Button>
                  </Link>
                  <Link href="/acquisition-assistant" className="block">
                    <Button variant="outline" className="w-full justify-between border-okapi-brown-300">Export to Pipeline <ChevronRight className="w-4 h-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {active === "fragment" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-okapi-brown-900">Fragment Finder</h2>
              <Link href="/fragment-finder"><Button className="bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">Full Analysis Suite</Button></Link>
            </div>
            <Card>
              <CardHeader><CardTitle>Market Fragmentation Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {["Bay Area HVAC","Arizona Auto Detail","Texas Landscaping"].map((name, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-okapi-brown-900">{name}</div>
                      <div className="text-sm text-okapi-brown-700">HHI: { (0.12 + i*0.06).toFixed(2) }</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">{80 - i*12}% Fragmented</span>
                      <span className="text-okapi-brown-700">{32 + i*15} Targets</span>
                      <span className="text-teal-700">${(2.4 + i*1.8).toFixed(1)}M Synergy</span>
                    </div>
                    <div className="h-2 bg-okapi-brown-100 rounded">
                      <div className="h-2 bg-emerald-500 rounded" style={{ width: `${80 - i*12}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {active === "assistant" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-okapi-brown-900">Acquisition Assistant</h2>
              <Link href="/acquisition-assistant"><Button className="bg-okapi-brown-600 hover:bg-okapi-brown-700 text-white">Full CRM Suite</Button></Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Pipeline Overview</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-center">
                  {["Prospects","Contact","Due Diligence","Closing"].map((stage, i) => (
                    <div key={stage} className="p-4 bg-white rounded-lg border border-okapi-brown-200">
                      <div className="text-2xl font-bold text-okapi-brown-900">{[12,8,6,3][i]}</div>
                      <div className="text-sm text-okapi-brown-700">{stage}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Automation Status</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {["Follow-up Sequences","Document Generation","Lead Scoring","Pipeline Updates"].map((item, i) => (
                    <div key={item} className="p-4 bg-white rounded-lg border border-okapi-brown-200">
                      <div className="font-semibold text-okapi-brown-900">{item}</div>
                      <div className="text-sm mt-1 {i===0 ? 'text-emerald-700' : 'text-okapi-brown-700'}">{["Active","Running","Live","Real-time"][i]}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}



"use client";

import React from "react";

type Plan = {
  name: string;
  price: string;
  color: string;
  features: { label: string; help: string }[];
  cta: string;
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Explorer Pack",
    price: "$79/month",
    color: "border-gray-200",
    cta: "Start Explorer Trial",
    features: [
      { label: "1,000+ unqualified leads/month", help: "" },
      { label: "Basic TAM/SAM estimates", help: "" },
      { label: "CSV export functionality", help: "" },
    ],
  },
  {
    name: "Professional",
    price: "$897/month",
    color: "border-emerald-500",
    cta: "Start Professional Trial",
    highlight: true,
    features: [
      { label: "2,000 qualified scans/month", help: "" },
      { label: "HHI fragmentation scoring", help: "" },
      { label: "CRM-ready exports", help: "" },
      { label: "Automated outreach sequences", help: "" },
    ],
  },
  {
    name: "Elite Intelligence Suite",
    price: "$5,900/month",
    color: "border-amber-500",
    cta: "Request Elite Demo",
    features: [
      { label: "2,500+ precision leads/month", help: "" },
      { label: "Full TAM/SAM/SOM analysis", help: "" },
      { label: "API access & integrations", help: "" },
      { label: "Dedicated analyst calls", help: "" },
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">From budget market exploration to elite acquisition execution</h2>
      <p className="text-gray-600 text-center mb-10"></p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.name} className={`bg-white rounded-2xl border ${p.color} shadow p-6 relative flex flex-col h-full`}> 
            {p.highlight && (
              <span className="absolute -top-3 right-4 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">Most Popular</span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
            <div className="text-3xl font-extrabold text-gray-900 mb-4">{p.price}</div>
            <ul className="space-y-3 mb-6 flex-grow">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800">{f.label}</span>
                  {f.help && (
                    <span
                      className="ml-2 text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5"
                      title={f.help}
                    >
                      ?
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-semibold mt-auto ${p.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#402f23] text-white hover:bg-[#594733]'}`}>{p.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
}



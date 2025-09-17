"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

function MiniLBO() {
  const [purchasePrice, setPurchasePrice] = useState(5_000_000);
  const [debtPct, setDebtPct] = useState(70);
  const [rate, setRate] = useState(9);
  const [ebitda, setEbitda] = useState(1_000_000);
  const [growth, setGrowth] = useState(10);
  const [exitMultiple, setExitMultiple] = useState(5);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const equityPct = (100 - debtPct) / 100;
    const debtPctF = debtPct / 100;
    const rateF = rate / 100;
    const growthF = growth / 100;
    const equity = purchasePrice * equityPct;
    const debt = purchasePrice * debtPctF;
    const debtService = debt * rateF;

    let e = ebitda;
    const cashFlows: number[] = [];
    for (let y = 1; y <= years; y++) {
      e = e * (1 + (y === 1 ? 0 : growthF));
      cashFlows.push(Math.max(0, e - debtService));
    }
    const exitValue = e * exitMultiple;

    function irr(cfs: number[]) {
      let low = -0.99,
        high = 3;
      const npv = (r: number) => cfs.reduce((s, cf, i) => s + cf / Math.pow(1 + r, i + 1), -equity);
      for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        const val = npv(mid) + exitValue / Math.pow(1 + mid, years);
        if (val > 0) low = mid;
        else high = mid;
      }
      return ((low + high) / 2) * 100;
    }

    const irrPct = irr(cashFlows);
    const equityMultiple = (cashFlows.reduce((a, b) => a + b, 0) + exitValue) / equity;
    return { irrPct, equityMultiple, equity, debt, exitValue };
  }, [purchasePrice, debtPct, rate, ebitda, growth, exitMultiple, years]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mini LBO Model</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <label className="text-sm text-gray-400">Purchase Price ($)</label>
          <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)} />
          <label className="text-sm text-gray-400">Debt %</label>
          <Input type="number" value={debtPct} onChange={(e) => setDebtPct(Number(e.target.value) || 0)} />
          <label className="text-sm text-gray-400">Interest Rate %</label>
          <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-3">
          <label className="text-sm text-gray-400">EBITDA (TTM)</label>
          <Input type="number" value={ebitda} onChange={(e) => setEbitda(Number(e.target.value) || 0)} />
          <label className="text-sm text-gray-400">EBITDA Growth %</label>
          <Input type="number" value={growth} onChange={(e) => setGrowth(Number(e.target.value) || 0)} />
          <label className="text-sm text-gray-400">Exit Multiple (x)</label>
          <Input type="number" value={exitMultiple} onChange={(e) => setExitMultiple(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Equity: ${result.equity.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Debt: ${result.debt.toLocaleString()}</div>
          <div className="text-lg font-semibold text-white">IRR: {result.irrPct.toFixed(1)}%</div>
          <div className="text-lg font-semibold text-white">Equity Multiple: {result.equityMultiple.toFixed(2)}x</div>
          <div className="text-sm text-gray-400">Exit Value: ${result.exitValue.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AcquisitionAssistantPage() {
  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      {/* remove duplicate local nav; global top bar covers this */}

      <header className="bg-gradient-to-br from-okapi-brown-50 to-white py-12 border-b border-okapi-brown-200">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-okapi-brown-900">Acquisition Assistant</h1>
          <p className="text-okapi-brown-700 mt-4 text-lg max-w-3xl">Deal pipeline, CIMs, and IRR modeling—running locally with no external keys.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <MiniLBO />
        <div className="bg-gray-900/40 rounded-lg border border-gray-800 p-6">
          <p className="text-gray-300">Kanban pipeline and CIM generator UIs coming soon.</p>
        </div>
      </main>
    </div>
  );
}



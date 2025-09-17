"use client";

import React, { useState } from 'react';
import { SmoothReveal, StaggeredReveal, PallyButton, OrigamiCard, SmoothNavLink } from '../ui/smooth-components';
import { ArrowLeft, TrendingUp, Users, Building2, Target, Zap, BarChart3, Search, Filter, Download, Share2, Eye, DollarSign, MapPin, Calendar } from 'lucide-react';

interface MarketAnalysisPageProps {
  onNavigate: (page: string) => void;
}

export default function MarketAnalysisPage({ onNavigate }: MarketAnalysisPageProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const marketInsights = [
    {
      id: 1,
      market: "HVAC Services",
      location: "Phoenix, AZ",
      hhi: 0.23,
      tam: 15000000000,
      fragmentation: "Highly Fragmented",
      opportunity: "Consolidation",
      lastUpdated: "2 hours ago",
      businesses: 45,
      avgRevenue: 1200000
    },
    {
      id: 2,
      market: "Restaurant Chains",
      location: "Miami, FL",
      hhi: 0.31,
      tam: 45000000000,
      fragmentation: "Moderately Fragmented",
      opportunity: "Growth",
      lastUpdated: "1 day ago",
      businesses: 78,
      avgRevenue: 1800000
    },
    {
      id: 3,
      market: "IT Services",
      location: "Austin, TX",
      hhi: 0.18,
      tam: 28000000000,
      fragmentation: "Highly Fragmented",
      opportunity: "Roll-up",
      lastUpdated: "3 days ago",
      businesses: 32,
      avgRevenue: 2500000
    },
    {
      id: 4,
      market: "Healthcare",
      location: "Chicago, IL",
      hhi: 0.42,
      tam: 3800000000000,
      fragmentation: "Concentrated",
      opportunity: "Specialized",
      lastUpdated: "1 week ago",
      businesses: 156,
      avgRevenue: 4500000
    }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000000) {
      return `$${(amount / 1000000000000).toFixed(1)}T`;
    } else if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getFragmentationColor = (hhi: number) => {
    if (hhi < 0.15) return 'text-green-600';
    if (hhi < 0.25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'Consolidation': return 'bg-blue-100 text-blue-800';
      case 'Growth': return 'bg-green-100 text-green-800';
      case 'Roll-up': return 'bg-purple-100 text-purple-800';
      case 'Specialized': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInsights = marketInsights.filter(insight =>
    insight.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insight.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-okapi-brown-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-2xl font-bold text-okapi-brown-800 ml-4">Market Analysis</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <SmoothNavLink onClick={() => onNavigate('market-scanner')}>Scanner</SmoothNavLink>
              <SmoothNavLink onClick={() => onNavigate('crm')}>CRM</SmoothNavLink>
              <SmoothNavLink onClick={() => onNavigate('dashboard')}>Dashboard</SmoothNavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Market Analysis Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SmoothReveal>
          <h2 className="text-4xl font-bold text-okapi-brown-900 mb-8 text-center">Market Intelligence</h2>
        </SmoothReveal>

        {/* Search and Filters */}
        <SmoothReveal delay={0.1}>
          <OrigamiCard pattern="okapi" className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-okapi-brown-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-okapi-brown-300 rounded-md focus:ring-2 focus:ring-okapi-brown-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <PallyButton variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </PallyButton>
                <PallyButton variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </PallyButton>
              </div>
            </div>
          </OrigamiCard>
        </SmoothReveal>

        {/* Analysis Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <StaggeredReveal staggerDelay={0.2}>
            <OrigamiCard pattern="okapi" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">HHI Analysis</h3>
              <p className="text-okapi-brown-700 mb-6">
                Herfindahl-Hirschman Index calculations to identify market concentration and consolidation opportunities.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">Market concentration scoring</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">Consolidation opportunity ranking</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">Competitive landscape mapping</span>
                </div>
              </div>
              <PallyButton onClick={() => onNavigate('market-scanner')} className="w-full">
                Run HHI Analysis
              </PallyButton>
            </OrigamiCard>

            <OrigamiCard pattern="cheetah" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">TAM/SAM/SOM</h3>
              <p className="text-okapi-brown-700 mb-6">
                Total Addressable Market, Serviceable Addressable Market, and Serviceable Obtainable Market calculations.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">Market size estimation</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">Revenue potential analysis</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">Growth opportunity identification</span>
                </div>
              </div>
              <PallyButton onClick={() => onNavigate('market-scanner')} className="w-full">
                Calculate Market Size
              </PallyButton>
            </OrigamiCard>
          </StaggeredReveal>
        </div>

        {/* Market Insights */}
        <SmoothReveal delay={0.4}>
          <OrigamiCard pattern="zebra" className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-okapi-brown-900">Market Insights</h3>
              <PallyButton variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </PallyButton>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map((insight) => (
                <div key={insight.id} className="bg-white p-6 rounded-lg border border-okapi-brown-200 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-okapi-brown-900 mb-1">{insight.market}</h4>
                      <div className="flex items-center text-sm text-okapi-brown-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {insight.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 text-okapi-brown-400 hover:text-okapi-brown-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-okapi-brown-400 hover:text-okapi-brown-600">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-okapi-brown-500">HHI Score</p>
                      <p className={`text-lg font-bold ${getFragmentationColor(insight.hhi)}`}>
                        {(insight.hhi * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-okapi-brown-500">TAM</p>
                      <p className="text-lg font-bold text-okapi-brown-900">
                        {formatCurrency(insight.tam)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-okapi-brown-500">Businesses</p>
                      <p className="text-lg font-bold text-okapi-brown-900">{insight.businesses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-okapi-brown-500">Avg Revenue</p>
                      <p className="text-lg font-bold text-okapi-brown-900">
                        {formatCurrency(insight.avgRevenue)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(insight.opportunity)}`}>
                      {insight.opportunity}
                    </span>
                    <div className="text-xs text-okapi-brown-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {insight.lastUpdated}
                    </div>
                  </div>

                  <div className="border-t border-okapi-brown-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-okapi-brown-600">
                        {insight.fragmentation}
                      </span>
                      <PallyButton size="sm" variant="secondary">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Detailed Analysis
                      </PallyButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </OrigamiCard>
        </SmoothReveal>

        {/* Quick Actions */}
        <SmoothReveal delay={0.5}>
          <OrigamiCard pattern="lion" className="p-8 mt-8">
            <h3 className="text-2xl font-bold text-okapi-brown-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PallyButton onClick={() => onNavigate('market-scanner')} className="w-full justify-start">
                <Search className="w-5 h-5 mr-3" />
                New Market Scan
              </PallyButton>
              <PallyButton variant="secondary" className="w-full justify-start">
                <BarChart3 className="w-5 h-5 mr-3" />
                Generate Report
              </PallyButton>
              <PallyButton variant="secondary" className="w-full justify-start">
                <Download className="w-5 h-5 mr-3" />
                Export Data
              </PallyButton>
            </div>
          </OrigamiCard>
        </SmoothReveal>
      </div>
    </div>
  );
} 
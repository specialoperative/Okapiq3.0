
"use client";

import React from 'react';
import { SmoothReveal, StaggeredReveal, PallyButton, OrigamiCard, SmoothNavLink } from '../ui/smooth-components';
import { ArrowLeft, TrendingUp, Users, Building2, Target, Zap } from 'lucide-react';

interface CaseStudiesPageProps {
  onNavigate: (page: string) => void;
}

export default function CaseStudiesPage({ onNavigate }: CaseStudiesPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-okapi-brown-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <PallyButton variant="ghost" onClick={() => onNavigate('landing')} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </PallyButton>
              <h1 className="text-2xl font-bold text-okapi-brown-800 ml-4">Case Studies</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <SmoothNavLink onClick={() => onNavigate('solutions')}>Solutions</SmoothNavLink>
              <SmoothNavLink onClick={() => onNavigate('market-scanner')}>Scanner</SmoothNavLink>
              <SmoothNavLink onClick={() => onNavigate('dashboard')}>Dashboard</SmoothNavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Case Studies Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SmoothReveal>
          <h2 className="text-4xl font-bold text-okapi-brown-900 mb-8 text-center">Success Stories</h2>
        </SmoothReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StaggeredReveal staggerDelay={0.2}>
            <OrigamiCard pattern="okapi" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">HVAC Market Consolidation</h3>
              <p className="text-okapi-brown-700 mb-6">
                A private equity firm used Fragment Finder to identify 47 HVAC companies in the Southeast, 
                achieving a 3.2x return on their roll-up strategy.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">47 companies identified</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">3.2x ROI achieved</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">18-month timeline</span>
                </div>
              </div>
                             <PallyButton variant="secondary" className="w-full" onClick={() => onNavigate('market-scanner')}>Read Full Case Study</PallyButton>
             </OrigamiCard>

             <OrigamiCard pattern="cheetah" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">Restaurant Chain Acquisition</h3>
              <p className="text-okapi-brown-700 mb-6">
                Oppy helped identify 12 high-potential restaurant chains with strong demographic trends, 
                leading to a successful $15M acquisition.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">12 targets identified</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">$15M acquisition value</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">6-month due diligence</span>
                </div>
              </div>
                             <PallyButton variant="secondary" className="w-full" onClick={() => onNavigate('crm')}>Read Full Case Study</PallyButton>
             </OrigamiCard>

             <OrigamiCard pattern="leopard" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">Manufacturing Roll-Up</h3>
              <p className="text-okapi-brown-700 mb-6">
                Acquisition Assistant streamlined the entire process, managing 156 leads and closing 8 deals 
                in 12 months for a manufacturing conglomerate.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">156 leads managed</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">8 deals closed</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">12-month timeline</span>
                </div>
              </div>
                             <PallyButton variant="secondary" className="w-full" onClick={() => onNavigate('market-analysis')}>Read Full Case Study</PallyButton>
             </OrigamiCard>

             <OrigamiCard pattern="zebra" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">Tech Services M&A</h3>
              <p className="text-okapi-brown-700 mb-6">
                Fragment Finder identified a highly fragmented IT services market, enabling a strategic 
                buyer to acquire 23 companies in 18 months.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">23 companies acquired</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">$45M total value</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-sm text-okapi-brown-700">18-month execution</span>
                </div>
              </div>
                             <PallyButton variant="secondary" className="w-full" onClick={() => onNavigate('market-scanner')}>Read Full Case Study</PallyButton>
             </OrigamiCard>
           </StaggeredReveal>
        </div>
      </div>
    </div>
  );
} 
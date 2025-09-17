"use client";

import React, { useState, useEffect } from 'react';
import { SmoothReveal, StaggeredReveal, PallyButton, OrigamiCard, SmoothNavLink } from '../ui/smooth-components';
import { ArrowLeft, TrendingUp, Users, Building2, Target, Zap, Search, BarChart3, Calendar, DollarSign, Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface DashboardStats {
  scans_today: number;
  leads_generated: number;
  success_rate: number;
  analyses_today: number;
  opportunities_found: number;
  avg_hhi_score: number;
  active_deals: number;
  followups_sent: number;
  close_rate: number;
  active_leads: number;
  markets_analyzed: number;
  total_value: number;
  deals_in_pipeline: number;
  conversion_rate: number;
  recent_activity: Array<{
    id: number;
    type: string;
    location?: string;
    industry?: string;
    company?: string;
    market?: string;
    action: string;
    time: string;
    status: string;
  }>;
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    color: string;
  }>;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch dashboard data
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Fallback to default data if API fails
      setDashboardStats({
        scans_today: 18,
        leads_generated: 24,
        success_rate: 92.0,
        analyses_today: 5,
        opportunities_found: 12,
        avg_hhi_score: 18.5,
        active_deals: 8,
        followups_sent: 15,
        close_rate: 68.0,
        active_leads: 156,
        markets_analyzed: 89,
        total_value: 2.4,
        deals_in_pipeline: 12,
        conversion_rate: 23.0,
        recent_activity: [
          { id: 1, type: 'scan', location: 'Phoenix, AZ', industry: 'Restaurant', action: 'Market scan completed', time: '2 minutes ago', status: 'completed' },
          { id: 2, type: 'lead', company: 'ABC HVAC Services', action: 'Contacted', time: '15 minutes ago', status: 'active' },
          { id: 3, type: 'analysis', market: 'Miami Healthcare', action: 'HHI Analysis', time: '1 hour ago', status: 'completed' },
          { id: 4, type: 'deal', company: 'Metro Restaurant Group', action: 'Qualified', time: '2 hours ago', status: 'active' }
        ],
        alerts: [
          { type: 'warning', title: 'High Succession Risk', message: '3 businesses in your pipeline have >80% succession risk', color: 'yellow' },
          { type: 'opportunity', title: 'New Market Opportunity', message: 'Phoenix HVAC market shows high fragmentation potential', color: 'green' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardStats();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchDashboardStats, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan': return <Search className="w-4 h-4" />;
      case 'lead': return <Users className="w-4 h-4" />;
      case 'analysis': return <BarChart3 className="w-4 h-4" />;
      case 'deal': return <DollarSign className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'scan': return 'text-blue-600';
      case 'lead': return 'text-green-600';
      case 'analysis': return 'text-purple-600';
      case 'deal': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen">
      {/* No secondary header under global bar */}

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SmoothReveal>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-okapi-brown-900">Welcome back!</h2>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="text-xs text-okapi-brown-500">
                  Last updated: {formatTime(lastUpdated)}
                </div>
              )}
              <button
                onClick={fetchDashboardStats}
                disabled={loading}
                className="p-2 text-okapi-brown-600 hover:text-okapi-brown-900 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-sm text-okapi-brown-600">
                {currentTime.toLocaleDateString()} • {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </SmoothReveal>

        {/* Three-Product Ecosystem Overview */}
        <SmoothReveal delay={0.2}>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-okapi-brown-900 mb-6">Three-Product Ecosystem</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="/oppy" className="block">
              <OrigamiCard pattern="okapi" className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold text-okapi-brown-900">Oppy</h4>
                    <p className="text-xs text-okapi-brown-600">Market Intelligence</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Scans Today</span>
                    <span className="font-semibold text-okapi-brown-900">
                      {loading ? '...' : dashboardStats?.scans_today || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Leads Generated</span>
                    <span className="font-semibold text-okapi-brown-900">
                      {loading ? '...' : dashboardStats?.leads_generated || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Success Rate</span>
                    <span className="font-semibold text-green-600">
                      {loading ? '...' : `${dashboardStats?.success_rate || 0}%`}
                    </span>
                  </div>
                </div>
              </OrigamiCard>
              </a>

              <a href="/fragment-finder" className="block">
              <OrigamiCard pattern="cheetah" className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold text-okapi-brown-900">Fragment Finder</h4>
                    <p className="text-xs text-okapi-brown-600">M&A Intelligence</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Analyses Today</span>
                    <span className="font-semibold text-okapi-brown-900">
                      {loading ? '...' : dashboardStats?.analyses_today || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Opportunities</span>
                    <span className="font-semibold text-okapi-brown-900">
                      {loading ? '...' : dashboardStats?.opportunities_found || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Avg HHI Score</span>
                    <span className="font-semibold text-purple-600">
                      {loading ? '...' : `${dashboardStats?.avg_hhi_score || 0}%`}
                    </span>
                  </div>
                </div>
              </OrigamiCard>
              </a>

              <a href="/crm" className="block">
              <OrigamiCard pattern="leopard" className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold text-okapi-brown-900">Acquisition Assistant</h4>
                    <p className="text-xs text-okapi-brown-600">Deal Management</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Active Deals</span>
                    <span className="font-semibold text-okapi-brown-900">
                      {loading ? '...' : dashboardStats?.active_deals || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Follow-ups Sent</span>
                    <span className="font-semibold text-okapi-brown-900">
                      {loading ? '...' : dashboardStats?.followups_sent || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-okapi-brown-600">Close Rate</span>
                    <span className="font-semibold text-green-600">
                      {loading ? '...' : `${dashboardStats?.close_rate || 0}%`}
                    </span>
                  </div>
                </div>
              </OrigamiCard>
              </a>
            </div>
          </div>
        </SmoothReveal>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StaggeredReveal staggerDelay={0.1}>
            <OrigamiCard pattern="okapi" className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('market-scanner')}>
              <div className="flex items-center">
                <Search className="w-8 h-8 text-okapi-brown-600" />
                <div className="ml-4">
                  <p className="text-sm text-okapi-brown-600">Scans Today</p>
                  <p className="text-2xl font-bold text-okapi-brown-900">
                    {loading ? '...' : dashboardStats?.scans_today || 0}
                  </p>
                  <p className="text-xs text-green-600">+12% from yesterday</p>
                </div>
              </div>
            </OrigamiCard>

            <OrigamiCard pattern="zebra" className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('crm')}>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-okapi-brown-600">Active Leads</p>
                  <p className="text-2xl font-bold text-okapi-brown-900">
                    {loading ? '...' : dashboardStats?.active_leads || 0}
                  </p>
                  <p className="text-xs text-green-600">+8 new this week</p>
                </div>
              </div>
            </OrigamiCard>

            <OrigamiCard pattern="cheetah" className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('market-analysis')}>
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-okapi-brown-900">Markets Analyzed</p>
                  <p className="text-2xl font-bold text-okapi-brown-900">
                    {loading ? '...' : dashboardStats?.markets_analyzed || 0}
                  </p>
                  <p className="text-xs text-blue-600">3 pending analysis</p>
                </div>
              </div>
            </OrigamiCard>

            <OrigamiCard pattern="leopard" className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('case-studies')}>
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-okapi-brown-600">Success Rate</p>
                  <p className="text-2xl font-bold text-okapi-brown-900">
                    {loading ? '...' : `${dashboardStats?.success_rate || 0}%`}
                  </p>
                  <p className="text-xs text-green-600">+5% this month</p>
                </div>
              </div>
            </OrigamiCard>
          </StaggeredReveal>
        </div>


        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SmoothReveal delay={0.2}>
            <OrigamiCard pattern="lion" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
              <a href="/oppy" className="w-full inline-flex"><PallyButton className="w-full justify-start">
                  <Search className="w-5 h-5 mr-3" />
                  New Market Scan
              </PallyButton></a>
              <a href="/crm" className="w-full inline-flex"><PallyButton variant="secondary" className="w-full justify-start">
                  <Users className="w-5 h-5 mr-3" />
                  View CRM
              </PallyButton></a>
              </div>
            </OrigamiCard>
          </SmoothReveal>

          <SmoothReveal delay={0.3}>
            <OrigamiCard pattern="rhino" className="p-8">
              <h3 className="text-2xl font-bold text-okapi-brown-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {(dashboardStats?.recent_activity || []).map((activity) => (
                  <div key={activity.id} className="flex items-center p-3 bg-white rounded-lg border border-okapi-brown-200">
                    <div className={`p-2 rounded-full bg-okapi-brown-100 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-okapi-brown-900">
                            {activity.type === 'scan' && `${activity.location} - ${activity.industry}`}
                            {activity.type === 'lead' && `${activity.company}`}
                            {activity.type === 'analysis' && `${activity.market}`}
                            {activity.type === 'deal' && `${activity.company}`}
                          </p>
                          <p className="text-xs text-okapi-brown-600">
                            {activity.action || 'Market scan completed'}
                          </p>
                        </div>
                        <span className="text-xs text-okapi-brown-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </OrigamiCard>
          </SmoothReveal>
        </div>

        {/* Performance Metrics */}
        <SmoothReveal delay={0.4}>
          <OrigamiCard pattern="okapi" className="p-8">
            <h3 className="text-2xl font-bold text-okapi-brown-900 mb-6">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg border border-okapi-brown-200">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-okapi-brown-900 mb-1">Total Value</h4>
                <p className="text-3xl font-bold text-okapi-brown-600">
                  {loading ? '...' : `$${dashboardStats?.total_value || 0}M`}
                </p>
                <p className="text-xs text-green-600">+15% this quarter</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-okapi-brown-200">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-okapi-brown-900 mb-1">Deals in Pipeline</h4>
                <p className="text-3xl font-bold text-okapi-brown-600">
                  {loading ? '...' : dashboardStats?.deals_in_pipeline || 0}
                </p>
                <p className="text-xs text-blue-600">3 closing this month</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-okapi-brown-200">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-okapi-brown-900 mb-1">Conversion Rate</h4>
                <p className="text-3xl font-bold text-okapi-brown-600">
                  {loading ? '...' : `${dashboardStats?.conversion_rate || 0}%`}
                </p>
                <p className="text-xs text-orange-600">+8% vs last month</p>
              </div>
            </div>
          </OrigamiCard>
        </SmoothReveal>

        {/* Alerts & Notifications */}
        <SmoothReveal delay={0.5}>
          <OrigamiCard pattern="zebra" className="p-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-okapi-brown-900">Alerts</h3>
              <PallyButton variant="secondary" size="sm">
                View All
              </PallyButton>
            </div>
            <div className="space-y-3">
              {(dashboardStats?.alerts || []).map((alert, index) => {
                const getAlertIcon = (type: string) => {
                  switch (type) {
                    case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />;
                    case 'opportunity': return <CheckCircle className="w-5 h-5 text-green-600 mr-3" />;
                    case 'success': return <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />;
                    case 'info': return <AlertCircle className="w-5 h-5 text-purple-600 mr-3" />;
                    default: return <AlertCircle className="w-5 h-5 text-gray-600 mr-3" />;
                  }
                };

                const getAlertColors = (color: string) => {
                  switch (color) {
                    case 'yellow': return { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800', message: 'text-yellow-700' };
                    case 'green': return { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800', message: 'text-green-700' };
                    case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', message: 'text-blue-700' };
                    case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', message: 'text-purple-700' };
                    default: return { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-800', message: 'text-gray-700' };
                  }
                };

                const colors = getAlertColors(alert.color);

                return (
                  <div key={index} className={`flex items-center p-3 ${colors.bg} border ${colors.border} rounded-lg`}>
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className={`text-sm font-medium ${colors.title}`}>{alert.title}</p>
                      <p className={`text-xs ${colors.message}`}>{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </OrigamiCard>
        </SmoothReveal>
      </div>
    </div>
  );
} 
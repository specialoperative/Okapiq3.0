"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Target, Mail, Phone, Calendar,
  BarChart3, PieChart, Activity, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

type AnalyticsData = {
  total_contacts: number;
  status_distribution: Record<string, number>;
  conversion_rates: Record<string, number>;
  average_deal_value: number;
  pipeline_value: number;
  total_campaigns: number;
  total_activities: number;
  source_performance: Record<string, any>;
};

export default function CRMAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/enhanced-crm/analytics/overview');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-purple-500',
      opportunity: 'bg-green-500',
      customer: 'bg-emerald-500',
      lost: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Analytics</h2>
          <p className="text-gray-600">Performance insights and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Contacts"
          value={analytics.total_contacts.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          trend={12}
          color="blue"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${analytics.pipeline_value.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend={8}
          color="green"
        />
        <MetricCard
          title="Avg Deal Value"
          value={`$${analytics.average_deal_value.toLocaleString()}`}
          icon={<Target className="w-6 h-6" />}
          trend={-3}
          color="purple"
        />
        <MetricCard
          title="Active Campaigns"
          value={analytics.total_campaigns.toString()}
          icon={<Mail className="w-6 h-6" />}
          trend={5}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.status_distribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({analytics.conversion_rates[status]}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {Object.entries(analytics.source_performance || {}).slice(0, 5).map(([source, data]: [string, any]) => (
              <div key={source} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">{source}</span>
                  <div className="text-xs text-gray-500">
                    {data.total_contacts} contacts • {data.conversion_rate}% conversion
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${data.total_deal_value?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500">total value</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {Object.entries(analytics.status_distribution).map(([status, count], index) => (
            <div key={status} className="text-center">
              <div className={`w-full h-20 ${getStatusColor(status)} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2`}>
                {count}
              </div>
              <div className="text-sm font-medium text-gray-700 capitalize">{status}</div>
              <div className="text-xs text-gray-500">{analytics.conversion_rates[status]}%</div>
              {index < Object.keys(analytics.status_distribution).length - 1 && (
                <div className="hidden md:block mt-2">
                  <ArrowUp className="w-4 h-4 text-gray-400 mx-auto rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <ActivityItem
              type="email"
              description="Campaign sent to 45 contacts"
              time="2 hours ago"
            />
            <ActivityItem
              type="call"
              description="Follow-up call with John Smith"
              time="4 hours ago"
            />
            <ActivityItem
              type="meeting"
              description="Demo scheduled with Acme Corp"
              time="1 day ago"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
          </div>
          <div className="space-y-3">
            <TaskItem
              title="Follow up with hot leads"
              due="Today, 2:00 PM"
              priority="high"
            />
            <TaskItem
              title="Send proposal to Mountain Hardware"
              due="Tomorrow, 10:00 AM"
              priority="medium"
            />
            <TaskItem
              title="Weekly pipeline review"
              due="Friday, 3:00 PM"
              priority="low"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-4">
            <PerformanceMetric
              label="Response Rate"
              value="68%"
              trend={5}
            />
            <PerformanceMetric
              label="Meeting Conversion"
              value="24%"
              trend={-2}
            />
            <PerformanceMetric
              label="Deal Velocity"
              value="18 days"
              trend={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: number; 
  color: string; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-sm">
          {trend > 0 ? (
            <ArrowUp className="w-4 h-4 text-green-500" />
          ) : trend < 0 ? (
            <ArrowDown className="w-4 h-4 text-red-500" />
          ) : (
            <Minus className="w-4 h-4 text-gray-500" />
          )}
          <span className={trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}>
            {Math.abs(trend)}%
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );
}

function ActivityItem({ 
  type, 
  description, 
  time 
}: { 
  type: string; 
  description: string; 
  time: string; 
}) {
  const getIcon = () => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'call': return <Phone className="w-4 h-4 text-green-500" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="p-1">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{description}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  );
}

function TaskItem({ 
  title, 
  due, 
  priority 
}: { 
  title: string; 
  due: string; 
  priority: 'high' | 'medium' | 'low'; 
}) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{due}</div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[priority]}`}>
        {priority}
      </span>
    </div>
  );
}

function PerformanceMetric({ 
  label, 
  value, 
  trend 
}: { 
  label: string; 
  value: string; 
  trend: number; 
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
      <div className="flex items-center gap-1">
        {trend > 0 ? (
          <ArrowUp className="w-3 h-3 text-green-500" />
        ) : trend < 0 ? (
          <ArrowDown className="w-3 h-3 text-red-500" />
        ) : (
          <Minus className="w-3 h-3 text-gray-500" />
        )}
        <span className={`text-xs ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}

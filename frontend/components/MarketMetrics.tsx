'use client';

import { 
  CurrencyDollarIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface MarketMetricsProps {
  data: {
    location: string;
    industry: string;
    tam_estimate: number;
    sam_estimate: number;
    som_estimate: number;
    business_count: number;
    hhi_score: number;
    fragmentation_level: string;
    avg_revenue_per_business: number;
    market_saturation_percent: number;
    ad_spend_to_dominate: number;
  };
}

export function MarketMetrics({ data }: MarketMetricsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getFragmentationColor = (level: string) => {
    switch (level) {
      case 'highly_fragmented':
        return 'text-success-600 bg-success-100';
      case 'moderately_fragmented':
        return 'text-warning-600 bg-warning-100';
      case 'consolidated':
        return 'text-danger-600 bg-danger-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getFragmentationIcon = (level: string) => {
    switch (level) {
      case 'highly_fragmented':
        return '🎯';
      case 'moderately_fragmented':
        return '⚖️';
      case 'consolidated':
        return '🏢';
      default:
        return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Market Intelligence - {data.location}
        </h2>
        <p className="text-gray-600 mt-1">
          {data.industry.charAt(0).toUpperCase() + data.industry.slice(1)} Industry Analysis
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="dashboard-grid">
        {/* TAM */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Addressable Market</p>
              <p className="metric-value">{formatCurrency(data.tam_estimate)}</p>
            </div>
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-600 mr-1" />
            <span className="text-success-600 font-medium">+5.2% YoY</span>
          </div>
        </div>

        {/* Business Count */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Registered SMBs</p>
              <p className="metric-value">{data.business_count.toLocaleString()}</p>
            </div>
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-600">In {data.location}</span>
          </div>
        </div>

        {/* HHI Score */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Market Fragmentation (HHI)</p>
              <p className="metric-value">{data.hhi_score.toFixed(3)}</p>
              <div className="mt-1">
                <span className={`badge ${getFragmentationColor(data.fragmentation_level)}`}>
                  {getFragmentationIcon(data.fragmentation_level)} {data.fragmentation_level.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {data.fragmentation_level === 'highly_fragmented' && 'Ideal for roll-up opportunities'}
            {data.fragmentation_level === 'moderately_fragmented' && 'Some consolidation potential'}
            {data.fragmentation_level === 'consolidated' && 'Limited roll-up opportunities'}
          </div>
        </div>

        {/* Ad Spend */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Ad Budget to Dominate</p>
              <p className="metric-value">{formatCurrency(data.ad_spend_to_dominate)}/mo</p>
            </div>
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            To capture 40% of local search
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Market Breakdown</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Addressable Market (TAM)</span>
              <span className="font-semibold">{formatCurrency(data.tam_estimate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Serviceable Available Market (SAM)</span>
              <span className="font-semibold">{formatCurrency(data.sam_estimate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Serviceable Obtainable Market (SOM)</span>
              <span className="font-semibold">{formatCurrency(data.som_estimate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Revenue per Business</span>
              <span className="font-semibold">{formatCurrency(data.avg_revenue_per_business)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Saturation</span>
              <span className="font-semibold">{data.market_saturation_percent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Roll-up Analysis */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Roll-up Opportunity Analysis</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fragmentation Level</span>
              <span className={`badge ${getFragmentationColor(data.fragmentation_level)}`}>
                {data.fragmentation_level.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">HHI Score</span>
              <span className="font-semibold">{data.hhi_score.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Roll-up Potential</span>
              <span className="font-semibold text-success-600">
                {data.fragmentation_level === 'highly_fragmented' ? 'High' : 
                 data.fragmentation_level === 'moderately_fragmented' ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Acquisition Cost</span>
              <span className="font-semibold">{formatCurrency(data.tam_estimate * 0.3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time to Consolidate</span>
              <span className="font-semibold">
                {data.fragmentation_level === 'highly_fragmented' ? '6-12 months' : 
                 data.fragmentation_level === 'moderately_fragmented' ? '12-18 months' : '18-24 months'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="btn-primary btn-lg">
          Export to CRM
        </button>
        <button className="btn-secondary btn-lg">
          Generate Report
        </button>
        <button className="btn-ghost btn-lg">
          Compare Markets
        </button>
      </div>
    </div>
  );
} 
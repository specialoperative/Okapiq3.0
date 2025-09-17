'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { LoadingDots } from './LoadingDots';

interface MarketScanFormProps {
  onScan: (data: any) => void;
  isScanning: boolean;
}

const industries = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Landscaping',
  'Restaurant',
  'Retail',
  'Automotive',
  'Healthcare',
  'Construction',
  'Other'
];

export function MarketScanForm({ onScan, isScanning }: MarketScanFormProps) {
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [radius, setRadius] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    onScan({
      location: location.trim(),
      industry: industry || 'hvac',
      radius_miles: radius
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Input */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter a city, ZIP, or industry..."
              className="input pl-10 focus:shadow-glow"
              required
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <p className="form-help">
            Enter a ZIP code, city name, or state
          </p>
        </div>

        {/* Industry Select */}
        <div className="form-group">
          <label htmlFor="industry" className="form-label">
            Industry
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="input"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind.toLowerCase()}>
                {ind}
              </option>
            ))}
          </select>
          <p className="form-help">
            Filter by specific industry (optional)
          </p>
        </div>

        {/* Radius Select */}
        <div className="form-group">
          <label htmlFor="radius" className="form-label">
            Search Radius
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="input"
          >
            <option value={10}>10 miles</option>
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={100}>100 miles</option>
          </select>
          <p className="form-help">
            Geographic search radius
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={isScanning || !location.trim()}
          className="btn-primary btn-lg flex-1 shadow-glow hover:shadow-glow"
        >
          {isScanning ? (
            <>
              <LoadingDots size="sm" color="white" />
              <span className="ml-2">Scanning Market...</span>
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            Search
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary btn-lg"
          onClick={() => {
            setLocation('');
            setIndustry('');
            setRadius(25);
          }}
        >
          Clear Form
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Quick scan:</span>
        {['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Miami'].map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setLocation(city)}
            className="badge badge-secondary hover:bg-primary-100 hover:text-primary-800 cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {city}
          </button>
        ))}
      </div>

      {/* Features Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What you'll get:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
            TAM/SAM/SOM estimates
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
            Business count & revenue
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
            HHI fragmentation score
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
            Succession risk analysis
          </div>
        </div>
      </div>
    </form>
  );
} 
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Sliders, Target, DollarSign, Users, Calendar, TrendingUp, MapPin } from 'lucide-react';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    minRevenue: number;
    maxRevenue: number;
    minEmployees: number;
    maxEmployees: number;
    minYears: number;
    maxYears: number;
    minRating: number;
    maxRating: number;
    minLeadScore: number;
    maxLeadScore: number;
    ownerAgeRange: string;
    riskLevel: string[];
    locationType: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function AdvancedFilters({ isOpen, onClose, filters, onFiltersChange }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      minRevenue: 0,
      maxRevenue: 10000000,
      minEmployees: 0,
      maxEmployees: 1000,
      minYears: 0,
      maxYears: 100,
      minRating: 0,
      maxRating: 5,
      minLeadScore: 0,
      maxLeadScore: 100,
      ownerAgeRange: 'any',
      riskLevel: ['high', 'medium', 'low'],
      locationType: 'any'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-okapi-brown-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-okapi-brown-100 rounded-lg">
                  <Sliders className="w-5 h-5 text-okapi-brown-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-okapi-brown-900">Advanced Filters</h2>
                  <p className="text-sm text-okapi-brown-600">Refine your market search</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-okapi-brown-400 hover:text-okapi-brown-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Revenue Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Revenue Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Minimum Revenue</label>
                    <input
                      type="number"
                      value={localFilters.minRevenue}
                      onChange={(e) => handleFilterChange('minRevenue', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-okapi-brown-500 mt-1">{formatCurrency(localFilters.minRevenue)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Maximum Revenue</label>
                    <input
                      type="number"
                      value={localFilters.maxRevenue}
                      onChange={(e) => handleFilterChange('maxRevenue', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="10000000"
                    />
                    <p className="text-xs text-okapi-brown-500 mt-1">{formatCurrency(localFilters.maxRevenue)}</p>
                  </div>
                </div>
              </div>

              {/* Employee Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Employee Count</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Min Employees</label>
                    <input
                      type="number"
                      value={localFilters.minEmployees}
                      onChange={(e) => handleFilterChange('minEmployees', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Max Employees</label>
                    <input
                      type="number"
                      value={localFilters.maxEmployees}
                      onChange={(e) => handleFilterChange('maxEmployees', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Years in Business */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Years in Business</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Min Years</label>
                    <input
                      type="number"
                      value={localFilters.minYears}
                      onChange={(e) => handleFilterChange('minYears', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Max Years</label>
                    <input
                      type="number"
                      value={localFilters.maxYears}
                      onChange={(e) => handleFilterChange('maxYears', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Rating Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Min Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={localFilters.minRating}
                      onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Max Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={localFilters.maxRating}
                      onChange={(e) => handleFilterChange('maxRating', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Score Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Lead Score Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Min Lead Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={localFilters.minLeadScore}
                      onChange={(e) => handleFilterChange('minLeadScore', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-okapi-brown-700 mb-2">Max Lead Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={localFilters.maxLeadScore}
                      onChange={(e) => handleFilterChange('maxLeadScore', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Age Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Owner Age Range</h3>
                </div>
                <select
                  value={localFilters.ownerAgeRange}
                  onChange={(e) => handleFilterChange('ownerAgeRange', e.target.value)}
                  className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                >
                  <option value="any">Any age</option>
                  <option value="50+">50+ years</option>
                  <option value="60+">60+ years</option>
                  <option value="70+">70+ years</option>
                  <option value="80+">80+ years</option>
                </select>
              </div>

              {/* Risk Level */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Risk Level</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'high', label: 'High Risk', color: 'text-red-600' },
                    { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600' },
                    { value: 'low', label: 'Low Risk', color: 'text-green-600' }
                  ].map((risk) => (
                    <label key={risk.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.riskLevel.includes(risk.value)}
                        onChange={(e) => {
                          const newRiskLevel = e.target.checked
                            ? [...localFilters.riskLevel, risk.value]
                            : localFilters.riskLevel.filter(r => r !== risk.value);
                          handleFilterChange('riskLevel', newRiskLevel);
                        }}
                        className="mr-3 text-okapi-brown-600 focus:ring-okapi-brown-500"
                      />
                      <span className={`text-sm font-medium ${risk.color}`}>{risk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Type */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-4 h-4 text-okapi-brown-600" />
                  <h3 className="font-semibold text-okapi-brown-900">Location Type</h3>
                </div>
                <select
                  value={localFilters.locationType}
                  onChange={(e) => handleFilterChange('locationType', e.target.value)}
                  className="w-full px-3 py-2 border border-okapi-brown-300 rounded-lg focus:ring-2 focus:ring-okapi-brown-500 focus:border-okapi-brown-500"
                >
                  <option value="any">Any location type</option>
                  <option value="urban">Urban areas only</option>
                  <option value="suburban">Suburban areas only</option>
                  <option value="rural">Rural areas only</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-okapi-brown-200 bg-okapi-brown-50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-4 py-2 text-okapi-brown-600 hover:text-okapi-brown-800 transition-colors"
              >
                Reset Filters
              </motion.button>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2 border border-okapi-brown-300 text-okapi-brown-700 rounded-lg hover:bg-okapi-brown-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApply}
                  className="px-6 py-2 bg-okapi-brown-600 text-white rounded-lg hover:bg-okapi-brown-700 transition-colors"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
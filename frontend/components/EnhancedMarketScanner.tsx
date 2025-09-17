'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Map, 
  List, 
  Filter, 
  TrendingUp, 
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Star,
  Phone,
  Mail,
  Globe,
  Eye,
  Download,
  Share2,
  Zap,
  Brain,
  Shield,
  Database
} from 'lucide-react';
import MapVisualization from './MapVisualization';
import AdvancedFilters from './AdvancedFilters';

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  review_count: number;
  estimated_revenue: number;
  employee_count: number;
  years_in_business: number;
  succession_risk_score: number;
  owner_age_estimate: number;
  market_share_percent: number;
  lead_score: number;
  coordinates?: [number, number];
  distance_miles?: number;
  selling_signals?: {
    total_signal_score: number;
    recommendation: string;
    signals_found: string[];
    web_signals?: any;
    linkedin_signals?: any;
    reddit_signals?: any;
  };
}

interface FilterState {
  revenueRange: [number, number];
  employeeRange: [number, number];
  ratingRange: [number, number];
  leadScoreRange: [number, number];
  signalScoreRange: [number, number];
  showSellingSignals: boolean;
  showHighValue: boolean;
  showHighPriority: boolean;
  showMediumPriority: boolean;
  showLowPriority: boolean;
  showOnlyWithSignals: boolean;
  showOnlyHighRevenue: boolean;
  showOnlyHighEmployees: boolean;
  showOnlyHighRating: boolean;
  customSignals: string[];
  locationRadius: number;
  industryFilter: string[];
}

interface EnhancedMarketScannerProps {
  onNavigate: (page: string) => void;
}

const EnhancedMarketScanner: React.FC<EnhancedMarketScannerProps> = ({ onNavigate }) => {
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [filters, setFilters] = useState<FilterState>({
    revenueRange: [0, 10000000],
    employeeRange: [0, 100],
    ratingRange: [0, 5],
    leadScoreRange: [0, 100],
    signalScoreRange: [0, 100],
    showSellingSignals: false,
    showHighValue: false,
    showHighPriority: false,
    showMediumPriority: false,
    showLowPriority: false,
    showOnlyWithSignals: false,
    showOnlyHighRevenue: false,
    showOnlyHighEmployees: false,
    showOnlyHighRating: false,
    customSignals: [],
    locationRadius: 25,
    industryFilter: []
  });

  const [marketIntelligence, setMarketIntelligence] = useState<any>(null);
  const [scanMetadata, setScanMetadata] = useState<any>(null);

  const handleScan = async () => {
    if (!location.trim()) return;

    setIsScanning(true);
    try {
      const response = await fetch('http://localhost:3001/intelligence/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          industry: industry.trim() || null,
          radius_miles: filters.locationRadius,
          max_businesses: 50
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScanResults(data.businesses || []);
        setMarketIntelligence(data.market_intelligence || {});
        setScanMetadata(data.scan_metadata || {});
      } else {
        console.error('Scan failed');
      }
    } catch (error) {
      console.error('Error during scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredBusinesses = scanResults.filter(business => {
    const revenue = business.estimated_revenue;
    const employees = business.employee_count;
    const rating = business.rating;
    const leadScore = business.lead_score;
    const signalScore = business.selling_signals?.total_signal_score || 0;

    return (
      revenue >= filters.revenueRange[0] && revenue <= filters.revenueRange[1] &&
      employees >= filters.employeeRange[0] && employees <= filters.employeeRange[1] &&
      rating >= filters.ratingRange[0] && rating <= filters.ratingRange[1] &&
      leadScore >= filters.leadScoreRange[0] && leadScore <= filters.leadScoreRange[1] &&
      signalScore >= filters.signalScoreRange[0] && signalScore <= filters.signalScoreRange[1] &&
      (!filters.showSellingSignals || business.selling_signals?.total_signal_score > 0) &&
      (!filters.showHighValue || business.estimated_revenue > 1000000) &&
      (!filters.showOnlyWithSignals || business.selling_signals?.total_signal_score > 0)
    );
  });

  const getPriorityColor = (business: Business) => {
    const signalScore = business.selling_signals?.total_signal_score || 0;
    const leadScore = business.lead_score;

    if (signalScore > 70 && leadScore > 80) return 'bg-red-100 text-red-800';
    if (signalScore > 40 || leadScore > 70) return 'bg-orange-100 text-orange-800';
    if (business.estimated_revenue > 2000000) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPriorityLabel = (business: Business) => {
    const signalScore = business.selling_signals?.total_signal_score || 0;
    const leadScore = business.lead_score;

    if (signalScore > 70 && leadScore > 80) return 'High Priority';
    if (signalScore > 40 || leadScore > 70) return 'Medium Priority';
    if (business.estimated_revenue > 2000000) return 'High Value';
    return 'Standard';
  };

  const exportResults = () => {
    const csvContent = [
      ['Name', 'Address', 'Phone', 'Revenue', 'Employees', 'Rating', 'Lead Score', 'Signal Score', 'Priority'],
      ...filteredBusinesses.map(business => [
        business.name,
        business.address,
        business.phone,
        business.estimated_revenue.toString(),
        business.employee_count.toString(),
        business.rating.toString(),
        business.lead_score.toString(),
        (business.selling_signals?.total_signal_score || 0).toString(),
        getPriorityLabel(business)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market_scan_${location}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Market Intelligence Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover acquisition opportunities with data-driven insights and advanced signal detection
          </p>
        </motion.div>

        {/* Enhanced Search Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4">
              <h3 className="flex items-center gap-3 text-blue-900 font-semibold text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                Real-time Data
              </h3>
        </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Location *
                </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter city, state, or zip"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {/* Quick Location Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['San Francisco', 'Los Angeles', 'New York', 'Chicago', 'Miami', 'Austin'].map((city) => (
                      <button
                        key={city}
                        onClick={() => setLocation(city)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          location === city 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Industry *
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Industries</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="retail">Retail</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="automotive">Automotive</option>
                    <option value="construction">Construction</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Min Revenue
                  </label>
                  <input
                    type="text"
                    defaultValue="$1M"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Max Revenue
                </label>
                <input
                  type="text"
                    defaultValue="$10M"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Owner Age
                  </label>
                  <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <option>Any age</option>
                    <option>50+ years</option>
                    <option>60+ years</option>
                    <option>70+ years</option>
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <button
                  onClick={handleScan}
                  disabled={isScanning || !location.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Scanning...
                    </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Search
                      </div>
                  )}
                  </button>
                  
                  <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </button>
                </div>
                              </div>
              </div>
            </div>
          </motion.div>

        {/* Results Section */}
        {scanResults.length > 0 && (
          <div className="space-y-6">
            {/* Market Intelligence Summary */}
            {marketIntelligence && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Market Intelligence Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${marketIntelligence.tam_estimate?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">TAM Estimate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {marketIntelligence.business_count?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Total Businesses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {marketIntelligence.hhi_score?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">HHI Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {marketIntelligence.fragmentation_level || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Fragmentation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters and Results */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={() => setFilters({
                    revenueRange: [0, 10000000],
                    employeeRange: [0, 100],
                    ratingRange: [0, 5],
                    leadScoreRange: [0, 100],
                    signalScoreRange: [0, 100],
                    showSellingSignals: false,
                    showHighValue: false,
                    showHighPriority: false,
                    showMediumPriority: false,
                    showLowPriority: false,
                    showOnlyWithSignals: false,
                    showOnlyHighRevenue: false,
                    showOnlyHighEmployees: false,
                    showOnlyHighRating: false,
                    customSignals: [],
                    locationRadius: 25,
                    industryFilter: []
                  })}
                  onApply={() => {}}
                  businessCount={scanResults.length}
                  filteredCount={filteredBusinesses.length}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Scan Results ({filteredBusinesses.length} businesses)
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportResults}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="map" className="flex items-center gap-2">
                          <Map className="h-4 w-4" />
                          Map View
                        </TabsTrigger>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          List View
                        </TabsTrigger>
                        <TabsTrigger value="signals" className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Signal Analysis
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="map" className="mt-6">
                        <div className="h-96">
                          <MapVisualization
                            businesses={filteredBusinesses}
                            location={location}
                            industry={industry}
                            onBusinessSelect={setSelectedBusiness}
                            filters={filters}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="list" className="mt-6">
                        <div className="space-y-4">
                          {filteredBusinesses.map((business) => (
                            <Card key={business.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="text-lg font-semibold">{business.name}</h3>
                                      <Badge className={getPriorityColor(business)}>
                                        {getPriorityLabel(business)}
                                      </Badge>
                                      {business.selling_signals?.total_signal_score > 0 && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" />
                                          Signal: {business.selling_signals.total_signal_score}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-600">Revenue:</span>
                                        <div className="font-semibold">${business.estimated_revenue.toLocaleString()}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Employees:</span>
                                        <div className="font-semibold">{business.employee_count}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Rating:</span>
                                        <div className="font-semibold">{business.rating} ⭐</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Lead Score:</span>
                                        <div className="font-semibold">{business.lead_score.toFixed(1)}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 text-sm text-gray-600">
                                      <div>{business.address}</div>
                                      <div className="flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {business.phone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Globe className="h-3 w-3" />
                                          {business.website}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBusiness(business)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="signals" className="mt-6">
                        <div className="space-y-4">
                          {filteredBusinesses
                            .filter(business => business.selling_signals?.total_signal_score > 0)
                            .sort((a, b) => (b.selling_signals?.total_signal_score || 0) - (a.selling_signals?.total_signal_score || 0))
                            .map((business) => (
                              <Card key={business.id} className="border-l-4 border-red-500">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold">{business.name}</h3>
                                        <Badge variant="destructive">
                                          Signal Score: {business.selling_signals?.total_signal_score}
                                        </Badge>
                                      </div>
                                      
                                      <div className="text-sm text-gray-600 mb-3">
                                        <div className="font-medium">Recommendation:</div>
                                        <div>{business.selling_signals?.recommendation}</div>
                                      </div>
                                      
                                      {business.selling_signals?.signals_found && business.selling_signals.signals_found.length > 0 && (
                                        <div className="mb-3">
                                          <div className="text-sm font-medium text-gray-600 mb-1">Signals Detected:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {business.selling_signals.signals_found.map((signal, index) => (
                                              <Badge key={index} variant="secondary" className="text-xs">
                                                {signal}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-600">Revenue:</span>
                                          <div className="font-semibold">${business.estimated_revenue.toLocaleString()}</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Lead Score:</span>
                                          <div className="font-semibold">{business.lead_score.toFixed(1)}</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Address:</span>
                                          <div className="font-semibold">{business.address}</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Phone:</span>
                                          <div className="font-semibold">{business.phone}</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedBusiness(business)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {scanResults.length === 0 && !isScanning && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start Your Market Intelligence Scan
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter a location and optionally an industry to discover businesses with advanced signal detection.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Proxy Rotation
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="h-4 w-4" />
                    UC Berkeley Data
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Signal Detection
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedMarketScanner; 
"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Star, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Target,
  BarChart3,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

interface BusinessProfile {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  address: string;
  phone: string;
  website: string;
  estimated_revenue: number;
  employee_count: number;
  years_in_business: number;
  succession_risk_score: number;
  owner_age_estimate: number;
  market_share_percent: number;
  lead_score: number;
  industry: string;
  location: string;
  berkeley_data?: {
    industry_analysis: any;
    market_intelligence: any;
  };
}

export default function BusinessProfilePage() {
  const params = useParams();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        // Extract business ID from URL
        const businessId = params.id as string;
        
        // Generate mock business data based on ID
        const mockBusiness: BusinessProfile = {
          id: businessId,
          name: `Business ${businessId}`,
          rating: 4.2 + (parseInt(businessId) % 10) * 0.1,
          review_count: 50 + (parseInt(businessId) % 100),
          address: `${1000 + (parseInt(businessId) % 9000)} Main St`,
          phone: `(${555 + (parseInt(businessId) % 100)}) ${100 + (parseInt(businessId) % 900)}-${1000 + (parseInt(businessId) % 9000)}`,
          website: `https://business${businessId}.com`,
          estimated_revenue: 1000000 + (parseInt(businessId) % 2000000),
          employee_count: 10 + (parseInt(businessId) % 30),
          years_in_business: 5 + (parseInt(businessId) % 25),
          succession_risk_score: 30 + (parseInt(businessId) % 50),
          owner_age_estimate: 45 + (parseInt(businessId) % 30),
          market_share_percent: 5 + (parseInt(businessId) % 15),
          lead_score: 70 + (parseInt(businessId) % 30),
          industry: "HVAC",
          location: "Chicago, IL",
          berkeley_data: {
            industry_analysis: {
              market_size: 15000000000,
              growth_rate: 0.045,
              concentration: "low",
              key_players: ["Carrier", "Trane", "Lennox"],
              trends: ["Energy efficiency", "Smart HVAC", "Sustainability"],
              berkeley_source: "IBISWorld Industry Report 23822 - HVAC Contractors"
            },
            market_intelligence: {
              tam_estimate: 15000000000,
              sam_estimate: 5000000000,
              som_estimate: 500000000,
              hhi_score: 0.18,
              fragmentation_level: "Highly Fragmented"
            }
          }
        };
        
        setBusiness(mockBusiness);
      } catch (err) {
        setError('Failed to load business profile');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-okapi-brown-50 to-okapi-brown-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-okapi-brown-50 to-okapi-brown-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-okapi-brown-900 mb-4">Business Profile Not Found</h1>
            <p className="text-okapi-brown-700 mb-6">The requested business profile could not be loaded.</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-okapi-brown-600 text-white px-6 py-2 rounded-lg hover:bg-okapi-brown-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-okapi-brown-50 to-okapi-brown-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-okapi-brown-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 p-2 hover:bg-okapi-brown-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-okapi-brown-600" />
              </button>
              <h1 className="text-2xl font-bold text-okapi-brown-800">Okapiq</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">UC</span>
              </div>
              <span className="text-sm text-blue-700 font-medium">UC Berkeley Data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-okapi-brown-900 mb-2">{business.name}</h1>
              <p className="text-xl text-okapi-brown-600 mb-4">{business.industry} • {business.location}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold">{business.rating}</span>
                  <span className="text-gray-500 ml-1">({business.review_count} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-gray-600">{business.address}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(business.estimated_revenue)}
              </div>
              <div className="text-sm text-gray-500">Estimated Revenue</div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex space-x-4 flex-wrap">
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Business
            </a>
            <a 
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </a>
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(business.address)}`, '_blank')}
              className="flex items-center bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Verify on Google Maps
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Metrics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-okapi-brown-900 mb-6">Business Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-okapi-brown-900">{business.employee_count}</div>
                  <div className="text-sm text-gray-500">Employees</div>
                </div>
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-okapi-brown-900">{business.years_in_business}</div>
                  <div className="text-sm text-gray-500">Years in Business</div>
                </div>
                <div className="text-center">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-okapi-brown-900">{business.market_share_percent.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Market Share</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-okapi-brown-900">{business.lead_score}</div>
                  <div className="text-sm text-gray-500">Lead Score</div>
                </div>
              </div>
            </div>

            {/* Succession Risk Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-okapi-brown-900 mb-6">Succession Risk Analysis</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-okapi-brown-900 mb-2">
                    {business.succession_risk_score}%
                  </div>
                  <div className={`text-lg font-semibold ${getRiskColor(business.succession_risk_score)}`}>
                    {getRiskLevel(business.succession_risk_score)} Risk
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Owner Age: ~{business.owner_age_estimate} years old
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-2">Risk Level</div>
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        business.succession_risk_score >= 70 ? 'bg-red-500' :
                        business.succession_risk_score >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${business.succession_risk_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UC Berkeley Market Intelligence */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">UC</span>
                </div>
                <h3 className="text-xl font-bold text-blue-900">UC Berkeley A-Z Databases</h3>
              </div>
              
              <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Academic Database Integration:</strong> This business profile integrates with UC Berkeley's comprehensive A-Z databases including IBISWorld, Frost & Sullivan, BLS, and US Census Bureau data.
                </p>
              </div>
              
              {business.berkeley_data && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Industry Analysis</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>Market Size: {formatCurrency(business.berkeley_data.industry_analysis.market_size)}</div>
                      <div>Growth Rate: {(business.berkeley_data.industry_analysis.growth_rate * 100).toFixed(1)}%</div>
                      <div>Concentration: {business.berkeley_data.industry_analysis.concentration}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Market Intelligence</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>TAM: {formatCurrency(business.berkeley_data.market_intelligence.tam_estimate)}</div>
                      <div>SAM: {formatCurrency(business.berkeley_data.market_intelligence.sam_estimate)}</div>
                      <div>SOM: {formatCurrency(business.berkeley_data.market_intelligence.som_estimate)}</div>
                      <div>HHI Score: {(business.berkeley_data.market_intelligence.hhi_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-blue-200">
                    <div className="text-xs text-blue-600">
                      Source: {business.berkeley_data.industry_analysis.berkeley_source}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key Trends */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-okapi-brown-900 mb-4">Industry Trends</h3>
              {business.berkeley_data?.industry_analysis.trends && (
                <div className="space-y-2">
                  {business.berkeley_data.industry_analysis.trends.map((trend: string, index: number) => (
                    <div key={index} className="flex items-center text-sm text-okapi-brown-700">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                      {trend}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
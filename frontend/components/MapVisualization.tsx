'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  };
}

interface MapVisualizationProps {
  businesses: Business[];
  location: string;
  industry: string;
  onBusinessSelect: (business: Business) => void;
  filters: {
    revenueRange: [number, number];
    employeeRange: [number, number];
    ratingRange: [number, number];
    leadScoreRange: [number, number];
    signalScoreRange: [number, number];
    showSellingSignals: boolean;
    showHighValue: boolean;
  };
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  businesses,
  location,
  industry,
  onBusinessSelect,
  filters
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [zoom, setZoom] = useState(12);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [clusters, setClusters] = useState<Business[][]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const [crimeHeatPoints, setCrimeHeatPoints] = useState<Array<[number, number, number]>>([]);

  // Get coordinates for location
  useEffect(() => {
    const getCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        if (data.length > 0) {
          const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setMapCenter(coords);
        }
      } catch (error) {
        console.error('Error getting coordinates:', error);
      }
    };

    if (location) {
      getCoordinates();
    }
  }, [location]);

  // Fetch live crime heat points for this view
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = new URL(`${apiBase}/analytics/crime-heat`);
    if (location) url.searchParams.set('city', location);
    url.searchParams.set('provider', 'crimeometer');
    url.searchParams.set('days_back', '180');
    url.searchParams.set('limit', '4000');
    const controller = new AbortController();
    const run = async () => {
      try {
        const resp = await fetch(url.toString(), { signal: controller.signal });
        if (!resp.ok) return;
        const data = await resp.json();
        const pts: Array<[number, number, number]> = Array.isArray(data?.points)
          ? data.points
              .map((p: any) => {
                const lat = p?.position?.[0];
                const lng = p?.position?.[1];
                const w = typeof p?.intensity === 'number' ? p.intensity : 0.5;
                if (typeof lat === 'number' && typeof lng === 'number') return [lat, lng, Math.max(0.05, Math.min(1, w))] as [number, number, number];
                return null;
              })
              .filter(Boolean)
          : [];
        setCrimeHeatPoints(pts);
      } catch {}
    };
    run();
    return () => controller.abort();
  }, [location]);

  // Filter businesses based on criteria
  const filteredBusinesses = businesses.filter(business => {
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
      (!filters.showHighValue || business.estimated_revenue > 1000000)
    );
  });

  // Create clusters for nearby businesses
  useEffect(() => {
    const createClusters = () => {
      const clusters: Business[][] = [];
      const used = new Set<string>();

      filteredBusinesses.forEach(business => {
        if (used.has(business.id)) return;

        const cluster = [business];
        used.add(business.id);

        filteredBusinesses.forEach(other => {
          if (used.has(other.id)) return;

          // Calculate distance (simplified)
          const distance = Math.abs((business.coordinates?.[0] || 0) - (other.coordinates?.[0] || 0)) +
                          Math.abs((business.coordinates?.[1] || 0) - (other.coordinates?.[1] || 0));

          if (distance < 0.01) { // Very close businesses
            cluster.push(other);
            used.add(other.id);
          }
        });

        clusters.push(cluster);
      });

      setClusters(clusters);
    };

    createClusters();
  }, [filteredBusinesses]);

  const getMarkerColor = (business: Business) => {
    const signalScore = business.selling_signals?.total_signal_score || 0;
    const leadScore = business.lead_score;
    const revenue = business.estimated_revenue;

    // High priority: High signal score + high lead score
    if (signalScore > 70 && leadScore > 80) return '#dc2626'; // Red
    // Medium priority: High signal score OR high lead score
    if (signalScore > 40 || leadScore > 70) return '#f59e0b'; // Orange
    // High value: High revenue
    if (revenue > 2000000) return '#10b981'; // Green
    // Default
    return '#3b82f6'; // Blue
  };

  const getMarkerSize = (business: Business) => {
    const revenue = business.estimated_revenue;
    if (revenue > 5000000) return 25;
    if (revenue > 2000000) return 20;
    if (revenue > 1000000) return 15;
    return 10;
  };

  const createCustomIcon = (business: Business) => {
    const color = getMarkerColor(business);
    const size = getMarkerSize(business);

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${size * 0.4}px;
          font-weight: bold;
        ">
          ${business.name.charAt(0)}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const BusinessPopup: React.FC<{ business: Business }> = ({ business }) => (
    <div className="business-popup">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{business.name}</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Revenue:</span>
          <span className="font-semibold">${business.estimated_revenue.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Employees:</span>
          <span className="font-semibold">{business.employee_count}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Rating:</span>
          <span className="font-semibold">{business.rating} ⭐</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Lead Score:</span>
          <span className="font-semibold">{business.lead_score.toFixed(1)}</span>
        </div>
        
        {business.selling_signals && (
          <div className="flex justify-between">
            <span className="text-gray-600">Signal Score:</span>
            <span className={`font-semibold ${
              business.selling_signals.total_signal_score > 70 ? 'text-red-600' :
              business.selling_signals.total_signal_score > 40 ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {business.selling_signals.total_signal_score}
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <div className="text-sm text-gray-500">{business.address}</div>
          <div className="text-sm text-gray-500">{business.phone}</div>
        </div>
        
        <button
          onClick={() => onBusinessSelect(business)}
          className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );

  const ClusterMarker: React.FC<{ cluster: Business[]; center: [number, number] }> = ({ cluster, center }) => {
    const totalRevenue = cluster.reduce((sum, b) => sum + b.estimated_revenue, 0);
    const avgLeadScore = cluster.reduce((sum, b) => sum + b.lead_score, 0) / cluster.length;
    const signalScores = cluster.map(b => b.selling_signals?.total_signal_score || 0);
    const maxSignalScore = Math.max(...signalScores);

    return (
      <Circle
        center={center}
        radius={cluster.length * 50}
        pathOptions={{
          fillColor: maxSignalScore > 70 ? '#dc2626' : maxSignalScore > 40 ? '#f59e0b' : '#10b981',
          fillOpacity: 0.3,
          color: maxSignalScore > 70 ? '#dc2626' : maxSignalScore > 40 ? '#f59e0b' : '#10b981',
          weight: 2
        }}
      >
        <Popup>
          <div className="cluster-popup">
            <h3 className="text-lg font-bold mb-2">{cluster.length} Businesses</h3>
            <div className="space-y-1 text-sm">
              <div>Total Revenue: ${totalRevenue.toLocaleString()}</div>
              <div>Avg Lead Score: {avgLeadScore.toFixed(1)}</div>
              <div>Max Signal Score: {maxSignalScore}</div>
            </div>
            <button
              onClick={() => {
                // Zoom to cluster
                if (mapRef.current) {
                  mapRef.current.setView(center, 15);
                }
              }}
              className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Zoom to Cluster
            </button>
          </div>
        </Popup>
      </Circle>
    );
  };

  return (
    <div className="map-container h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Simple heat visualization using circles (keeps bundle light without heat plugin) */}
        {crimeHeatPoints.slice(0, 2000).map((p, idx) => (
          <Circle
            key={`crime-${idx}`}
            center={[p[0], p[1]] as any}
            radius={120}
            pathOptions={{
              color: 'rgba(220,38,38,0.5)',
              fillColor: 'rgba(220,38,38,0.3)',
              fillOpacity: Math.min(0.8, Math.max(0.2, p[2]))
            }}
          />
        ))}
        
        {/* Render individual businesses */}
        {filteredBusinesses.map((business) => {
          if (!business.coordinates) return null;
          
          return (
            <Marker
              key={business.id}
              position={business.coordinates}
              icon={createCustomIcon(business)}
              eventHandlers={{
                click: () => setSelectedBusiness(business)
              }}
            >
              <Popup>
                <BusinessPopup business={business} />
              </Popup>
            </Marker>
          );
        })}
        
        {/* Render clusters */}
        {clusters.map((cluster, index) => {
          if (cluster.length === 1) return null; // Single business, already rendered above
          
          const center: [number, number] = [
            cluster.reduce((sum, b) => sum + (b.coordinates?.[0] || 0), 0) / cluster.length,
            cluster.reduce((sum, b) => sum + (b.coordinates?.[1] || 0), 0) / cluster.length
          ];
          
          return (
            <ClusterMarker key={`cluster-${index}`} cluster={cluster} center={center} />
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-bold mb-2">Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>High Priority (Signal + Lead)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>High Value</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Standard</span>
          </div>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-bold mb-2">Controls</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(mapCenter, zoom);
              }
            }}
            className="w-full px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Reset View
          </button>
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(mapRef.current.getZoom() + 1);
              }
            }}
            className="w-full px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Zoom In
          </button>
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(mapRef.current.getZoom() - 1);
              }
            }}
            className="w-full px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Zoom Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization; 
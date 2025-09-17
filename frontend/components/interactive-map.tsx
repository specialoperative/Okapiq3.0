"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Pane = dynamic(
  () => import('react-leaflet').then((mod) => mod.Pane),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

// HeatLayer via leaflet.heat
const HeatmapLayer = dynamic(
  async () => {
    const Leaflet = await import('leaflet');
    await import('leaflet.heat');
    const { MapContainer } = await import('react-leaflet');
    // Create a small wrapper component to attach L.heatLayer imperatively
    const { useMap } = await import('react-leaflet');
    const Heat: React.FC<{ points: Array<[number, number, number]> }>
      = ({ points }) => {
        const map = useMap();
        React.useEffect(() => {
          if (!map || !points || points.length === 0) return;
          // Access heatLayer from possible export locations (CJS/ESM interop)
          // @ts-ignore
          const heatFactory = (Leaflet as any).heatLayer || (Leaflet as any).default?.heatLayer || (typeof window !== 'undefined' && (window as any).L?.heatLayer);
          if (!heatFactory) return;
          let layer: any = null;
          let cancelled = false;
          let timer: any = null;
          const init = () => {
            if (cancelled) return;
            if (!(map as any)._loaded || !(map as any)._leaflet_id || typeof (map as any).getSize !== 'function') {
              // Try again shortly if map not fully ready
              timer = setTimeout(init, 60);
              return;
            }

            const baseZoom = map.getZoom();
            const baseRadius = 34;
            const makeGradient = (alpha: number) => ({
              0.00: `rgba(86, 211, 100, ${alpha})`,   // green
              0.15: `rgba(163, 230, 53, ${alpha})`,   // lime
              0.25: `rgba(250, 204, 21, ${alpha})`,   // yellow
              0.30: `rgba(251, 146, 60, ${alpha})`,   // orange
              0.35: `rgba(239, 68, 68, ${alpha})`,    // red quick onset
              1.00: `rgba(153, 27, 27, ${alpha})`     // dark red
            });

            // Initial alpha based on current zoom (more transparent as you zoom in)
            const z0 = Math.max(1, Math.min(20, baseZoom));
            // Start moderately opaque; we increase a bit as the user zooms in
            const initialAlpha = 0.85;
            layer = heatFactory(points, {
              radius: baseRadius,
              blur: 16,
              maxZoom: 20,
              // Keep reds visible at all zoom levels
              max: 0.95,
              gradient: makeGradient(initialAlpha)
            }).addTo(map);

            let raf: number | null = null;
            const applyZoom = () => {
              if (!layer || !(layer as any)._map) return;
              const z = map.getZoom();
              const scale = Math.max(0.5, map.getZoomScale(z, baseZoom));
              // Ensure halos never shrink to invisibility; clamp radius in pixels
              // Ensure halos remain visible as you zoom in: grow radius a bit with zoom
              const radius = Math.max(24, Math.min(80, Math.round(34 * Math.pow(scale, 0.55))));
              // Maintain strong visibility at high zoom
              const alpha = Math.min(1.0, Math.max(0.75, 0.85 + Math.max(0, z - baseZoom) * 0.03));
              // Sharpen slightly when zooming in
              const blur = Math.max(10, Math.round(22 / Math.pow(scale, 0.35)));
              // Keep reds saturated; don't drop max too low when zooming
              const maxVal = Math.max(0.7, 0.95 - Math.max(0, z - baseZoom) * 0.03);
              layer.setOptions({ radius, max: maxVal, blur, gradient: makeGradient(alpha) });
              // Densify heat points at high zoom to avoid gaps
              if (scale >= 2 && (layer as any).setLatLngs) {
                const jitter = Math.min(0.02, 0.08 / scale);
                const expanded: Array<[number, number, number]> = [];
                for (const p of (points as Array<[number, number, number]>)) {
                  const [lat, lng, w] = p;
                  expanded.push(p);
                  expanded.push([lat + jitter, lng, w]);
                  expanded.push([lat - jitter, lng, w]);
                  expanded.push([lat, lng + jitter, w]);
                  expanded.push([lat, lng - jitter, w]);
                }
                (layer as any).setLatLngs(expanded);
              }
            };
            const scheduleZoom = () => {
              if (raf) cancelAnimationFrame(raf as number);
              raf = requestAnimationFrame(applyZoom);
            };
            (layer as any).__handleZoom = scheduleZoom;
            map.on('zoom', scheduleZoom);
            map.on('zoomend', scheduleZoom);
            map.on('moveend', scheduleZoom);
            scheduleZoom();
          };
          // Defer initialization slightly to ensure container exists
          timer = setTimeout(init, 0);

          return () => {
            cancelled = true;
            try {
              if (timer) clearTimeout(timer);
              if (layer) {
                if ((layer as any).__handleZoom) {
                  map.off('zoom', (layer as any).__handleZoom);
                  map.off('zoomend', (layer as any).__handleZoom);
                  map.off('moveend', (layer as any).__handleZoom);
                }
                if ((layer as any).setLatLngs) {
                  (layer as any).setLatLngs([]);
                }
                map.removeLayer(layer);
                // extra guard to avoid plugin animation callbacks
                try { (layer as any)._map = null; } catch {}
                layer = null;
              }
            } catch {}
          };
        }, [map, JSON.stringify(points)]);
        return null as any;
      };
    // Explicitly return a component accepting `points` prop to satisfy TS
    return (Heat as unknown) as React.ComponentType<{ points: Array<[number, number, number]> }>;
  },
  { ssr: false }
);

export type MapBusiness = {
  id: string | number;
  name: string;
  position: [number, number];
  tam?: string;
  score?: number;
};

type InteractiveMapProps = {
  businesses?: MapBusiness[];
  center?: [number, number];
  heightClassName?: string;
  onBusinessClick?: (b: MapBusiness) => void;
  // Optional heat overlay (Crimeometer via backend)
  showHeat?: boolean;
  zoom?: number;
  fitToBusinesses?: boolean;
  // Optional explicit markers to render (e.g., from results list)
  markerItems?: MapBusiness[];
  // Live crime overlay via backend proxy (Crimeometer if configured)
  crimeCity?: string;
  crimeDaysBack?: number;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  businesses = [
    { id: 1, name: "Golden Gate HVAC", position: [37.7749, -122.4194], tam: "$12M TAM", score: 92 },
    { id: 2, name: "Bay Area Plumbing Co", position: [37.7849, -122.4094], tam: "$8M TAM", score: 88 },
    { id: 3, name: "SF Electrical Services", position: [37.7649, -122.4294], tam: "$15M TAM", score: 85 },
  ],
  center = [37.7749, -122.4194],
  heightClassName = "h-96",
  onBusinessClick,
  showHeat = false,
  zoom = 13,
  fitToBusinesses = true,
  markerItems,
  crimeCity,
  crimeDaysBack = 180,
}) => {
  const mapRef = useRef<any>(null);
  // Crime data is now rendered via tiles, no state needed

  const computedCenter = useMemo<[number, number]>(() => {
    if (center && Array.isArray(center) && typeof center[0] === 'number' && typeof center[1] === 'number') {
      return center;
    }
    if (businesses && businesses.length > 0) {
      return businesses[0].position;
    }
    return [37.7749, -122.4194];
  }, [center, businesses]);

  useEffect(() => {
    if (!mapRef.current) return;
    const items = markerItems && markerItems.length > 0 ? markerItems : businesses || [];
    if (items.length === 0) return;
    if (!fitToBusinesses) return;
    (async () => {
      try {
        const L = await import('leaflet');
        const bounds = L.latLngBounds(
          items.map((b) => L.latLng(b.position[0], b.position[1]))
        );
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      } catch {}
    })();
  }, [JSON.stringify(markerItems), JSON.stringify(businesses), fitToBusinesses]);

  // Note: Crime data is now rendered via tile layer, no need to fetch points

  return (
    <div className={`w-full ${heightClassName} border border-gray-200 rounded-lg overflow-hidden`}>
      <MapContainer
        center={computedCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
        whenCreated={(map) => {
          mapRef.current = map as any;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Crimeometer Crime Heat Tile Layer - exact match to their website */}
        {showHeat && (
          <>
            <Pane name="crime-heat" style={{ zIndex: 650, pointerEvents: 'none' }}>
              <TileLayer
                url={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/crime-tiles/{z}/{x}/{y}?provider=crimeometer&city=${encodeURIComponent(crimeCity || 'us')}&days_back=${crimeDaysBack}&_t=${Date.now()}`}
                attribution='Crime data &copy; <a href="https://www.crimeometer.com">Crimeometer</a>'
                opacity={0.9}
                zIndex={1000}
                crossOrigin={'anonymous' as any}
                pane="crime-heat"
                key={`${crimeCity}-${crimeDaysBack}-${Date.now()}`}
                eventHandlers={{
                  loading: () => console.log('🔥 Crime tiles loading...'),
                  load: () => console.log('✅ Crime tiles loaded'),
                  tileerror: (e: any) => console.warn('❌ Tile error:', e),
                  tileload: (e: any) => console.log('📍 Tile loaded:', e.coords),
                  tileloadstart: (e: any) => console.log(`🚀 Tile load start for city="${crimeCity}":`, e.coords)
                }}
              />
            </Pane>
            
            {/* Debug info overlay */}
            <div style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              background: 'rgba(0,0,0,0.8)', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '12px', 
              zIndex: 2000,
              fontFamily: 'monospace'
            }}>
              Crime: {crimeCity || 'us'} | Days: {crimeDaysBack} | Heat: {showHeat ? 'ON' : 'OFF'}
            </div>

          </>
        )}
        


        {(markerItems ?? (!showHeat ? businesses : [])).map((business) => (
          <Marker 
            key={business.id} 
            position={business.position as [number, number]}
            eventHandlers={onBusinessClick ? { click: () => onBusinessClick(business) } : undefined}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-semibold text-gray-900">{business.name}</h3>
                {business.tam && <p className="text-sm text-gray-600">{business.tam}</p>}
                {typeof business.score === 'number' && <p className="text-sm text-gray-600">Score: {business.score}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Optional alternative overlay disabled */}
      </MapContainer>
      
      {/* Map attribution */}
      <div className="text-xs text-gray-500 p-2 bg-white">
        © Leaflet | © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default InteractiveMap;
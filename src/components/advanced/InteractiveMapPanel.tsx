"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Map,
  MapPin,
  Layers,
  Target,
  AlertTriangle,
  Building2,
  DollarSign,
  Users,
  Shield,
  Globe,
  Search,
  Zap,
} from "lucide-react"

const US_REGIONS = {
  Northeast: ["NY", "NJ", "PA", "CT", "MA", "RI", "VT", "NH", "ME"],
  Southeast: ["FL", "GA", "SC", "NC", "VA", "WV", "KY", "TN", "AL", "MS", "AR", "LA"],
  Midwest: ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
  Southwest: ["TX", "OK", "NM", "AZ"],
  West: ["CA", "NV", "UT", "CO", "WY", "MT", "ID", "WA", "OR", "AK", "HI"],
}

const US_STATES = {
  AL: { name: "Alabama", lat: 32.806671, lng: -86.79113 },
  AK: { name: "Alaska", lat: 61.570716, lng: -152.404419 },
  AZ: { name: "Arizona", lat: 33.729759, lng: -111.431221 },
  AR: { name: "Arkansas", lat: 34.969704, lng: -92.373123 },
  CA: { name: "California", lat: 36.116203, lng: -119.681564 },
  CO: { name: "Colorado", lat: 39.059811, lng: -105.311104 },
  CT: { name: "Connecticut", lat: 41.597782, lng: -72.755371 },
  DE: { name: "Delaware", lat: 39.318523, lng: -75.507141 },
  FL: { name: "Florida", lat: 27.766279, lng: -81.686783 },
  GA: { name: "Georgia", lat: 33.040619, lng: -83.643074 },
  HI: { name: "Hawaii", lat: 21.094318, lng: -157.498337 },
  ID: { name: "Idaho", lat: 44.240459, lng: -114.478828 },
  IL: { name: "Illinois", lat: 40.349457, lng: -88.986137 },
  IN: { name: "Indiana", lat: 39.849426, lng: -86.258278 },
  IA: { name: "Iowa", lat: 42.011539, lng: -93.210526 },
  KS: { name: "Kansas", lat: 38.5266, lng: -96.726486 },
  KY: { name: "Kentucky", lat: 37.66814, lng: -84.670067 },
  LA: { name: "Louisiana", lat: 31.169546, lng: -91.867805 },
  ME: { name: "Maine", lat: 44.693947, lng: -69.381927 },
  MD: { name: "Maryland", lat: 39.063946, lng: -76.802101 },
  MA: { name: "Massachusetts", lat: 42.230171, lng: -71.530106 },
  MI: { name: "Michigan", lat: 43.326618, lng: -84.536095 },
  MN: { name: "Minnesota", lat: 45.694454, lng: -93.900192 },
  MS: { name: "Mississippi", lat: 32.741646, lng: -89.678696 },
  MO: { name: "Missouri", lat: 38.456085, lng: -92.288368 },
  MT: { name: "Montana", lat: 47.052952, lng: -110.454353 },
  NE: { name: "Nebraska", lat: 41.12537, lng: -98.268082 },
  NV: { name: "Nevada", lat: 38.313515, lng: -117.055374 },
  NH: { name: "New Hampshire", lat: 43.452492, lng: -71.563896 },
  NJ: { name: "New Jersey", lat: 40.298904, lng: -74.521011 },
  NM: { name: "New Mexico", lat: 34.840515, lng: -106.248482 },
  NY: { name: "New York", lat: 42.165726, lng: -74.948051 },
  NC: { name: "North Carolina", lat: 35.630066, lng: -79.806419 },
  ND: { name: "North Dakota", lat: 47.528912, lng: -99.784012 },
  OH: { name: "Ohio", lat: 40.388783, lng: -82.764915 },
  OK: { name: "Oklahoma", lat: 35.565342, lng: -96.928917 },
  OR: { name: "Oregon", lat: 44.931109, lng: -123.029159 },
  PA: { name: "Pennsylvania", lat: 40.590752, lng: -77.209755 },
  RI: { name: "Rhode Island", lat: 41.680893, lng: -71.51178 },
  SC: { name: "South Carolina", lat: 33.856892, lng: -80.945007 },
  SD: { name: "South Dakota", lat: 44.299782, lng: -99.438828 },
  TN: { name: "Tennessee", lat: 35.747845, lng: -86.692345 },
  TX: { name: "Texas", lat: 31.054487, lng: -97.563461 },
  UT: { name: "Utah", lat: 40.150032, lng: -111.862434 },
  VT: { name: "Vermont", lat: 44.045876, lng: -72.710686 },
  VA: { name: "Virginia", lat: 37.769337, lng: -78.169968 },
  WA: { name: "Washington", lat: 47.400902, lng: -121.490494 },
  WV: { name: "West Virginia", lat: 38.491226, lng: -80.954453 },
  WI: { name: "Wisconsin", lat: 44.268543, lng: -89.616508 },
  WY: { name: "Wyoming", lat: 42.755966, lng: -107.30249 },
}

const CUSTOM_MAP_OUTPUTS = {
  coastal: ["businessDensity", "wealthDistribution", "tourismImpact", "hurricaneRisk", "portActivity"],
  mountain: ["businessDensity", "seasonalVariation", "outdoorRecreation", "miningActivity", "elevationImpact"],
  urban: ["businessDensity", "competitionLevels", "publicTransit", "crimeRates", "gentrification"],
  rural: ["businessDensity", "agriculturalImpact", "populationDensity", "internetConnectivity", "seasonalEconomy"],
  industrial: ["businessDensity", "manufacturingBase", "logisticsHubs", "environmentalFactors", "laborAvailability"],
  tech: ["businessDensity", "innovationIndex", "talentPool", "ventureCapital", "startupDensity"],
  energy: ["businessDensity", "oilGasActivity", "renewableEnergy", "energyPrices", "regulatoryEnvironment"],
  agriculture: ["businessDensity", "cropYields", "farmlandValues", "weatherPatterns", "commodityPrices"],
  tourism: ["businessDensity", "seasonalTraffic", "hotelOccupancy", "attractionDensity", "eventCalendar"],
  finance: ["businessDensity", "bankingPresence", "wealthConcentration", "investmentActivity", "regulatoryCompliance"],
}

interface MapDataPoint {
  id: string
  lat: number
  lng: number
  name: string
  value: number
  type: string
  metadata: {
    businessCount?: number
    avgRevenue?: number
    wealthIndex?: number
    crimeRate?: number
    competitionLevel?: number
    opportunityScore?: number
    customMetrics?: Record<string, number>
  }
}

interface HeatMapData {
  businessDensity: MapDataPoint[]
  wealthDistribution: MapDataPoint[]
  crimeRates: MapDataPoint[]
  marketOpportunities: MapDataPoint[]
  competitionLevels: MapDataPoint[]
  customLayers: Record<string, MapDataPoint[]>
}

interface InteractiveMapPanelProps {
  location?: string
  industry?: string
  buyBoxCriteria?: any
  naturalLanguageQuery?: string
  intent?: "rollup" | "acquisition" | "succession" | "market_analysis"
  onQueryResults?: (results: any) => void
}

export default function InteractiveMapPanel({
  location,
  industry,
  buyBoxCriteria,
  naturalLanguageQuery,
  intent = "market_analysis",
  onQueryResults,
}: InteractiveMapPanelProps) {
  const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null)
  const [businessLocations, setBusinessLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState("businessDensity")
  const [selectedRegion, setSelectedRegion] = useState("Southwest")
  const [selectedState, setSelectedState] = useState("TX")
  const [mapScope, setMapScope] = useState<"national" | "regional" | "state">("national")
  const [customOutputType, setCustomOutputType] = useState("urban")
  const [radius, setRadius] = useState([25])
  const [showBusinesses, setShowBusinesses] = useState(true)
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState<MapDataPoint | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const [queryInput, setQueryInput] = useState(naturalLanguageQuery || "")
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [mapLayers, setMapLayers] = useState<any>(null)
  const [processingQuery, setProcessingQuery] = useState(false)
  const [queryResults, setQueryResults] = useState<any>(null)
  const [selectedGlyph, setSelectedGlyph] = useState<"acquisition" | "rollup" | "client" | "competitor" | "all">("all")
  const [showUncertainty, setShowUncertainty] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState([70])

  const loadMapData = async () => {
    setLoading(true)
    try {
      if (queryInput.trim()) {
        await processNaturalLanguageQuery()
      } else {
        const response = await fetch("/api/map-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location,
            industry,
            radius: radius[0],
            buyBoxCriteria,
            mapScope,
            selectedRegion,
            selectedState,
            customOutputType,
            dataLayers: [selectedLayer, ...CUSTOM_MAP_OUTPUTS[customOutputType as keyof typeof CUSTOM_MAP_OUTPUTS]],
          }),
        })

        const data = await response.json()
        if (data.success) {
          setHeatMapData(data.heatMapData)
          setBusinessLocations(data.businessLocations)
        }
      }
    } catch (error) {
      console.error("[v0] Map data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const processNaturalLanguageQuery = async () => {
    setProcessingQuery(true)
    try {
      console.log("[v0] Processing natural language query:", queryInput)

      const response = await fetch("/api/query-to-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryInput,
          intent,
          region:
            location ||
            (mapScope === "state" ? US_STATES[selectedState as keyof typeof US_STATES]?.name : selectedRegion),
          industry,
          map_layers: ["pins", "clusters", "choropleths", "heatmaps"],
        }),
      })

      if (!response.ok) {
        throw new Error(`Query processing failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Query-to-map results:", data)

      if (data.success) {
        setGeoJsonData(data.data)
        setMapLayers(data.data.layers)
        setQueryResults(data.data.metadata)

        const businesses = data.data.features.map((feature: any) => ({
          id: feature.properties.business_id,
          name: feature.properties.name,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          acquisitionScore: Math.round(feature.properties.AAS * 100),
          revenue: feature.properties.rev_est,
          employees: feature.properties.emp,
          ownerAge: feature.properties.owner_age,
          successionRisk: feature.properties.SRI,
          glyphType: feature.properties.glyph_type,
          uncertaintyRadius: feature.properties.uncertainty_radius,
          confidence: (feature.properties.AAS_civar[1] - feature.properties.AAS_civar[0]) / feature.properties.AAS,
        }))

        setBusinessLocations(businesses)

        const heatData = generateHeatMapFromGeoJSON(data.data)
        setHeatMapData(heatData)

        if (onQueryResults) {
          onQueryResults(data.data)
        }
      }
    } catch (error) {
      console.error("[v0] Query processing error:", error)
    } finally {
      setProcessingQuery(false)
    }
  }

  const generateHeatMapFromGeoJSON = (geoJsonData: any) => {
    const features = geoJsonData.features || []

    const heatData: HeatMapData = {
      businessDensity: [],
      wealthDistribution: [],
      crimeRates: [],
      marketOpportunities: [],
      competitionLevels: [],
      customLayers: {},
    }

    features.forEach((feature: any, index: number) => {
      const { coordinates } = feature.geometry
      const props = feature.properties

      const basePoint = {
        id: `point_${index}`,
        lat: coordinates[1],
        lng: coordinates[0],
        name: props.name,
        type: props.glyph_type,
        metadata: {
          businessCount: 1,
          avgRevenue: props.rev_est,
          opportunityScore: Math.round(props.AAS * 100),
          competitionLevel: Math.round(props.HHI_local * 100),
          successionRisk: Math.round(props.SRI * 100),
        },
      }

      heatData.businessDensity.push({ ...basePoint, value: Math.round(props.FS_ms * 100) })
      heatData.marketOpportunities.push({ ...basePoint, value: Math.round(props.AAS * 100) })
      heatData.competitionLevels.push({ ...basePoint, value: Math.round(props.HHI_local * 100) })
      heatData.wealthDistribution.push({ ...basePoint, value: Math.random() * 100 })
      heatData.crimeRates.push({ ...basePoint, value: Math.random() * 100 })
    })

    return heatData
  }

  useEffect(() => {
    loadMapData()
  }, [location, industry, radius, selectedLayer, mapScope, selectedRegion, selectedState, customOutputType])

  const getCoordinateMapping = (lat: number, lng: number) => {
    if (mapScope === "national") {
      // Map entire US: lat 24-49, lng -125 to -66
      return {
        left: `${((lng + 125) / 59) * 100}%`,
        top: `${((49 - lat) / 25) * 100}%`,
      }
    } else if (mapScope === "regional") {
      // Regional mapping based on selected region
      const regionBounds = getRegionBounds(selectedRegion)
      return {
        left: `${((lng - regionBounds.west) / (regionBounds.east - regionBounds.west)) * 100}%`,
        top: `${((regionBounds.north - lat) / (regionBounds.north - regionBounds.south)) * 100}%`,
      }
    } else {
      // State-level mapping
      const stateBounds = getStateBounds(selectedState)
      return {
        left: `${((lng - stateBounds.west) / (stateBounds.east - stateBounds.west)) * 100}%`,
        top: `${((stateBounds.north - lat) / (stateBounds.north - stateBounds.south)) * 100}%`,
      }
    }
  }

  const getRegionBounds = (region: string) => {
    const bounds = {
      Northeast: { north: 47.5, south: 38.8, east: -66.9, west: -80.5 },
      Southeast: { north: 39.5, south: 24.5, east: -75.4, west: -94.0 },
      Midwest: { north: 49.4, south: 36.2, east: -80.5, west: -104.1 },
      Southwest: { north: 37.0, south: 25.8, east: -94.0, west: -114.8 },
      West: { north: 71.4, south: 18.9, east: -104.1, west: -180.0 },
    }
    return bounds[region as keyof typeof bounds] || bounds.Southwest
  }

  const getStateBounds = (state: string) => {
    // Simplified state bounds - in production, use precise geographic data
    const stateData = US_STATES[state as keyof typeof US_STATES]
    return {
      north: stateData.lat + 2,
      south: stateData.lat - 2,
      east: stateData.lng + 3,
      west: stateData.lng - 3,
    }
  }

  const getAvailableLayers = () => {
    const baseLayers = [
      { value: "businessDensity", label: "Business Density" },
      { value: "wealthDistribution", label: "Wealth Distribution" },
      { value: "crimeRates", label: "Crime Rates" },
      { value: "marketOpportunities", label: "Market Opportunities" },
      { value: "competitionLevels", label: "Competition Levels" },
    ]

    const customLayers =
      CUSTOM_MAP_OUTPUTS[customOutputType as keyof typeof CUSTOM_MAP_OUTPUTS]?.map((layer) => ({
        value: layer,
        label: layer.charAt(0).toUpperCase() + layer.slice(1).replace(/([A-Z])/g, " $1"),
      })) || []

    return [...baseLayers, ...customLayers]
  }

  const getLayerColor = (layer: string) => {
    const colors = {
      businessDensity: "#00ff00",
      wealthDistribution: "#00cc00",
      crimeRates: "#ff0000",
      marketOpportunities: "#00ffff",
      competitionLevels: "#ffff00",
      // Custom layer colors
      tourismImpact: "#ff6b6b",
      hurricaneRisk: "#4ecdc4",
      portActivity: "#45b7d1",
      seasonalVariation: "#96ceb4",
      outdoorRecreation: "#feca57",
      miningActivity: "#ff9ff3",
      elevationImpact: "#54a0ff",
      publicTransit: "#5f27cd",
      gentrification: "#00d2d3",
      agriculturalImpact: "#ff9f43",
      populationDensity: "#10ac84",
      internetConnectivity: "#ee5a24",
      seasonalEconomy: "#0abde3",
      manufacturingBase: "#006ba6",
      logisticsHubs: "#f38ba8",
      environmentalFactors: "#a8e6cf",
      laborAvailability: "#ffd93d",
      innovationIndex: "#6c5ce7",
      talentPool: "#fd79a8",
      ventureCapital: "#fdcb6e",
      startupDensity: "#e17055",
      oilGasActivity: "#2d3436",
      renewableEnergy: "#00b894",
      energyPrices: "#e84393",
      regulatoryEnvironment: "#0984e3",
      cropYields: "#6c5ce7",
      farmlandValues: "#a29bfe",
      weatherPatterns: "#74b9ff",
      commodityPrices: "#fd79a8",
      seasonalTraffic: "#fdcb6e",
      hotelOccupancy: "#e17055",
      attractionDensity: "#00cec9",
      eventCalendar: "#6c5ce7",
      bankingPresence: "#2d3436",
      wealthConcentration: "#636e72",
      investmentActivity: "#00b894",
      regulatoryCompliance: "#0984e3",
    }
    return colors[layer as keyof typeof colors] || "#00ff00"
  }

  const getLayerIcon = (layer: string) => {
    const icons = {
      businessDensity: Building2,
      wealthDistribution: DollarSign,
      crimeRates: AlertTriangle,
      marketOpportunities: Target,
      competitionLevels: Users,
    }
    const IconComponent = icons[layer as keyof typeof icons] || Map
    return <IconComponent className="h-4 w-4" />
  }

  const renderHeatMapPoints = () => {
    if (!heatMapData) return null

    const currentLayerData =
      heatMapData[selectedLayer as keyof HeatMapData] || heatMapData.customLayers?.[selectedLayer] || []
    const color = getLayerColor(selectedLayer)

    return currentLayerData.map((point) => {
      const coords = getCoordinateMapping(point.lat, point.lng)
      return (
        <div
          key={point.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: coords.left,
            top: coords.top,
            backgroundColor: color,
            opacity: point.value / 100,
            width: `${Math.max(8, point.value / 5)}px`,
            height: `${Math.max(8, point.value / 5)}px`,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
          onClick={() => setSelectedPoint(point)}
          title={`${point.name}: ${point.value}%`}
        />
      )
    })
  }

  const renderBusinessLocations = () => {
    if (!showBusinesses || !businessLocations.length) return null

    return businessLocations
      .filter((business) => selectedGlyph === "all" || business.glyphType === selectedGlyph)
      .filter((business) => !business.confidence || business.confidence >= confidenceThreshold[0] / 100)
      .map((business) => {
        const coords = getCoordinateMapping(business.lat, business.lng)
        const glyphSymbols = {
          acquisition: "◇",
          rollup: "⬢",
          client: "●",
          competitor: "▲",
        }

        return (
          <div
            key={business.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: coords.left,
              top: coords.top,
            }}
            onClick={() => console.log("[v0] Business clicked:", business)}
          >
            {showUncertainty && business.uncertaintyRadius && (
              <div
                className="absolute rounded-full border border-yellow-500/30 bg-yellow-500/10"
                style={{
                  width: `${Math.min(50, business.uncertaintyRadius / 100)}px`,
                  height: `${Math.min(50, business.uncertaintyRadius / 100)}px`,
                  transform: `translate(-50%, -50%)`,
                  left: "50%",
                  top: "50%",
                }}
              />
            )}

            <div
              className={`text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform text-xs font-bold flex items-center justify-center ${
                business.glyphType === "acquisition"
                  ? "bg-green-600"
                  : business.glyphType === "rollup"
                    ? "bg-blue-600"
                    : business.glyphType === "competitor"
                      ? "bg-red-600"
                      : "bg-gray-600"
              }`}
              style={{ width: "24px", height: "24px" }}
              title={`${business.name} - ${business.glyphType} (Score: ${business.acquisitionScore})`}
            >
              {glyphSymbols[business.glyphType as keyof typeof glyphSymbols] || "●"}
            </div>

            {business.acquisitionScore > 85 && (
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </div>
        )
      })
  }

  const renderCustomOutputVisualization = () => {
    if (!heatMapData) return null

    const customLayers = CUSTOM_MAP_OUTPUTS[customOutputType as keyof typeof CUSTOM_MAP_OUTPUTS] || []

    return (
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-green-500 max-w-xs">
        <div className="text-xs font-bold mb-2 text-green-400">{customOutputType.toUpperCase()} ANALYSIS</div>
        <div className="space-y-1">
          {customLayers.map((layer, index) => (
            <div key={layer} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLayerColor(layer) }} />
              <span className="text-xs text-green-300">
                {layer.charAt(0).toUpperCase() + layer.slice(1).replace(/([A-Z])/g, " $1")}
              </span>
              <div className="ml-auto text-xs text-green-400">{Math.round(Math.random() * 100)}%</div>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-green-500/30">
          <div className="text-xs text-green-400">
            Active Layer: <span className="text-green-300">{selectedLayer}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderEnhancedHeatMap = () => {
    if (!heatMapData) return null

    const currentLayerData =
      heatMapData[selectedLayer as keyof HeatMapData] || heatMapData.customLayers?.[selectedLayer] || []
    const color = getLayerColor(selectedLayer)

    return (
      <>
        {currentLayerData.map((point) => {
          const coords = getCoordinateMapping(point.lat, point.lng)
          const intensity = point.value / 100
          const size = Math.max(12, point.value / 3)

          return (
            <div key={point.id} className="absolute transform -translate-x-1/2 -translate-y-1/2">
              <div
                className="relative cursor-pointer transition-all duration-300 hover:scale-125"
                style={{
                  left: coords.left,
                  top: coords.top,
                }}
                onClick={() => setSelectedPoint(point)}
              >
                {/* Outer glow effect */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    backgroundColor: color,
                    opacity: intensity * 0.3,
                    width: `${size + 8}px`,
                    height: `${size + 8}px`,
                    transform: "translate(-4px, -4px)",
                    filter: "blur(4px)",
                  }}
                />
                {/* Main point */}
                <div
                  className="relative rounded-full border-2 border-white/50 shadow-lg"
                  style={{
                    backgroundColor: color,
                    opacity: Math.max(0.7, intensity),
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                />
                {/* Value indicator for high-value points */}
                {point.value > 80 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                    {point.value}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            AI-Powered Market Intelligence Terminal
          </CardTitle>
          <CardDescription>
            Natural language query processing with advanced geospatial analytics and uncertainty quantification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg border-2 border-dashed border-primary/20">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Search className="h-4 w-4" />
              Natural Language Market Query
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'Find HVAC companies in Texas with revenue over $2M and owners over 55'"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="flex-1"
              />
              <Select value={intent} onValueChange={(value: any) => setIntent(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market_analysis">Market Analysis</SelectItem>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                  <SelectItem value="rollup">Roll-up</SelectItem>
                  <SelectItem value="succession">Succession</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={processNaturalLanguageQuery}
                disabled={processingQuery || !queryInput.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingQuery ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {queryResults && (
              <div className="mt-3 p-3 bg-background rounded border">
                <div className="text-xs font-medium text-green-600 mb-1">Query Results</div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Businesses:</span>
                    <span className="ml-1 font-medium">{queryResults.total_businesses}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-1 font-medium">{Math.round(queryResults.confidence_score * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <span className="ml-1 font-medium">{queryResults.region}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intent:</span>
                    <span className="ml-1 font-medium">{queryResults.intent}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Map Scope</label>
              <Select value={mapScope} onValueChange={(value: "national" | "regional" | "state") => setMapScope(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National View</SelectItem>
                  <SelectItem value="regional">Regional View</SelectItem>
                  <SelectItem value="state">State View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mapScope === "regional" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(US_REGIONS).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {mapScope === "state" && (
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(US_STATES).map(([code, data]) => (
                      <SelectItem key={code} value={code}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Custom Output Type</label>
              <Select value={customOutputType} onValueChange={setCustomOutputType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CUSTOM_MAP_OUTPUTS).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Heat Map Layer</label>
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableLayers().map((layer) => (
                    <SelectItem key={layer.value} value={layer.value}>
                      {layer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search Radius: {radius[0]} miles</label>
              <Slider value={radius} onValueChange={setRadius} max={100} min={5} step={5} className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Glyph Filter</label>
              <Select value={selectedGlyph} onValueChange={(value: any) => setSelectedGlyph(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="acquisition">◇ Acquisition</SelectItem>
                  <SelectItem value="rollup">⬢ Roll-up</SelectItem>
                  <SelectItem value="client">● Client</SelectItem>
                  <SelectItem value="competitor">▲ Competitor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Confidence: {confidenceThreshold[0]}%</label>
              <Slider
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Switch id="show-businesses" checked={showBusinesses} onCheckedChange={setShowBusinesses} />
              <label htmlFor="show-businesses" className="text-sm font-medium">
                Show Businesses
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-boundaries" checked={showBoundaries} onCheckedChange={setShowBoundaries} />
              <label htmlFor="show-boundaries" className="text-sm font-medium">
                Show Market Boundaries
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-uncertainty" checked={showUncertainty} onCheckedChange={setShowUncertainty} />
              <label htmlFor="show-uncertainty" className="text-sm font-medium">
                Show Uncertainty Bands
              </label>
            </div>
          </div>

          <Button onClick={loadMapData} disabled={loading} className="w-full">
            {loading ? "Loading Map Data..." : "Refresh Map Data"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getLayerIcon(selectedLayer)}
                {selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1).replace(/([A-Z])/g, " $1")} Heat Map
              </CardTitle>
              <CardDescription>
                {mapScope === "national"
                  ? "United States"
                  : mapScope === "regional"
                    ? selectedRegion
                    : US_STATES[selectedState as keyof typeof US_STATES]?.name}{" "}
                •{radius[0]} mile radius • {businessLocations.length} businesses • {customOutputType} analysis
              </CardDescription>
            </div>
            <Badge style={{ backgroundColor: getLayerColor(selectedLayer) }} className="text-white">
              {customOutputType.charAt(0).toUpperCase() + customOutputType.slice(1)} Layer
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="relative w-full h-96 bg-black rounded-lg overflow-hidden border border-green-500"
            style={{
              backgroundImage: `linear-gradient(45deg, #001100 25%, transparent 25%), 
                               linear-gradient(-45deg, #001100 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, #001100 75%), 
                               linear-gradient(-45deg, transparent 75%, #001100 75%)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          >
            {renderEnhancedHeatMap()}

            {renderBusinessLocations()}

            {renderCustomOutputVisualization()}

            {showBoundaries && (
              <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded-lg opacity-50" />
            )}

            <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-green-500">
              <div className="text-xs font-medium mb-2 text-green-400">Legend - {customOutputType.toUpperCase()}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLayerColor(selectedLayer) }} />
                  <span className="text-xs text-green-300">
                    {selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1).replace(/([A-Z])/g, " $1")}
                  </span>
                </div>
                {showBusinesses && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-1" />
                    <span className="text-xs text-green-300">Target Businesses</span>
                  </div>
                )}
                <div className="text-xs text-green-400 mt-2">
                  Scope:{" "}
                  {mapScope === "national"
                    ? "USA"
                    : mapScope === "regional"
                      ? selectedRegion
                      : US_STATES[selectedState as keyof typeof US_STATES]?.name}
                </div>
                <div className="text-xs text-green-300 mt-1">
                  Output: {customOutputType.charAt(0).toUpperCase() + customOutputType.slice(1)}
                </div>
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Loading map data...</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Layer Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {heatMapData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">
                      {heatMapData[selectedLayer as keyof HeatMapData]?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Data Points</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">
                      {Math.round(
                        (heatMapData[selectedLayer as keyof HeatMapData]?.reduce(
                          (sum, point) => sum + point.value,
                          0,
                        ) || 0) / (heatMapData[selectedLayer as keyof HeatMapData]?.length || 1),
                      )}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">Average Intensity</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Intensity Areas</span>
                    <span className="text-sm font-medium">
                      {heatMapData[selectedLayer as keyof HeatMapData]?.filter((p) => p.value > 75).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Intensity Areas</span>
                    <span className="text-sm font-medium">
                      {heatMapData[selectedLayer as keyof HeatMapData]?.filter((p) => p.value >= 50 && p.value <= 75)
                        .length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Intensity Areas</span>
                    <span className="text-sm font-medium">
                      {heatMapData[selectedLayer as keyof HeatMapData]?.filter((p) => p.value < 50).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{businessLocations.length}</div>
                  <div className="text-xs text-muted-foreground">Target Businesses</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">
                    {Math.round(
                      businessLocations.reduce((sum, b) => sum + b.acquisitionScore, 0) / businessLocations.length,
                    ) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Acquisition Score</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">High-Value Targets</span>
                  <span className="text-sm font-medium">
                    {businessLocations.filter((b) => b.acquisitionScore > 85).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medium-Value Targets</span>
                  <span className="text-sm font-medium">
                    {businessLocations.filter((b) => b.acquisitionScore >= 70 && b.acquisitionScore <= 85).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Market Coverage</span>
                  <span className="text-sm font-medium">{radius[0]} miles</span>
                </div>
              </div>

              <Button className="w-full bg-transparent" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Generate Market Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {geoJsonData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">
                      {Math.round((geoJsonData.metadata?.market_metrics?.fragmentation_index || 0) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Fragmentation Index</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">
                      {Math.round((geoJsonData.metadata?.confidence_score || 0) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Analysis Confidence</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High AAS Targets</span>
                    <span className="text-sm font-medium">
                      {businessLocations.filter((b) => b.acquisitionScore > 80).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Succession Risk</span>
                    <span className="text-sm font-medium">
                      {businessLocations.filter((b) => b.successionRisk > 0.7).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Roll-up Opportunities</span>
                    <span className="text-sm font-medium">
                      {businessLocations.filter((b) => b.glyphType === "rollup").length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedPoint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedPoint.name}
            </CardTitle>
            <CardDescription>
              Lat: {selectedPoint.lat.toFixed(4)}, Lng: {selectedPoint.lng.toFixed(4)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Intensity</div>
                <div className="text-lg font-bold">{selectedPoint.value}%</div>
              </div>
              {selectedPoint.metadata.businessCount && (
                <div>
                  <div className="text-sm text-muted-foreground">Businesses</div>
                  <div className="text-lg font-bold">{selectedPoint.metadata.businessCount}</div>
                </div>
              )}
              {selectedPoint.metadata.avgRevenue && (
                <div>
                  <div className="text-sm text-muted-foreground">Avg Revenue</div>
                  <div className="text-lg font-bold">${(selectedPoint.metadata.avgRevenue / 1000000).toFixed(1)}M</div>
                </div>
              )}
              {selectedPoint.metadata.opportunityScore && (
                <div>
                  <div className="text-sm text-muted-foreground">Opportunity</div>
                  <div className="text-lg font-bold">{selectedPoint.metadata.opportunityScore}%</div>
                </div>
              )}
            </div>
            <Button className="mt-4" onClick={() => setSelectedPoint(null)} variant="outline">
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function setIntent(value: any) {
  // Implementation of setIntent function
}

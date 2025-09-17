import { type NextRequest, NextResponse } from "next/server"

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

const US_REGIONS = {
  Northeast: { lat: 42.5, lng: -73.5, states: ["NY", "NJ", "PA", "CT", "MA", "RI", "VT", "NH", "ME"] },
  Southeast: {
    lat: 32.0,
    lng: -82.0,
    states: ["FL", "GA", "SC", "NC", "VA", "WV", "KY", "TN", "AL", "MS", "AR", "LA"],
  },
  Midwest: { lat: 42.0, lng: -93.0, states: ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"] },
  Southwest: { lat: 31.5, lng: -104.0, states: ["TX", "OK", "NM", "AZ"] },
  West: { lat: 45.0, lng: -120.0, states: ["CA", "NV", "UT", "CO", "WY", "MT", "ID", "WA", "OR", "AK", "HI"] },
}

const CUSTOM_OUTPUT_GENERATORS = {
  coastal: (center: any, radius: number) => ({
    tourismImpact: generateCustomDataPoints(center, radius, "tourism", 40, { seasonalMultiplier: 1.5 }),
    hurricaneRisk: generateCustomDataPoints(center, radius, "hurricane", 25, { riskFactor: 0.8 }),
    portActivity: generateCustomDataPoints(center, radius, "port", 15, { economicImpact: 2.0 }),
  }),
  mountain: (center: any, radius: number) => ({
    seasonalVariation: generateCustomDataPoints(center, radius, "seasonal", 35, { variability: 1.8 }),
    outdoorRecreation: generateCustomDataPoints(center, radius, "recreation", 30, { activityLevel: 1.4 }),
    miningActivity: generateCustomDataPoints(center, radius, "mining", 20, { resourceDensity: 1.2 }),
  }),
  urban: (center: any, radius: number) => ({
    publicTransit: generateCustomDataPoints(center, radius, "transit", 50, { connectivity: 1.6 }),
    gentrification: generateCustomDataPoints(center, radius, "gentrification", 40, { changeRate: 1.3 }),
    crimeRates: generateCustomDataPoints(center, radius, "crime", 60, { urbanFactor: 1.1 }),
  }),
  rural: (center: any, radius: number) => ({
    agriculturalImpact: generateCustomDataPoints(center, radius, "agriculture", 45, { farmDensity: 1.7 }),
    populationDensity: generateCustomDataPoints(center, radius, "population", 30, { sparsity: 0.6 }),
    internetConnectivity: generateCustomDataPoints(center, radius, "internet", 25, { ruralPenalty: 0.7 }),
  }),
  industrial: (center: any, radius: number) => ({
    manufacturingBase: generateCustomDataPoints(center, radius, "manufacturing", 40, { industrialStrength: 1.5 }),
    logisticsHubs: generateCustomDataPoints(center, radius, "logistics", 30, { transportAccess: 1.4 }),
    environmentalFactors: generateCustomDataPoints(center, radius, "environmental", 35, { complianceLevel: 1.2 }),
  }),
  tech: (center: any, radius: number) => ({
    innovationIndex: generateCustomDataPoints(center, radius, "innovation", 45, { techDensity: 1.8 }),
    talentPool: generateCustomDataPoints(center, radius, "talent", 50, { skillLevel: 1.6 }),
    ventureCapital: generateCustomDataPoints(center, radius, "vc", 25, { fundingAvailability: 2.0 }),
  }),
  energy: (center: any, radius: number) => ({
    oilGasActivity: generateCustomDataPoints(center, radius, "oilgas", 35, { extractionLevel: 1.4 }),
    renewableEnergy: generateCustomDataPoints(center, radius, "renewable", 40, { greenFactor: 1.3 }),
    energyPrices: generateCustomDataPoints(center, radius, "energy", 30, { costVariability: 1.2 }),
  }),
  agriculture: (center: any, radius: number) => ({
    cropYields: generateCustomDataPoints(center, radius, "crops", 50, { productivity: 1.5 }),
    farmlandValues: generateCustomDataPoints(center, radius, "farmland", 40, { landValue: 1.4 }),
    weatherPatterns: generateCustomDataPoints(center, radius, "weather", 35, { climateStability: 1.1 }),
  }),
  tourism: (center: any, radius: number) => ({
    seasonalTraffic: generateCustomDataPoints(center, radius, "traffic", 45, { peakSeason: 2.0 }),
    hotelOccupancy: generateCustomDataPoints(center, radius, "hotels", 35, { occupancyRate: 1.3 }),
    attractionDensity: generateCustomDataPoints(center, radius, "attractions", 40, { touristAppeal: 1.6 }),
  }),
  finance: (center: any, radius: number) => ({
    bankingPresence: generateCustomDataPoints(center, radius, "banking", 30, { financialStrength: 1.4 }),
    wealthConcentration: generateCustomDataPoints(center, radius, "wealth", 35, { affluenceLevel: 1.7 }),
    investmentActivity: generateCustomDataPoints(center, radius, "investment", 25, { capitalFlow: 1.5 }),
  }),
}

interface MapDataRequest {
  location?: string
  industry?: string
  radius?: number
  dataLayers?: string[]
  mapScope?: "national" | "regional" | "state"
  selectedRegion?: string
  selectedState?: string
  customOutputType?: string
  buyBoxCriteria?: {
    minRevenue?: number
    maxRevenue?: number
    minEmployees?: number
    maxEmployees?: number
  }
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

export async function POST(request: NextRequest) {
  try {
    const body: MapDataRequest = await request.json()
    console.log("[v0] Map data request:", body)

    // Generate heat map data based on location and criteria
    const heatMapData = await generateHeatMapData(body)

    // Get business locations
    const businessLocations = await getBusinessLocations(body)

    // Calculate market boundaries
    const marketBoundaries = await calculateMarketBoundaries(body)

    console.log("[v0] Map data generated successfully")

    return NextResponse.json({
      success: true,
      heatMapData,
      businessLocations,
      marketBoundaries,
      center: getLocationCenter(body),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Map data error:", error)
    return NextResponse.json({ error: "Map data generation failed", details: String(error) }, { status: 500 })
  }
}

async function generateHeatMapData(request: MapDataRequest): Promise<HeatMapData> {
  const center = getLocationCenter(request)
  const radius = request.radius || 25

  const businessDensity = generateDataPoints(center, radius, "business", 50)
  const wealthDistribution = generateDataPoints(center, radius, "wealth", 40)
  const crimeRates = generateDataPoints(center, radius, "crime", 30)
  const marketOpportunities = generateDataPoints(center, radius, "opportunity", 35)
  const competitionLevels = generateDataPoints(center, radius, "competition", 45)

  const customLayers: Record<string, MapDataPoint[]> = {}
  if (
    request.customOutputType &&
    CUSTOM_OUTPUT_GENERATORS[request.customOutputType as keyof typeof CUSTOM_OUTPUT_GENERATORS]
  ) {
    const generator = CUSTOM_OUTPUT_GENERATORS[request.customOutputType as keyof typeof CUSTOM_OUTPUT_GENERATORS]
    const customData = generator(center, radius)
    Object.assign(customLayers, customData)
  }

  return {
    businessDensity,
    wealthDistribution,
    crimeRates,
    marketOpportunities,
    competitionLevels,
    customLayers,
  }
}

function generateCustomDataPoints(
  center: { lat: number; lng: number },
  radius: number,
  type: string,
  count: number,
  modifiers: Record<string, number> = {},
): MapDataPoint[] {
  const points: MapDataPoint[] = []
  const baseMultiplier = modifiers.baseMultiplier || 1.0

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * radius * 0.01

    const lat = center.lat + distance * Math.cos(angle)
    const lng = center.lng + distance * Math.sin(angle)

    const baseValue = Math.round(10 + Math.random() * 90)
    const value = Math.min(100, Math.round(baseValue * baseMultiplier))

    const customMetrics: Record<string, number> = {}
    Object.keys(modifiers).forEach((key) => {
      if (key !== "baseMultiplier") {
        customMetrics[key] = Math.round(modifiers[key] * 50 + Math.random() * 50)
      }
    })

    points.push({
      id: `${type}-${i}`,
      lat,
      lng,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Point ${i + 1}`,
      value,
      type,
      metadata: {
        customMetrics,
        opportunityScore: Math.round(30 + Math.random() * 70),
      },
    })
  }

  return points
}

function generateDataPoints(
  center: { lat: number; lng: number },
  radius: number,
  type: string,
  count: number,
): MapDataPoint[] {
  const points: MapDataPoint[] = []

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * radius * 0.01

    const lat = center.lat + distance * Math.cos(angle)
    const lng = center.lng + distance * Math.sin(angle)

    let value: number
    let metadata: any = {}

    switch (type) {
      case "business":
        value = Math.round(10 + Math.random() * 90)
        metadata = {
          businessCount: Math.round(5 + Math.random() * 50),
          avgRevenue: Math.round(500000 + Math.random() * 2000000),
        }
        break
      case "wealth":
        value = Math.round(30 + Math.random() * 70)
        metadata = {
          wealthIndex: Math.round(40 + Math.random() * 60),
        }
        break
      case "crime":
        value = Math.round(10 + Math.random() * 80)
        metadata = {
          crimeRate: Math.round(5 + Math.random() * 45),
        }
        break
      case "opportunity":
        value = Math.round(20 + Math.random() * 80)
        metadata = {
          opportunityScore: Math.round(30 + Math.random() * 70),
          competitionLevel: Math.round(20 + Math.random() * 60),
        }
        break
      case "competition":
        value = Math.round(15 + Math.random() * 85)
        metadata = {
          competitionLevel: Math.round(25 + Math.random() * 75),
        }
        break
      default:
        value = Math.round(Math.random() * 100)
    }

    points.push({
      id: `${type}-${i}`,
      lat,
      lng,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Point ${i + 1}`,
      value,
      type,
      metadata,
    })
  }

  return points
}

async function getBusinessLocations(request: MapDataRequest) {
  const center = getLocationCenter(request)
  const businesses = []

  const businessNames = [
    "Elite Security Solutions",
    "Metro Guard Services",
    "Lone Star Protection",
    "Texas Security Systems",
    "Guardian Protection Co",
    "Secure Shield Services",
    "Apex Security Group",
    "Premier Guard Solutions",
  ]

  const businessCount = request.mapScope === "national" ? 50 : request.mapScope === "regional" ? 30 : 15

  for (let i = 0; i < businessCount; i++) {
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * 0.2

    businesses.push({
      id: `business-${i}`,
      name: businessNames[Math.floor(Math.random() * businessNames.length)],
      lat: center.lat + distance * Math.cos(angle),
      lng: center.lng + distance * Math.sin(angle),
      revenue: Math.round(500000 + Math.random() * 3000000),
      employees: Math.round(10 + Math.random() * 100),
      acquisitionScore: Math.round(60 + Math.random() * 40),
      successionRisk: Math.round(40 + Math.random() * 60),
    })
  }

  return businesses
}

async function calculateMarketBoundaries(request: MapDataRequest) {
  const center = getLocationCenter(request)
  const radius = (request.radius || 25) * 0.01

  const boundaries = []
  const points = 20

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI
    boundaries.push({
      lat: center.lat + radius * Math.cos(angle),
      lng: center.lng + radius * Math.sin(angle),
    })
  }

  return boundaries
}

function getLocationCenter(request: MapDataRequest): { lat: number; lng: number } {
  if (request.mapScope === "national") {
    return { lat: 39.8283, lng: -98.5795 }
  }

  if (request.mapScope === "regional" && request.selectedRegion) {
    const region = US_REGIONS[request.selectedRegion as keyof typeof US_REGIONS]
    if (region) {
      return { lat: region.lat, lng: region.lng }
    }
  }

  if (request.mapScope === "state" && request.selectedState) {
    const state = US_STATES[request.selectedState as keyof typeof US_STATES]
    if (state) {
      return { lat: state.lat, lng: state.lng }
    }
  }

  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    houston: { lat: 29.7604, lng: -95.3698 },
    dallas: { lat: 32.7767, lng: -96.797 },
    austin: { lat: 30.2672, lng: -97.7431 },
    "san antonio": { lat: 29.4241, lng: -98.4936 },
    "fort worth": { lat: 32.7555, lng: -97.3308 },
    "el paso": { lat: 31.7619, lng: -106.485 },
  }

  const city = request.location?.toLowerCase() || "houston"
  return cityCoordinates[city] || cityCoordinates.houston
}

import { type NextRequest, NextResponse } from "next/server"

interface DataSource {
  id: string
  name: string
  type: "api" | "webhook" | "stream" | "database"
  endpoint?: string
  credentials?: any
  refresh_interval_ms: number
  last_updated: string
  status: "active" | "inactive" | "error"
  error_message?: string
}

interface RealTimeUpdate {
  source_id: string
  timestamp: string
  data_type: "business" | "market" | "metric" | "event"
  operation: "create" | "update" | "delete"
  payload: any
  confidence: number
  freshness_score: number
}

interface DataFreshnessMetrics {
  source_id: string
  last_update: string
  staleness_minutes: number
  update_frequency_minutes: number
  reliability_score: number
  data_quality_score: number
}

const DATA_SOURCES: DataSource[] = [
  {
    id: "yelp_api",
    name: "Yelp Business API",
    type: "api",
    endpoint: "https://api.yelp.com/v3/businesses/search",
    refresh_interval_ms: 3600000, // 1 hour
    last_updated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "google_places",
    name: "Google Places API",
    type: "api",
    endpoint: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    refresh_interval_ms: 1800000, // 30 minutes
    last_updated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "census_api",
    name: "US Census Bureau API",
    type: "api",
    endpoint: "https://api.census.gov/data",
    refresh_interval_ms: 86400000, // 24 hours
    last_updated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "serp_api",
    name: "SERP API",
    type: "api",
    refresh_interval_ms: 7200000, // 2 hours
    last_updated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "data_axle",
    name: "Data Axle Business Database",
    type: "database",
    refresh_interval_ms: 43200000, // 12 hours
    last_updated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "apify_scrapers",
    name: "Apify Web Scrapers",
    type: "stream",
    refresh_interval_ms: 1800000, // 30 minutes
    last_updated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "arcgis_demographics",
    name: "ArcGIS Demographics",
    type: "api",
    refresh_interval_ms: 86400000, // 24 hours
    last_updated: new Date().toISOString(),
    status: "active",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const sourceId = searchParams.get("source_id")

    switch (action) {
      case "status":
        return NextResponse.json({
          success: true,
          data_sources: DATA_SOURCES,
          overall_health: calculateOverallHealth(),
          last_refresh: new Date().toISOString(),
        })

      case "freshness":
        const freshnessMetrics = await calculateDataFreshness(sourceId)
        return NextResponse.json({
          success: true,
          freshness_metrics: freshnessMetrics,
        })

      case "stream":
        return handleRealTimeStream(request)

      default:
        return NextResponse.json({
          success: true,
          available_actions: ["status", "freshness", "stream", "refresh"],
          data_sources_count: DATA_SOURCES.length,
        })
    }
  } catch (error) {
    console.error("[v0] Real-time data GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to get real-time data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, source_ids, filters, real_time = true } = body

    console.log("[v0] Real-time data integration request:", { action, source_ids, real_time })

    switch (action) {
      case "refresh":
        const refreshResults = await refreshDataSources(source_ids || DATA_SOURCES.map((s) => s.id))
        return NextResponse.json({
          success: true,
          refresh_results: refreshResults,
          timestamp: new Date().toISOString(),
        })

      case "subscribe":
        const subscriptionId = await createRealTimeSubscription(source_ids, filters)
        return NextResponse.json({
          success: true,
          subscription_id: subscriptionId,
          websocket_url: `ws://localhost:3000/api/real-time-data/ws/${subscriptionId}`,
        })

      case "fetch":
        const liveData = await fetchLiveData(source_ids, filters, real_time)
        return NextResponse.json({
          success: true,
          data: liveData,
          freshness_score: calculateFreshnessScore(liveData),
          timestamp: new Date().toISOString(),
        })

      case "validate":
        const validationResults = await validateDataSources(source_ids)
        return NextResponse.json({
          success: true,
          validation_results: validationResults,
        })

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action",
          available_actions: ["refresh", "subscribe", "fetch", "validate"],
        })
    }
  } catch (error) {
    console.error("[v0] Real-time data POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process real-time data request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function refreshDataSources(sourceIds: string[]) {
  const results = await Promise.allSettled(
    sourceIds.map(async (sourceId) => {
      const source = DATA_SOURCES.find((s) => s.id === sourceId)
      if (!source) {
        throw new Error(`Data source not found: ${sourceId}`)
      }

      console.log(`[v0] Refreshing data source: ${source.name}`)

      try {
        const freshData = await fetchFromDataSource(source)

        // Update source status
        source.last_updated = new Date().toISOString()
        source.status = "active"
        source.error_message = undefined

        return {
          source_id: sourceId,
          status: "success",
          records_updated: freshData.length,
          last_updated: source.last_updated,
          data_sample: freshData.slice(0, 3), // First 3 records for verification
        }
      } catch (error) {
        source.status = "error"
        source.error_message = error instanceof Error ? error.message : "Unknown error"

        return {
          source_id: sourceId,
          status: "error",
          error: source.error_message,
          last_successful_update: source.last_updated,
        }
      }
    }),
  )

  return results.map((result, index) => ({
    source_id: sourceIds[index],
    ...(result.status === "fulfilled" ? result.value : { status: "error", error: result.reason }),
  }))
}

async function fetchFromDataSource(source: DataSource) {
  const mockDataGenerators = {
    yelp_api: () => generateMockYelpData(50),
    google_places: () => generateMockGooglePlacesData(40),
    census_api: () => generateMockCensusData(30),
    serp_api: () => generateMockSerpData(60),
    data_axle: () => generateMockDataAxleData(80),
    apify_scrapers: () => generateMockApifyData(35),
    arcgis_demographics: () => generateMockArcGISData(25),
  }

  const generator = mockDataGenerators[source.id as keyof typeof mockDataGenerators]
  if (!generator) {
    throw new Error(`No data generator for source: ${source.id}`)
  }

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

  return generator()
}

async function fetchLiveData(sourceIds: string[], filters: any, realTime: boolean) {
  const targetSources = sourceIds || DATA_SOURCES.map((s) => s.id)

  const dataResults = await Promise.allSettled(
    targetSources.map(async (sourceId) => {
      const source = DATA_SOURCES.find((s) => s.id === sourceId)
      if (!source) return null

      // Check if data is fresh enough for real-time requirements
      const staleness = Date.now() - new Date(source.last_updated).getTime()
      const isStale = staleness > source.refresh_interval_ms

      if (realTime && isStale) {
        console.log(`[v0] Refreshing stale data for ${sourceId}`)
        const freshData = await fetchFromDataSource(source)
        source.last_updated = new Date().toISOString()
        return {
          source_id: sourceId,
          data: freshData,
          freshness: "live",
          staleness_ms: 0,
        }
      }

      // Return cached data with staleness info
      const cachedData = await getCachedData(sourceId)
      return {
        source_id: sourceId,
        data: cachedData,
        freshness: isStale ? "stale" : "fresh",
        staleness_ms: staleness,
      }
    }),
  )

  const successfulResults = dataResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => (result as PromiseFulfilledResult<any>).value)

  // Apply filters if provided
  const filteredData = filters ? applyFiltersToLiveData(successfulResults, filters) : successfulResults

  // Merge and deduplicate data from multiple sources
  const mergedData = mergeMultiSourceData(filteredData)

  return {
    sources: successfulResults.map((r) => ({
      source_id: r.source_id,
      record_count: r.data.length,
      freshness: r.freshness,
      staleness_ms: r.staleness_ms,
    })),
    businesses: mergedData,
    total_records: mergedData.length,
    data_quality_score: calculateDataQualityScore(mergedData),
  }
}

async function getCachedData(sourceId: string) {
  // In a real implementation, this would fetch from a cache/database
  // For now, generate mock cached data
  const mockDataGenerators = {
    yelp_api: () => generateMockYelpData(30),
    google_places: () => generateMockGooglePlacesData(25),
    census_api: () => generateMockCensusData(20),
    serp_api: () => generateMockSerpData(35),
    data_axle: () => generateMockDataAxleData(45),
    apify_scrapers: () => generateMockApifyData(20),
    arcgis_demographics: () => generateMockArcGISData(15),
  }

  const generator = mockDataGenerators[sourceId as keyof typeof mockDataGenerators]
  return generator ? generator() : []
}

function mergeMultiSourceData(sourceResults: any[]) {
  const businessMap = new Map()

  sourceResults.forEach((result) => {
    result.data.forEach((business: any) => {
      const key = `${business.name}_${business.latitude}_${business.longitude}`

      if (businessMap.has(key)) {
        // Merge data from multiple sources
        const existing = businessMap.get(key)
        businessMap.set(key, {
          ...existing,
          ...business,
          sources: [...(existing.sources || []), result.source_id],
          confidence: Math.max(existing.confidence || 0, business.confidence || 0),
          last_updated: new Date().toISOString(),
        })
      } else {
        businessMap.set(key, {
          ...business,
          sources: [result.source_id],
          confidence: business.confidence || 0.7,
          last_updated: new Date().toISOString(),
        })
      }
    })
  })

  return Array.from(businessMap.values())
}

function applyFiltersToLiveData(sourceResults: any[], filters: any) {
  if (!filters || Object.keys(filters).length === 0) return sourceResults

  return sourceResults.map((result) => ({
    ...result,
    data: result.data.filter((business: any) => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === "revenue_min") return business.revenue_estimate >= value
        if (key === "revenue_max") return business.revenue_estimate <= value
        if (key === "employee_min") return business.employee_count >= value
        if (key === "employee_max") return business.employee_count <= value
        if (key === "industry") return business.industry_code === value
        if (key === "region") return business.region === value
        return true
      })
    }),
  }))
}

async function calculateDataFreshness(sourceId?: string) {
  const targetSources = sourceId ? [DATA_SOURCES.find((s) => s.id === sourceId)].filter(Boolean) : DATA_SOURCES

  return targetSources.map((source) => {
    const lastUpdate = new Date(source.last_updated)
    const now = new Date()
    const stalenessMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
    const expectedIntervalMinutes = source.refresh_interval_ms / (1000 * 60)

    const reliabilityScore = Math.max(0, 1 - stalenessMinutes / (expectedIntervalMinutes * 2))
    const dataQualityScore = source.status === "active" ? 0.9 : source.status === "error" ? 0.1 : 0.5

    return {
      source_id: source.id,
      last_update: source.last_updated,
      staleness_minutes: Math.round(stalenessMinutes),
      update_frequency_minutes: Math.round(expectedIntervalMinutes),
      reliability_score: Math.round(reliabilityScore * 100) / 100,
      data_quality_score: dataQualityScore,
      status: source.status,
      error_message: source.error_message,
    }
  })
}

function calculateOverallHealth() {
  const activeCount = DATA_SOURCES.filter((s) => s.status === "active").length
  const totalCount = DATA_SOURCES.length
  const healthPercentage = (activeCount / totalCount) * 100

  return {
    overall_score: Math.round(healthPercentage),
    active_sources: activeCount,
    total_sources: totalCount,
    status: healthPercentage >= 80 ? "healthy" : healthPercentage >= 60 ? "degraded" : "critical",
    last_check: new Date().toISOString(),
  }
}

function calculateFreshnessScore(liveData: any) {
  if (!liveData.sources || liveData.sources.length === 0) return 0

  const freshnessScores = liveData.sources.map((source: any) => {
    if (source.freshness === "live") return 1.0
    if (source.freshness === "fresh") return 0.8

    // Calculate score based on staleness
    const maxStaleness = 3600000 // 1 hour in ms
    const stalenessRatio = Math.min(source.staleness_ms / maxStaleness, 1)
    return Math.max(0.1, 1 - stalenessRatio)
  })

  const averageFreshness = freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length
  return Math.round(averageFreshness * 100) / 100
}

function calculateDataQualityScore(businesses: any[]) {
  if (businesses.length === 0) return 0

  const qualityMetrics = businesses.map((business) => {
    let score = 0
    let maxScore = 0

    // Check for required fields
    const requiredFields = ["name", "latitude", "longitude", "revenue_estimate", "employee_count"]
    requiredFields.forEach((field) => {
      maxScore += 1
      if (business[field] !== null && business[field] !== undefined) score += 1
    })

    // Check for data source diversity
    maxScore += 1
    if (business.sources && business.sources.length > 1) score += 1

    // Check for confidence score
    maxScore += 1
    if (business.confidence && business.confidence > 0.7) score += 1

    return score / maxScore
  })

  const averageQuality = qualityMetrics.reduce((sum, score) => sum + score, 0) / qualityMetrics.length
  return Math.round(averageQuality * 100) / 100
}

async function createRealTimeSubscription(sourceIds: string[], filters: any) {
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // In a real implementation, this would set up WebSocket connections or webhooks
  console.log(`[v0] Created real-time subscription: ${subscriptionId}`)

  return subscriptionId
}

async function validateDataSources(sourceIds: string[]) {
  const targetSources = sourceIds || DATA_SOURCES.map((s) => s.id)

  const validationResults = await Promise.allSettled(
    targetSources.map(async (sourceId) => {
      const source = DATA_SOURCES.find((s) => s.id === sourceId)
      if (!source) {
        return { source_id: sourceId, valid: false, error: "Source not found" }
      }

      try {
        // Simulate validation check
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200))

        const isValid = Math.random() > 0.1 // 90% success rate

        return {
          source_id: sourceId,
          valid: isValid,
          response_time_ms: Math.round(Math.random() * 500 + 200),
          last_validated: new Date().toISOString(),
          error: isValid ? null : "Connection timeout",
        }
      } catch (error) {
        return {
          source_id: sourceId,
          valid: false,
          error: error instanceof Error ? error.message : "Validation failed",
        }
      }
    }),
  )

  return validationResults.map((result, index) => ({
    source_id: targetSources[index],
    ...(result.status === "fulfilled" ? result.value : { valid: false, error: result.reason }),
  }))
}

async function handleRealTimeStream(request: NextRequest) {
  // This would typically upgrade to WebSocket connection
  // For now, return Server-Sent Events setup instructions

  return new Response(
    `data: {"type":"connection","message":"Real-time stream ready","timestamp":"${new Date().toISOString()}"}\n\n`,
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    },
  )
}

// Mock data generators
function generateMockYelpData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `yelp_${i}`,
    name: `Yelp Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 5000000) + 500000,
    employee_count: Math.floor(Math.random() * 30) + 5,
    industry_code: "238220",
    rating: 3.5 + Math.random() * 1.5,
    review_count: Math.floor(Math.random() * 200) + 10,
    confidence: 0.8 + Math.random() * 0.2,
    source: "yelp_api",
  }))
}

function generateMockGooglePlacesData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `google_${i}`,
    name: `Google Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 8000000) + 300000,
    employee_count: Math.floor(Math.random() * 50) + 3,
    industry_code: "238110",
    place_id: `ChIJ${Math.random().toString(36).substr(2, 20)}`,
    confidence: 0.75 + Math.random() * 0.25,
    source: "google_places",
  }))
}

function generateMockCensusData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `census_${i}`,
    name: `Census Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 12000000) + 1000000,
    employee_count: Math.floor(Math.random() * 100) + 10,
    industry_code: "238210",
    establishment_year: 2000 + Math.floor(Math.random() * 24),
    confidence: 0.9 + Math.random() * 0.1,
    source: "census_api",
  }))
}

function generateMockSerpData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `serp_${i}`,
    name: `SERP Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 6000000) + 400000,
    employee_count: Math.floor(Math.random() * 40) + 5,
    industry_code: "541330",
    website: `https://business${i + 1}.com`,
    confidence: 0.7 + Math.random() * 0.3,
    source: "serp_api",
  }))
}

function generateMockDataAxleData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `dataaxle_${i}`,
    name: `DataAxle Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 15000000) + 800000,
    employee_count: Math.floor(Math.random() * 80) + 8,
    industry_code: "238220",
    owner_age: Math.floor(Math.random() * 30) + 40,
    years_in_business: Math.floor(Math.random() * 20) + 5,
    confidence: 0.85 + Math.random() * 0.15,
    source: "data_axle",
  }))
}

function generateMockApifyData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `apify_${i}`,
    name: `Apify Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 4000000) + 200000,
    employee_count: Math.floor(Math.random() * 25) + 3,
    industry_code: "238110",
    social_media_presence: Math.random() > 0.5,
    website_quality_score: Math.floor(Math.random() * 40) + 60,
    confidence: 0.6 + Math.random() * 0.4,
    source: "apify_scrapers",
  }))
}

function generateMockArcGISData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `arcgis_${i}`,
    name: `ArcGIS Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 10000000) + 600000,
    employee_count: Math.floor(Math.random() * 60) + 6,
    industry_code: "238210",
    demographic_score: Math.floor(Math.random() * 30) + 70,
    market_density: Math.random(),
    confidence: 0.8 + Math.random() * 0.2,
    source: "arcgis_demographics",
  }))
}

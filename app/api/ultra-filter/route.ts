import { type NextRequest, NextResponse } from "next/server"

interface FilterDimension {
  field: string
  type: "string" | "number" | "boolean" | "array" | "range" | "geo"
  category: string
  description: string
  options?: string[]
  min?: number
  max?: number
}

const ULTRA_FILTER_DIMENSIONS: FilterDimension[] = [
  // Firm Identity & Structure
  { field: "naics_1", type: "string", category: "identity", description: "1-digit NAICS code" },
  { field: "naics_3", type: "string", category: "identity", description: "3-digit NAICS code" },
  { field: "naics_4", type: "string", category: "identity", description: "4-digit NAICS code" },
  { field: "naics_6", type: "string", category: "identity", description: "6-digit NAICS code" },
  {
    field: "franchise_type",
    type: "string",
    category: "identity",
    description: "Franchise vs independent vs chain",
    options: ["franchise", "independent", "chain"],
  },
  {
    field: "ownership_type",
    type: "string",
    category: "identity",
    description: "Ownership structure",
    options: ["family", "pe_backed", "esop", "public"],
  },
  {
    field: "legal_form",
    type: "string",
    category: "identity",
    description: "Legal entity type",
    options: ["llc", "s_corp", "c_corp", "partnership"],
  },
  {
    field: "location_count",
    type: "range",
    category: "identity",
    description: "Number of locations",
    min: 1,
    max: 1000,
  },
  {
    field: "years_in_business",
    type: "range",
    category: "identity",
    description: "Years in operation",
    min: 0,
    max: 100,
  },

  // Financial Metrics
  {
    field: "revenue_estimate",
    type: "range",
    category: "financial",
    description: "Annual revenue estimate",
    min: 0,
    max: 100000000,
  },
  {
    field: "employee_count",
    type: "range",
    category: "financial",
    description: "Number of employees",
    min: 1,
    max: 10000,
  },
  {
    field: "revenue_per_employee",
    type: "range",
    category: "financial",
    description: "Revenue per employee",
    min: 0,
    max: 1000000,
  },
  {
    field: "growth_rate",
    type: "range",
    category: "financial",
    description: "Annual growth rate %",
    min: -50,
    max: 200,
  },
  {
    field: "profit_margin",
    type: "range",
    category: "financial",
    description: "Estimated profit margin %",
    min: 0,
    max: 50,
  },
  {
    field: "debt_to_equity",
    type: "range",
    category: "financial",
    description: "Debt to equity ratio",
    min: 0,
    max: 10,
  },

  // Geographic & Market
  { field: "latitude", type: "range", category: "geographic", description: "Latitude coordinate", min: 24, max: 49 },
  {
    field: "longitude",
    type: "range",
    category: "geographic",
    description: "Longitude coordinate",
    min: -125,
    max: -66,
  },
  {
    field: "service_radius_km",
    type: "range",
    category: "geographic",
    description: "Service radius in km",
    min: 0,
    max: 500,
  },
  {
    field: "market_density",
    type: "range",
    category: "geographic",
    description: "Local market density",
    min: 0,
    max: 1,
  },
  {
    field: "population_density",
    type: "range",
    category: "geographic",
    description: "Area population density",
    min: 0,
    max: 10000,
  },
  {
    field: "median_income",
    type: "range",
    category: "geographic",
    description: "Area median income",
    min: 20000,
    max: 200000,
  },

  // Operational Characteristics
  {
    field: "certifications",
    type: "array",
    category: "operational",
    description: "Industry certifications",
    options: ["ISO", "UL", "FM", "OSHA", "EPA"],
  },
  { field: "licenses_active", type: "boolean", category: "operational", description: "Has active licenses" },
  { field: "union_presence", type: "boolean", category: "operational", description: "Union workforce" },
  {
    field: "seasonal_exposure",
    type: "range",
    category: "operational",
    description: "Seasonal revenue variation %",
    min: 0,
    max: 80,
  },
  {
    field: "safety_incidents",
    type: "range",
    category: "operational",
    description: "Safety incident count",
    min: 0,
    max: 50,
  },
  {
    field: "backlog_indicator",
    type: "range",
    category: "operational",
    description: "Work backlog weeks",
    min: 0,
    max: 52,
  },

  // Technology & Digital
  {
    field: "website_quality",
    type: "range",
    category: "technology",
    description: "Website quality score",
    min: 0,
    max: 100,
  },
  {
    field: "social_media_presence",
    type: "range",
    category: "technology",
    description: "Social media engagement",
    min: 0,
    max: 100,
  },
  {
    field: "online_reviews_count",
    type: "range",
    category: "technology",
    description: "Number of online reviews",
    min: 0,
    max: 10000,
  },
  {
    field: "average_rating",
    type: "range",
    category: "technology",
    description: "Average customer rating",
    min: 1,
    max: 5,
  },
  {
    field: "digital_maturity",
    type: "range",
    category: "technology",
    description: "Digital transformation score",
    min: 0,
    max: 100,
  },

  // Succession & Risk
  { field: "owner_age", type: "range", category: "succession", description: "Primary owner age", min: 25, max: 85 },
  { field: "succession_plan", type: "boolean", category: "succession", description: "Has succession plan" },
  {
    field: "family_involvement",
    type: "range",
    category: "succession",
    description: "Family member involvement %",
    min: 0,
    max: 100,
  },
  {
    field: "key_person_risk",
    type: "range",
    category: "succession",
    description: "Key person dependency risk",
    min: 0,
    max: 1,
  },
  {
    field: "management_depth",
    type: "range",
    category: "succession",
    description: "Management team depth",
    min: 1,
    max: 10,
  },

  // Market Position
  { field: "market_share", type: "range", category: "market", description: "Local market share %", min: 0, max: 100 },
  {
    field: "competitive_intensity",
    type: "range",
    category: "market",
    description: "Competitive pressure score",
    min: 0,
    max: 1,
  },
  {
    field: "customer_concentration",
    type: "range",
    category: "market",
    description: "Top 5 customer revenue %",
    min: 0,
    max: 100,
  },
  {
    field: "supplier_concentration",
    type: "range",
    category: "market",
    description: "Top 5 supplier dependency %",
    min: 0,
    max: 100,
  },
  { field: "pricing_power", type: "range", category: "market", description: "Pricing power index", min: 0, max: 1 },

  // Acquisition Metrics
  {
    field: "acquisition_attractiveness",
    type: "range",
    category: "acquisition",
    description: "Overall acquisition score",
    min: 0,
    max: 1,
  },
  {
    field: "integration_complexity",
    type: "range",
    category: "acquisition",
    description: "Integration difficulty score",
    min: 0,
    max: 1,
  },
  {
    field: "synergy_potential",
    type: "range",
    category: "acquisition",
    description: "Revenue synergy potential",
    min: 0,
    max: 1,
  },
  {
    field: "cultural_fit",
    type: "range",
    category: "acquisition",
    description: "Cultural alignment score",
    min: 0,
    max: 1,
  },
  {
    field: "due_diligence_risk",
    type: "range",
    category: "acquisition",
    description: "DD complexity risk",
    min: 0,
    max: 1,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let filters = ULTRA_FILTER_DIMENSIONS
    if (category) {
      filters = filters.filter((f) => f.category === category)
    }

    return NextResponse.json({
      success: true,
      filters,
      categories: [...new Set(ULTRA_FILTER_DIMENSIONS.map((f) => f.category))],
      total_dimensions: ULTRA_FILTER_DIMENSIONS.length,
    })
  } catch (error) {
    console.error("Ultra-filter error:", error)
    return NextResponse.json({ success: false, error: "Failed to load filters" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters, intent = "search" } = body

    const sqlQuery = buildSQLQuery(filters, intent)
    const metricRequests = buildMetricRequests(filters, intent)

    return NextResponse.json({
      success: true,
      sql_query: sqlQuery,
      metric_requests: metricRequests,
      filter_count: filters?.length || 0,
      intent,
    })
  } catch (error) {
    console.error("Filter processing error:", error)
    return NextResponse.json({ success: false, error: "Failed to process filters" }, { status: 500 })
  }
}

function buildSQLQuery(filters: any[], intent: string) {
  if (!filters || filters.length === 0) return null

  const whereConditions = filters.map((filter) => {
    const { field, op, value } = filter

    switch (op) {
      case "in":
        return `${field} IN (${value.map((v: any) => `'${v}'`).join(", ")})`
      case "between":
        return `${field} BETWEEN ${value[0]} AND ${value[1]}`
      case ">":
        return `${field} > ${value}`
      case "<":
        return `${field} < ${value}`
      case ">=":
        return `${field} >= ${value}`
      case "<=":
        return `${field} <= ${value}`
      case "=":
        return `${field} = '${value}'`
      case "within":
        return `ST_Within(location, ST_GeomFromText('${value}'))`
      default:
        return `${field} = '${value}'`
    }
  })

  return {
    select:
      intent === "rollup"
        ? "business_id, name, revenue_estimate, employee_count, owner_age, location, acquisition_score"
        : "business_id, name, industry, location, contact_info, financial_metrics",
    from: "businesses b LEFT JOIN owners o ON b.owner_id = o.id",
    where: whereConditions.join(" AND "),
    intent,
  }
}

function buildMetricRequests(filters: any[], intent: string) {
  const baseMetrics = ["revenue_estimate", "employee_count", "market_share"]

  switch (intent) {
    case "rollup":
      return [...baseMetrics, "FS_ms", "HHI_local", "D2", "MROS", "AAS", "lambda1", "SRI"]
    case "acquisition":
      return [...baseMetrics, "acquisition_attractiveness", "integration_complexity", "synergy_potential"]
    case "succession":
      return [...baseMetrics, "owner_age", "succession_plan", "key_person_risk", "SRI"]
    default:
      return baseMetrics
  }
}

import { type NextRequest, NextResponse } from "next/server"

interface FilterCondition {
  field: string
  op:
    | "="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    | "in"
    | "not_in"
    | "between"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "within"
    | "near"
  value: any
  logical?: "AND" | "OR"
}

interface FilterDSL {
  intent: "rollup" | "acquisition" | "succession" | "market_analysis" | "custom"
  where: FilterCondition[]
  metrics: string[]
  map: {
    layers: string[]
    center?: [number, number]
    zoom?: number
    bounds?: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  aggregations?: {
    group_by?: string[]
    functions?: Array<{
      field: string
      function: "sum" | "avg" | "count" | "min" | "max" | "stddev"
      alias?: string
    }>
  }
  sorting?: Array<{
    field: string
    direction: "asc" | "desc"
  }>
  limit?: number
  confidence_threshold?: number
}

interface CompiledQuery {
  sql: string
  parameters: any[]
  metrics_config: {
    required_metrics: string[]
    computation_order: string[]
    dependencies: Record<string, string[]>
  }
  map_config: {
    layers: Array<{
      type: "pins" | "clusters" | "choropleth" | "heatmap" | "flow"
      data_source: string
      styling: any
    }>
    viewport: {
      center: [number, number]
      zoom: number
      bounds?: any
    }
  }
  cache_key: string
  estimated_cost: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dsl, validate_only = false } = body

    console.log("[v0] Filter DSL compilation request:", { dsl, validate_only })

    // Validate DSL structure
    const validation = validateDSL(dsl)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: "Invalid DSL structure",
        validation_errors: validation.errors,
      })
    }

    // Compile DSL to executable query
    const compiledQuery = await compileDSL(dsl)

    if (validate_only) {
      return NextResponse.json({
        success: true,
        validation: validation,
        estimated_cost: compiledQuery.estimated_cost,
        cache_key: compiledQuery.cache_key,
      })
    }

    // Execute compiled query
    const results = await executeDSLQuery(compiledQuery, dsl)

    return NextResponse.json({
      success: true,
      compiled_query: compiledQuery,
      results,
      execution_time_ms: Date.now() - Date.now(),
    })
  } catch (error) {
    console.error("[v0] Filter DSL error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process Filter DSL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "schema":
        return NextResponse.json({
          success: true,
          schema: getDSLSchema(),
        })

      case "examples":
        return NextResponse.json({
          success: true,
          examples: getDSLExamples(),
        })

      case "fields":
        return NextResponse.json({
          success: true,
          available_fields: getAvailableFields(),
        })

      default:
        return NextResponse.json({
          success: true,
          documentation: getDSLDocumentation(),
        })
    }
  } catch (error) {
    console.error("[v0] Filter DSL GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to get DSL information" }, { status: 500 })
  }
}

function validateDSL(dsl: FilterDSL): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate required fields
  if (!dsl.intent) {
    errors.push("Missing required field: intent")
  }

  if (!dsl.where || !Array.isArray(dsl.where)) {
    errors.push("Missing or invalid 'where' conditions array")
  }

  if (!dsl.metrics || !Array.isArray(dsl.metrics)) {
    errors.push("Missing or invalid 'metrics' array")
  }

  if (!dsl.map || !dsl.map.layers || !Array.isArray(dsl.map.layers)) {
    errors.push("Missing or invalid 'map.layers' array")
  }

  // Validate where conditions
  if (dsl.where) {
    dsl.where.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Where condition ${index}: missing 'field'`)
      }
      if (!condition.op) {
        errors.push(`Where condition ${index}: missing 'op'`)
      }
      if (condition.value === undefined || condition.value === null) {
        errors.push(`Where condition ${index}: missing 'value'`)
      }

      // Validate operator-specific requirements
      if (condition.op === "between" && (!Array.isArray(condition.value) || condition.value.length !== 2)) {
        errors.push(`Where condition ${index}: 'between' operator requires array with 2 values`)
      }

      if ((condition.op === "in" || condition.op === "not_in") && !Array.isArray(condition.value)) {
        errors.push(`Where condition ${index}: '${condition.op}' operator requires array value`)
      }
    })
  }

  // Validate metrics
  const validMetrics = [
    "revenue_estimate",
    "employee_count",
    "owner_age",
    "FS_ms",
    "HHI_local",
    "D2",
    "SRI",
    "lambda1",
    "MROS",
    "AAS",
    "PCVS",
  ]

  if (dsl.metrics) {
    dsl.metrics.forEach((metric) => {
      if (!validMetrics.includes(metric)) {
        errors.push(`Invalid metric: ${metric}`)
      }
    })
  }

  // Validate map layers
  const validLayers = ["pins", "clusters", "choropleth", "heatmap", "flow"]
  if (dsl.map?.layers) {
    dsl.map.layers.forEach((layer) => {
      if (!validLayers.includes(layer)) {
        errors.push(`Invalid map layer: ${layer}`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

async function compileDSL(dsl: FilterDSL): Promise<CompiledQuery> {
  // Generate SQL query from DSL
  const sqlQuery = buildSQLFromDSL(dsl)

  // Determine required metrics and computation order
  const metricsConfig = buildMetricsConfig(dsl.metrics, dsl.intent)

  // Configure map layers and styling
  const mapConfig = buildMapConfig(dsl.map, dsl.intent)

  // Generate cache key
  const cacheKey = generateCacheKey(dsl)

  // Estimate computational cost
  const estimatedCost = estimateQueryCost(dsl)

  return {
    sql: sqlQuery.query,
    parameters: sqlQuery.parameters,
    metrics_config: metricsConfig,
    map_config: mapConfig,
    cache_key: cacheKey,
    estimated_cost: estimatedCost,
  }
}

function buildSQLFromDSL(dsl: FilterDSL): { query: string; parameters: any[] } {
  const parameters: any[] = []
  let paramIndex = 1

  // Build SELECT clause
  const selectFields = [
    "b.business_id",
    "b.name",
    "b.latitude",
    "b.longitude",
    "b.revenue_estimate",
    "b.employee_count",
    "b.industry_code",
    "o.age as owner_age",
    "o.succession_plan",
  ]

  // Add metric-specific fields
  if (dsl.metrics.includes("FS_ms")) selectFields.push("m.fragmentation_score")
  if (dsl.metrics.includes("HHI_local")) selectFields.push("m.hhi_local")
  if (dsl.metrics.includes("SRI")) selectFields.push("m.succession_risk")
  if (dsl.metrics.includes("AAS")) selectFields.push("m.acquisition_score")

  // Build FROM clause with joins
  const fromClause = `
    FROM businesses b
    LEFT JOIN owners o ON b.owner_id = o.id
    LEFT JOIN business_metrics m ON b.business_id = m.business_id
  `

  // Build WHERE clause
  const whereConditions: string[] = []
  let currentLogical = "AND"

  dsl.where.forEach((condition) => {
    const paramPlaceholder = `$${paramIndex++}`
    let sqlCondition = ""

    switch (condition.op) {
      case "=":
        sqlCondition = `${condition.field} = ${paramPlaceholder}`
        parameters.push(condition.value)
        break
      case "!=":
        sqlCondition = `${condition.field} != ${paramPlaceholder}`
        parameters.push(condition.value)
        break
      case ">":
        sqlCondition = `${condition.field} > ${paramPlaceholder}`
        parameters.push(condition.value)
        break
      case "<":
        sqlCondition = `${condition.field} < ${paramPlaceholder}`
        parameters.push(condition.value)
        break
      case ">=":
        sqlCondition = `${condition.field} >= ${paramPlaceholder}`
        parameters.push(condition.value)
        break
      case "<=":
        sqlCondition = `${condition.field} <= ${paramPlaceholder}`
        parameters.push(condition.value)
        break
      case "in":
        const inPlaceholders = condition.value.map(() => `$${paramIndex++}`).join(", ")
        sqlCondition = `${condition.field} IN (${inPlaceholders})`
        parameters.push(...condition.value)
        break
      case "not_in":
        const notInPlaceholders = condition.value.map(() => `$${paramIndex++}`).join(", ")
        sqlCondition = `${condition.field} NOT IN (${notInPlaceholders})`
        parameters.push(...condition.value)
        break
      case "between":
        sqlCondition = `${condition.field} BETWEEN $${paramIndex++} AND $${paramIndex++}`
        parameters.push(condition.value[0], condition.value[1])
        break
      case "contains":
        sqlCondition = `${condition.field} ILIKE ${paramPlaceholder}`
        parameters.push(`%${condition.value}%`)
        break
      case "starts_with":
        sqlCondition = `${condition.field} ILIKE ${paramPlaceholder}`
        parameters.push(`${condition.value}%`)
        break
      case "ends_with":
        sqlCondition = `${condition.field} ILIKE ${paramPlaceholder}`
        parameters.push(`%${condition.value}`)
        break
      case "within":
        sqlCondition = `ST_Within(ST_Point(b.longitude, b.latitude), ST_GeomFromText(${paramPlaceholder}))`
        parameters.push(condition.value)
        break
      case "near":
        sqlCondition = `ST_DWithin(ST_Point(b.longitude, b.latitude), ST_Point($${paramIndex++}, $${paramIndex++}), $${paramIndex++})`
        parameters.push(condition.value.lng, condition.value.lat, condition.value.radius)
        break
    }

    if (whereConditions.length > 0) {
      whereConditions.push(` ${condition.logical || currentLogical} ${sqlCondition}`)
    } else {
      whereConditions.push(sqlCondition)
    }

    if (condition.logical) {
      currentLogical = condition.logical
    }
  })

  // Build ORDER BY clause
  let orderByClause = ""
  if (dsl.sorting && dsl.sorting.length > 0) {
    const orderFields = dsl.sorting.map((sort) => `${sort.field} ${sort.direction.toUpperCase()}`).join(", ")
    orderByClause = `ORDER BY ${orderFields}`
  }

  // Build LIMIT clause
  const limitClause = dsl.limit ? `LIMIT ${dsl.limit}` : "LIMIT 1000"

  // Combine all parts
  const query = `
    SELECT ${selectFields.join(", ")}
    ${fromClause}
    ${whereConditions.length > 0 ? `WHERE ${whereConditions.join("")}` : ""}
    ${orderByClause}
    ${limitClause}
  `.trim()

  return { query, parameters }
}

function buildMetricsConfig(metrics: string[], intent: string) {
  const dependencies: Record<string, string[]> = {
    FS_ms: ["revenue_estimate", "employee_count", "latitude", "longitude"],
    HHI_local: ["revenue_estimate", "industry_code", "latitude", "longitude"],
    D2: ["revenue_estimate", "employee_count"],
    SRI: ["owner_age", "succession_plan", "years_in_business"],
    lambda1: ["industry_code", "latitude", "longitude"],
    MROS: ["FS_ms", "revenue_estimate", "latitude", "longitude"],
    AAS: ["revenue_estimate", "employee_count", "owner_age", "FS_ms", "HHI_local"],
    PCVS: ["AAS", "MROS", "SRI"],
  }

  // Determine computation order based on dependencies
  const computationOrder = topologicalSort(metrics, dependencies)

  return {
    required_metrics: metrics,
    computation_order: computationOrder,
    dependencies,
  }
}

function buildMapConfig(mapConfig: FilterDSL["map"], intent: string) {
  const layers = mapConfig.layers.map((layerType) => {
    const layerConfig = {
      type: layerType as "pins" | "clusters" | "choropleth" | "heatmap" | "flow",
      data_source: "businesses",
      styling: getLayerStyling(layerType, intent),
    }
    return layerConfig
  })

  const viewport = {
    center: mapConfig.center || ([-95.7129, 37.0902] as [number, number]),
    zoom: mapConfig.zoom || 4,
    bounds: mapConfig.bounds,
  }

  return {
    layers,
    viewport,
  }
}

function getLayerStyling(layerType: string, intent: string) {
  const intentColors = {
    acquisition: { primary: "#00ff00", secondary: "#00cc00" },
    rollup: { primary: "#00ffff", secondary: "#00cccc" },
    succession: { primary: "#ffff00", secondary: "#cccc00" },
    market_analysis: { primary: "#ff00ff", secondary: "#cc00cc" },
    custom: { primary: "#ffffff", secondary: "#cccccc" },
  }

  const colors = intentColors[intent as keyof typeof intentColors] || intentColors.custom

  switch (layerType) {
    case "pins":
      return {
        fillColor: colors.primary,
        strokeColor: colors.secondary,
        radius: 8,
        opacity: 0.8,
      }
    case "clusters":
      return {
        fillColor: colors.primary,
        strokeColor: colors.secondary,
        minRadius: 20,
        maxRadius: 80,
        opacity: 0.6,
      }
    case "choropleth":
      return {
        colorScale: [colors.secondary, colors.primary],
        opacity: 0.7,
        strokeWidth: 1,
      }
    case "heatmap":
      return {
        colorScale: [colors.secondary, colors.primary],
        radius: 30,
        blur: 15,
        opacity: 0.6,
      }
    case "flow":
      return {
        strokeColor: colors.primary,
        strokeWidth: 2,
        opacity: 0.8,
        animated: true,
      }
    default:
      return {}
  }
}

function topologicalSort(metrics: string[], dependencies: Record<string, string[]>): string[] {
  const visited = new Set<string>()
  const result: string[] = []

  function visit(metric: string) {
    if (visited.has(metric)) return

    const deps = dependencies[metric] || []
    deps.forEach((dep) => {
      if (metrics.includes(dep)) {
        visit(dep)
      }
    })

    visited.add(metric)
    result.push(metric)
  }

  metrics.forEach(visit)
  return result
}

function generateCacheKey(dsl: FilterDSL): string {
  const hash = require("crypto").createHash("md5")
  hash.update(JSON.stringify(dsl))
  return `dsl_${hash.digest("hex")}`
}

function estimateQueryCost(dsl: FilterDSL): number {
  let cost = 1 // Base cost

  // Add cost for each where condition
  cost += dsl.where.length * 0.1

  // Add cost for each metric
  const metricCosts = {
    FS_ms: 2.0,
    HHI_local: 1.5,
    D2: 3.0,
    SRI: 1.0,
    lambda1: 2.5,
    MROS: 1.8,
    AAS: 2.2,
    PCVS: 1.5,
  }

  dsl.metrics.forEach((metric) => {
    cost += metricCosts[metric as keyof typeof metricCosts] || 1.0
  })

  // Add cost for map layers
  cost += dsl.map.layers.length * 0.5

  // Add cost for aggregations
  if (dsl.aggregations?.functions) {
    cost += dsl.aggregations.functions.length * 0.3
  }

  return Math.round(cost * 100) / 100
}

async function executeDSLQuery(compiledQuery: CompiledQuery, dsl: FilterDSL) {
  try {
    // In a real implementation, this would execute against a database
    // For now, we'll simulate the execution with mock data

    console.log("[v0] Executing DSL query:", compiledQuery.sql)

    // Simulate database query execution
    const mockBusinesses = generateMockBusinessData(dsl.limit || 100)

    // Apply filters (simplified simulation)
    const filteredBusinesses = applyFiltersToMockData(mockBusinesses, dsl.where)

    // Compute metrics
    const businessesWithMetrics = await computeMetricsForBusinesses(filteredBusinesses, dsl.metrics)

    // Generate map data
    const mapData = generateMapDataFromBusinesses(businessesWithMetrics, compiledQuery.map_config)

    return {
      businesses: businessesWithMetrics,
      map_data: mapData,
      total_count: businessesWithMetrics.length,
      execution_stats: {
        query_time_ms: Math.random() * 100 + 50,
        cache_hit: Math.random() > 0.7,
        cost_units: compiledQuery.estimated_cost,
      },
    }
  } catch (error) {
    console.error("[v0] DSL query execution error:", error)
    throw error
  }
}

function generateMockBusinessData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    business_id: `business_${i}`,
    name: `Business ${i + 1}`,
    latitude: 37.0902 + (Math.random() - 0.5) * 10,
    longitude: -95.7129 + (Math.random() - 0.5) * 10,
    revenue_estimate: Math.floor(Math.random() * 10000000) + 500000,
    employee_count: Math.floor(Math.random() * 50) + 5,
    industry_code: ["238220", "238110", "238210", "541330"][Math.floor(Math.random() * 4)],
    owner_age: Math.floor(Math.random() * 30) + 40,
    succession_plan: Math.random() > 0.7,
    years_in_business: Math.floor(Math.random() * 25) + 5,
  }))
}

function applyFiltersToMockData(businesses: any[], filters: FilterCondition[]) {
  return businesses.filter((business) => {
    return filters.every((filter) => {
      const fieldValue = business[filter.field]

      switch (filter.op) {
        case "=":
          return fieldValue === filter.value
        case "!=":
          return fieldValue !== filter.value
        case ">":
          return fieldValue > filter.value
        case "<":
          return fieldValue < filter.value
        case ">=":
          return fieldValue >= filter.value
        case "<=":
          return fieldValue <= filter.value
        case "in":
          return filter.value.includes(fieldValue)
        case "not_in":
          return !filter.value.includes(fieldValue)
        case "between":
          return fieldValue >= filter.value[0] && fieldValue <= filter.value[1]
        case "contains":
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase())
        default:
          return true
      }
    })
  })
}

async function computeMetricsForBusinesses(businesses: any[], metrics: string[]) {
  return businesses.map((business) => {
    const computedMetrics: any = {}

    metrics.forEach((metric) => {
      switch (metric) {
        case "FS_ms":
          computedMetrics.FS_ms = Math.random()
          break
        case "HHI_local":
          computedMetrics.HHI_local = Math.random() * 0.5
          break
        case "D2":
          computedMetrics.D2 = 1.2 + Math.random() * 0.8
          break
        case "SRI":
          computedMetrics.SRI = Math.random()
          break
        case "lambda1":
          computedMetrics.lambda1 = Math.random() * 0.5
          break
        case "MROS":
          computedMetrics.MROS = Math.random()
          break
        case "AAS":
          computedMetrics.AAS = Math.random()
          break
        case "PCVS":
          computedMetrics.PCVS = Math.random()
          break
      }
    })

    return {
      ...business,
      metrics: computedMetrics,
    }
  })
}

function generateMapDataFromBusinesses(businesses: any[], mapConfig: any) {
  const features = businesses.map((business) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [business.longitude, business.latitude],
    },
    properties: {
      business_id: business.business_id,
      name: business.name,
      revenue_estimate: business.revenue_estimate,
      employee_count: business.employee_count,
      ...business.metrics,
    },
  }))

  return {
    type: "FeatureCollection",
    features,
    layers: mapConfig.layers,
    viewport: mapConfig.viewport,
  }
}

function getDSLSchema() {
  return {
    type: "object",
    properties: {
      intent: {
        type: "string",
        enum: ["rollup", "acquisition", "succession", "market_analysis", "custom"],
        description: "The analysis intent that determines default metrics and styling",
      },
      where: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", description: "Field name to filter on" },
            op: {
              type: "string",
              enum: [
                "=",
                "!=",
                ">",
                "<",
                ">=",
                "<=",
                "in",
                "not_in",
                "between",
                "contains",
                "starts_with",
                "ends_with",
                "within",
                "near",
              ],
              description: "Comparison operator",
            },
            value: { description: "Value to compare against (type depends on operator)" },
            logical: { type: "string", enum: ["AND", "OR"], description: "Logical operator for chaining conditions" },
          },
          required: ["field", "op", "value"],
        },
      },
      metrics: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "revenue_estimate",
            "employee_count",
            "owner_age",
            "FS_ms",
            "HHI_local",
            "D2",
            "SRI",
            "lambda1",
            "MROS",
            "AAS",
            "PCVS",
          ],
        },
        description: "Metrics to compute for each business",
      },
      map: {
        type: "object",
        properties: {
          layers: {
            type: "array",
            items: { type: "string", enum: ["pins", "clusters", "choropleth", "heatmap", "flow"] },
            description: "Map visualization layers to generate",
          },
          center: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            description: "Map center [lng, lat]",
          },
          zoom: { type: "number", description: "Initial zoom level" },
          bounds: {
            type: "object",
            properties: {
              north: { type: "number" },
              south: { type: "number" },
              east: { type: "number" },
              west: { type: "number" },
            },
          },
        },
        required: ["layers"],
      },
    },
    required: ["intent", "where", "metrics", "map"],
  }
}

function getDSLExamples() {
  return [
    {
      name: "HVAC Roll-up Opportunity",
      description: "Find HVAC companies in Texas suitable for roll-up acquisition",
      dsl: {
        intent: "rollup",
        where: [
          { field: "industry_code", op: "in", value: ["238220"] },
          { field: "revenue_estimate", op: "between", value: [2000000, 10000000] },
          { field: "owner_age", op: ">", value: 55 },
          { field: "latitude", op: "between", value: [25.8, 36.5], logical: "AND" },
          { field: "longitude", op: "between", value: [-106.6, -93.5], logical: "AND" },
        ],
        metrics: ["FS_ms", "HHI_local", "D2", "MROS", "AAS", "lambda1", "SRI"],
        map: {
          layers: ["pins", "clusters", "choropleth:HHI_local", "heatmap:density"],
          center: [-97.7431, 31.0545],
          zoom: 6,
        },
      },
    },
    {
      name: "Succession Risk Analysis",
      description: "Identify businesses with high succession risk for acquisition opportunities",
      dsl: {
        intent: "succession",
        where: [
          { field: "owner_age", op: ">=", value: 60 },
          { field: "succession_plan", op: "=", value: false },
          { field: "revenue_estimate", op: ">=", value: 1000000 },
        ],
        metrics: ["SRI", "AAS", "owner_age", "revenue_estimate"],
        map: {
          layers: ["pins", "heatmap"],
        },
      },
    },
    {
      name: "Market Fragmentation Analysis",
      description: "Analyze market fragmentation in the Northeast region",
      dsl: {
        intent: "market_analysis",
        where: [
          { field: "latitude", op: "between", value: [38.8, 47.5] },
          { field: "longitude", op: "between", value: [-80.5, -66.9] },
        ],
        metrics: ["FS_ms", "HHI_local", "D2"],
        map: {
          layers: ["choropleth", "clusters"],
          bounds: { north: 47.5, south: 38.8, east: -66.9, west: -80.5 },
        },
        aggregations: {
          group_by: ["industry_code"],
          functions: [
            { field: "FS_ms", function: "avg", alias: "avg_fragmentation" },
            { field: "HHI_local", function: "avg", alias: "avg_concentration" },
          ],
        },
      },
    },
  ]
}

function getAvailableFields() {
  return {
    business_fields: [
      { name: "business_id", type: "string", description: "Unique business identifier" },
      { name: "name", type: "string", description: "Business name" },
      { name: "industry_code", type: "string", description: "NAICS industry code" },
      { name: "revenue_estimate", type: "number", description: "Estimated annual revenue" },
      { name: "employee_count", type: "number", description: "Number of employees" },
      { name: "latitude", type: "number", description: "Business latitude" },
      { name: "longitude", type: "number", description: "Business longitude" },
      { name: "years_in_business", type: "number", description: "Years in operation" },
    ],
    owner_fields: [
      { name: "owner_age", type: "number", description: "Primary owner age" },
      { name: "succession_plan", type: "boolean", description: "Has succession plan" },
      { name: "family_involvement", type: "number", description: "Family involvement percentage" },
    ],
    computed_metrics: [
      { name: "FS_ms", type: "number", description: "Multi-scale fragmentation score" },
      { name: "HHI_local", type: "number", description: "Local Herfindahl-Hirschman Index" },
      { name: "D2", type: "number", description: "Correlation dimension" },
      { name: "SRI", type: "number", description: "Succession Risk Indicator" },
      { name: "lambda1", type: "number", description: "Hawkes process intensity" },
      { name: "MROS", type: "number", description: "Market Roll-up Opportunity Score" },
      { name: "AAS", type: "number", description: "Acquisition Attractiveness Score" },
      { name: "PCVS", type: "number", description: "Portfolio Construction Value Score" },
    ],
  }
}

function getDSLDocumentation() {
  return {
    overview: "Filter DSL allows complex business intelligence queries with natural language-like syntax",
    syntax: {
      intent: "Defines the analysis purpose and default styling",
      where: "Array of filter conditions with field, operator, and value",
      metrics: "List of computed metrics to include in results",
      map: "Map visualization configuration with layers and viewport",
    },
    operators: {
      "=": "Exact equality",
      "!=": "Not equal",
      ">": "Greater than",
      "<": "Less than",
      ">=": "Greater than or equal",
      "<=": "Less than or equal",
      in: "Value in array",
      not_in: "Value not in array",
      between: "Value between two numbers",
      contains: "String contains substring",
      starts_with: "String starts with substring",
      ends_with: "String ends with substring",
      within: "Geographic point within polygon",
      near: "Geographic point within radius",
    },
    examples_url: "/api/filter-dsl?action=examples",
    schema_url: "/api/filter-dsl?action=schema",
  }
}

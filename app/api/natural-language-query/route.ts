import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { API_CONFIG } from "@/lib/config"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || API_CONFIG.OPENAI_API_KEY,
})

// Database schema for OpenAI context
const DB_SCHEMA = `
Tables:
- businesses(business_id, name, industry_code, revenue_estimate, employee_count, headquarters_location, geom)
- owners(owner_id, business_id, full_name, age_estimate, tenure_years, contactability_score)
- market_stats(market_id, level, code, industry_code, population, median_income, business_density, competitor_count, hhi, fragmentation_score, tam_estimate)
- competition(comp_id, industry_code, geography, total_firms, largest_firm_revenue, hhi, fragmentation_score, rollup_opportunity_score)
- signals(signal_id, business_id, signal_type, signal_value, observed_at, source, confidence)
`

export async function POST(request: NextRequest) {
  try {
    const { naturalQuery, intent = "search" } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a business intelligence query translator. Convert natural language queries into structured filters and SQL.
          
Database Schema:
${DB_SCHEMA}

Return a JSON object with:
- sql: The SQL query (SELECT only, no INSERT/UPDATE/DELETE)
- filters: Array of filter objects with {field, operator, value, label}
- intent: One of [acquisition, rollup, outreach, research, competitive]
- mapConfig: Configuration for map visualization
- metrics: Array of metrics to compute [hhi, fragmentation, rollup_score, succession_risk]

Safety rules:
- Only use whitelisted tables: businesses, owners, market_stats, competition, signals
- No destructive operations
- Always include LIMIT clause (max 1000)
- Use parameterized queries`,
        },
        {
          role: "user",
          content: naturalQuery,
        },
      ],
      temperature: 0.1,
    })

    const response = completion.choices[0].message.content
    let queryStructure

    try {
      queryStructure = JSON.parse(response)
    } catch (parseError) {
      // Fallback: extract SQL if JSON parsing fails
      const sqlMatch = response.match(/SELECT[\s\S]*?;/i)
      queryStructure = {
        sql: sqlMatch ? sqlMatch[0] : "SELECT * FROM businesses LIMIT 100",
        filters: [],
        intent: intent,
        mapConfig: { type: "pins", clustering: true },
        metrics: ["fragmentation"],
      }
    }

    const { sql, filters, mapConfig, metrics } = queryStructure

    if (!sql.match(/^SELECT/i)) {
      throw new Error("Only SELECT queries allowed")
    }

    if (!sql.match(/businesses|owners|market_stats|competition|signals/i)) {
      throw new Error("Query must reference valid tables")
    }

    const mockResults = {
      businesses: Array.from({ length: Math.min(50, Math.floor(Math.random() * 100) + 10) }, (_, i) => ({
        business_id: `bus_${i}`,
        name: `Business ${i + 1}`,
        industry_code: "541330",
        revenue_estimate: Math.floor(Math.random() * 10000000) + 500000,
        employee_count: Math.floor(Math.random() * 100) + 5,
        headquarters_location: `${40.7128 + (Math.random() - 0.5) * 0.1}, ${-74.006 + (Math.random() - 0.5) * 0.1}`,
        geom: {
          type: "Point",
          coordinates: [-74.006 + (Math.random() - 0.5) * 0.1, 40.7128 + (Math.random() - 0.5) * 0.1],
        },
        owner_age_estimate: Math.floor(Math.random() * 30) + 35,
        succession_risk: Math.random() * 0.8 + 0.1,
        acquisition_score: Math.random() * 10,
        rollup_opportunity: Math.random(),
      })),
    }

    return NextResponse.json({
      success: true,
      query: naturalQuery,
      sql: sql,
      filters: filters,
      intent: queryStructure.intent,
      mapConfig: mapConfig,
      metrics: metrics,
      results: mockResults.businesses,
      summary: {
        total_businesses: mockResults.businesses.length,
        avg_revenue:
          mockResults.businesses.reduce((sum, b) => sum + b.revenue_estimate, 0) / mockResults.businesses.length,
        fragmentation_score: Math.random() * 0.8 + 0.1,
        rollup_opportunity_score: Math.random() * 0.9 + 0.1,
      },
    })
  } catch (error: any) {
    console.error("[v0] Natural language query error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

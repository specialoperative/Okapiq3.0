import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, filters, location } = await request.json()

    const advancedIntelligenceResponse = await fetch(`${request.nextUrl.origin}/api/advanced-intelligence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        location: location || "United States",
        industry: filters?.industry || "All Industries",
        maxResults: filters?.maxResults || 50,
      }),
    })

    if (!advancedIntelligenceResponse.ok) {
      throw new Error(`Advanced intelligence API failed: ${advancedIntelligenceResponse.statusText}`)
    }

    const intelligenceData = await advancedIntelligenceResponse.json()

    const enhancedData = {
      ...intelligenceData,
      dealIntelligence: {
        acquisitionOpportunities: intelligenceData.businesses?.filter((b: any) => b.acquisitionScore > 7) || [],
        successionRisk: intelligenceData.businesses?.filter((b: any) => b.successionRisk === "High") || [],
        marketFragmentation: intelligenceData.marketIntelligence?.hhi < 0.15 ? "Highly Fragmented" : "Consolidated",
        investmentThesis: generateInvestmentThesis(intelligenceData),
      },
    }

    return NextResponse.json({
      success: true,
      data: enhancedData,
      heatmap: intelligenceData.heatmap || [],
      companies: intelligenceData.businesses || [],
      analytics: intelligenceData.marketIntelligence || {},
    })
  } catch (error) {
    console.error("Deal Intelligence API error:", error)
    return NextResponse.json({ success: false, error: "Deal intelligence analysis failed" }, { status: 500 })
  }
}

function generateInvestmentThesis(data: any) {
  const businesses = data.businesses || []
  const marketIntel = data.marketIntelligence || {}

  if (businesses.length === 0) {
    return "No viable acquisition targets identified in current market parameters."
  }

  const highScoreTargets = businesses.filter((b: any) => b.acquisitionScore > 8).length
  const tam = marketIntel.tam || 0
  const hhi = marketIntel.hhi || 0

  return `Market presents ${highScoreTargets} premium acquisition targets within $${tam}B TAM. ${
    hhi < 0.15
      ? "Fragmented market structure creates consolidation opportunities."
      : "Consolidated market requires strategic positioning."
  } Recommend immediate due diligence on top-tier prospects.`
}

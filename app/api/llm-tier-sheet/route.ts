import { type NextRequest, NextResponse } from "next/server"

interface TierSheetRequest {
  businessId: string
  businessData?: any
  analysisType?: "full" | "quick" | "custom"
}

interface TierSheetResponse {
  businessId: string
  tier: "Tier 1" | "Tier 2" | "Tier 3"
  score: number
  executiveSummary: string
  investmentThesis: string
  financialProjections: {
    currentRevenue: number
    projectedRevenue: number
    ebitdaMargin: number
    valuationRange: { min: number; max: number }
  }
  riskAssessment: {
    level: "Low" | "Medium" | "High"
    factors: string[]
    mitigation: string[]
  }
  acquisitionRecommendation: {
    recommendation: "Strong Buy" | "Buy" | "Hold" | "Pass"
    reasoning: string
    nextSteps: string[]
  }
  generatedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TierSheetRequest = await request.json()
    console.log("[v0] LLM Tier Sheet request:", body)

    // Simulate LLM processing with sophisticated business analysis
    const tierSheet = await generateTierSheet(body.businessId, body.businessData, body.analysisType)

    console.log("[v0] Generated tier sheet for business:", body.businessId)

    return NextResponse.json({
      success: true,
      tierSheet,
    })
  } catch (error) {
    console.error("[v0] LLM tier sheet error:", error)
    return NextResponse.json({ error: "Failed to generate tier sheet", details: String(error) }, { status: 500 })
  }
}

async function generateTierSheet(
  businessId: string,
  businessData?: any,
  analysisType = "full",
): Promise<TierSheetResponse> {
  // Mock sophisticated LLM-powered analysis
  const mockBusinessData = businessData || {
    name: "Elite HVAC Services",
    industry: "HVAC Services",
    location: "Dallas, TX",
    revenue: 2500000,
    employees: 15,
    yearEstablished: 2010,
    ownerAge: 58,
    digitalPresence: 0.45,
    marketShare: 0.08,
  }

  // Sophisticated scoring algorithm
  const revenueScore = Math.min(mockBusinessData.revenue / 5000000, 1) * 30
  const stabilityScore = Math.min((2024 - mockBusinessData.yearEstablished) / 20, 1) * 25
  const successionScore = mockBusinessData.ownerAge > 55 ? 25 : mockBusinessData.ownerAge > 45 ? 15 : 5
  const marketScore = mockBusinessData.marketShare * 100 * 20

  const totalScore = revenueScore + stabilityScore + successionScore + marketScore

  let tier: "Tier 1" | "Tier 2" | "Tier 3"
  if (totalScore >= 80) tier = "Tier 1"
  else if (totalScore >= 60) tier = "Tier 2"
  else tier = "Tier 3"

  const valuationMultiple = tier === "Tier 1" ? 4.5 : tier === "Tier 2" ? 3.5 : 2.5
  const valuationRange = {
    min: mockBusinessData.revenue * (valuationMultiple - 0.5),
    max: mockBusinessData.revenue * (valuationMultiple + 0.5),
  }

  return {
    businessId,
    tier,
    score: Math.round(totalScore),
    executiveSummary: `${mockBusinessData.name} is a ${tier.toLowerCase()} acquisition target in the ${mockBusinessData.industry} sector. The company demonstrates ${
      tier === "Tier 1" ? "exceptional" : tier === "Tier 2" ? "solid" : "moderate"
    } fundamentals with estimated annual revenue of $${(mockBusinessData.revenue / 1000000).toFixed(1)}M and ${
      mockBusinessData.employees
    } employees. Located in ${mockBusinessData.location}, the business benefits from ${
      tier === "Tier 1"
        ? "strong market positioning and excellent succession potential"
        : tier === "Tier 2"
          ? "stable operations and good succession timing"
          : "basic operational stability with some succession considerations"
    }.`,
    investmentThesis: `This acquisition opportunity presents ${
      tier === "Tier 1"
        ? "compelling strategic value"
        : tier === "Tier 2"
          ? "solid investment potential"
          : "moderate upside potential"
    } in the fragmented ${mockBusinessData.industry} market. Key value drivers include: (1) Established market presence with ${
      mockBusinessData.yearEstablished ? 2024 - mockBusinessData.yearEstablished : "unknown"
    } years of operations, (2) ${
      mockBusinessData.ownerAge > 55 ? "High succession probability" : "Moderate succession potential"
    } given owner demographics, (3) ${
      tier === "Tier 1" ? "Strong" : tier === "Tier 2" ? "Adequate" : "Basic"
    } operational foundation for growth and optimization, (4) Market consolidation opportunity in ${mockBusinessData.location} region.`,
    financialProjections: {
      currentRevenue: mockBusinessData.revenue,
      projectedRevenue: mockBusinessData.revenue * (tier === "Tier 1" ? 1.25 : tier === "Tier 2" ? 1.15 : 1.08),
      ebitdaMargin: tier === "Tier 1" ? 0.18 : tier === "Tier 2" ? 0.15 : 0.12,
      valuationRange,
    },
    riskAssessment: {
      level: tier === "Tier 1" ? "Low" : tier === "Tier 2" ? "Medium" : "High",
      factors:
        tier === "Tier 1"
          ? ["Market cyclicality", "Key person dependency"]
          : tier === "Tier 2"
            ? ["Market cyclicality", "Key person dependency", "Digital transformation needs"]
            : [
                "Market cyclicality",
                "Key person dependency",
                "Digital transformation needs",
                "Operational inefficiencies",
                "Market competition",
              ],
      mitigation:
        tier === "Tier 1"
          ? ["Diversify service offerings", "Implement management systems", "Build strong leadership team"]
          : tier === "Tier 2"
            ? [
                "Diversify service offerings",
                "Implement management systems",
                "Invest in digital capabilities",
                "Strengthen operations",
              ]
            : [
                "Comprehensive operational overhaul",
                "Digital transformation",
                "Market repositioning",
                "Management team development",
              ],
    },
    acquisitionRecommendation: {
      recommendation: tier === "Tier 1" ? "Strong Buy" : tier === "Tier 2" ? "Buy" : "Hold",
      reasoning:
        tier === "Tier 1"
          ? "Exceptional fundamentals, strong succession timing, and significant value creation potential justify immediate pursuit."
          : tier === "Tier 2"
            ? "Solid operational foundation and good succession opportunity warrant active engagement with structured approach."
            : "Moderate potential requires careful evaluation and may benefit from operational improvements before acquisition.",
      nextSteps:
        tier === "Tier 1"
          ? [
              "Initiate immediate outreach",
              "Prepare comprehensive LOI",
              "Conduct management presentations",
              "Arrange site visits",
            ]
          : tier === "Tier 2"
            ? [
                "Begin relationship building",
                "Conduct preliminary due diligence",
                "Assess operational improvements",
                "Develop acquisition timeline",
              ]
            : [
                "Monitor for operational improvements",
                "Assess market conditions",
                "Consider alternative structures",
                "Maintain periodic contact",
              ],
    },
    generatedAt: new Date().toISOString(),
  }
}

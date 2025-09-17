import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { ebitda, industry, size, risk_factors } = await request.json()

    const baseMultiples: Record<string, [number, number]> = {
      Security: [4, 7],
      Accounting: [5, 8],
      Healthcare: [7, 12],
      Construction: [3, 6],
      "Professional Services": [4, 8],
    }

    const baseMultiple = baseMultiples[industry] || [5, 9]

    // Size premium adjustment
    let sizeAdj = 0
    if (ebitda < 2_000_000) sizeAdj = -1
    else if (ebitda > 10_000_000) sizeAdj = 1

    // Risk penalty calculation
    const riskPenalty =
      -0.5 * (risk_factors.includes("succession") ? 1 : 0) -
      0.5 * (risk_factors.includes("digital") ? 1 : 0) -
      0.3 * (risk_factors.includes("reputation") ? 1 : 0)

    const adjustedLow = baseMultiple[0] + sizeAdj + riskPenalty
    const adjustedHigh = baseMultiple[1] + sizeAdj + riskPenalty

    const valuation = {
      EV_low: Math.max(adjustedLow * ebitda, ebitda * 2), // Floor at 2x
      EV_high: adjustedHigh * ebitda,
      multiple_range: [adjustedLow, adjustedHigh],
    }

    const signals = {
      succession_risk: risk_factors.includes("succession") ? 0.8 : 0.2,
      digital_neglect: risk_factors.includes("digital") ? 0.9 : 0.1,
      entity_age: size > 5_000_000 ? 0.6 : 0.3,
      review_decay: risk_factors.includes("reputation") ? 0.7 : 0.2,
      regulatory_risk: 0.3,
      financial_stress: ebitda < 500_000 ? 0.8 : 0.2,
    }

    const weights = {
      succession_risk: 0.3,
      digital_neglect: 0.2,
      entity_age: 0.15,
      review_decay: 0.15,
      regulatory_risk: 0.1,
      financial_stress: 0.1,
    }

    const sellerPropensity = Math.round(
      Object.entries(weights).reduce(
        (sum, [key, weight]) => sum + weight * (signals[key as keyof typeof signals] || 0),
        0,
      ) * 100,
    )

    const totalRiskFactors = risk_factors.length
    const riskLevel = totalRiskFactors >= 2 ? "High" : totalRiskFactors === 1 ? "Medium" : "Low"

    return NextResponse.json({
      ...valuation,
      sellerPropensity,
      riskLevel,
      riskFactors: risk_factors,
    })
  } catch (error) {
    console.error("[v0] Advanced valuation API error:", error)
    return NextResponse.json({ error: "Valuation calculation failed" }, { status: 500 })
  }
}

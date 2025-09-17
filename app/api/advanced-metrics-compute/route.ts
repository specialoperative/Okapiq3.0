import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { features, dsl, timeseries } = await request.json()

    const computeHHI = (revenues: number[]) => {
      const total = revenues.reduce((sum, rev) => sum + rev, 0)
      if (total <= 0) return 0
      const shares = revenues.map((rev) => rev / total)
      return shares.reduce((sum, share) => sum + share * share, 0)
    }

    const computeFragmentation = (revenues: number[]) => {
      return 1 - computeHHI(revenues)
    }

    const computeMultiscaleFragmentation = (coords: number[][], revenues: number[]) => {
      // Simplified multiscale analysis
      const scales = [1, 5, 20] // km
      let totalFragmentation = 0

      scales.forEach((scale) => {
        // For each scale, compute local fragmentation
        const localFragmentation = computeFragmentation(revenues)
        totalFragmentation += localFragmentation
      })

      return totalFragmentation / scales.length
    }

    const computeSuccessionRisk = (ownerAge: number, tenureYears: number) => {
      const ageRisk = Math.max(0, (ownerAge - 50) / 30) // Risk increases after 50
      const tenureRisk = Math.max(0, (tenureYears - 15) / 20) // Risk increases after 15 years
      return Math.min(1, (ageRisk + tenureRisk) / 2)
    }

    const computeRollupScore = (fragmentation: number, marketSize: number, competitorCount: number) => {
      const fragmentationWeight = fragmentation * 0.4
      const marketSizeWeight = Math.min(1, marketSize / 100000000) * 0.3 // Normalize to $100M
      const competitionWeight = Math.min(1, competitorCount / 50) * 0.3 // Normalize to 50 competitors
      return fragmentationWeight + marketSizeWeight + competitionWeight
    }

    const enrichedFeatures = features.map((feature: any) => {
      const props = feature.properties
      const coords = feature.geometry.coordinates

      // Extract business data
      const revenue = props.revenue_estimate || 0
      const ownerAge = props.owner_age_estimate || 45
      const tenureYears = props.owner_tenure_years || 10
      const employeeCount = props.employee_count || 10

      // Compute advanced metrics
      const successionRisk = computeSuccessionRisk(ownerAge, tenureYears)
      const localFragmentation = Math.random() * 0.8 + 0.1 // Placeholder
      const rollupScore = computeRollupScore(localFragmentation, revenue, 25)

      // Chaos metrics (simplified)
      const lyapunovExponent = Math.random() * 0.5 // Placeholder for chaos analysis
      const hawkesBranchingRatio = Math.random() * 0.8 // Placeholder for Hawkes process

      // MROS (Market Roll-up Opportunity Score)
      const mros = Math.min(1, rollupScore * (1 + localFragmentation) * (1 - successionRisk))

      // AAS (Acquisition Attractiveness Score)
      const expectedEbitda = revenue * 0.15 // 15% EBITDA margin assumption
      const cvar95 = expectedEbitda * 0.3 // 30% risk
      const aas = expectedEbitda - 0.5 * cvar95

      return {
        ...feature,
        properties: {
          ...props,
          // Advanced metrics
          succession_risk: successionRisk,
          fragmentation_score: localFragmentation,
          rollup_opportunity_score: rollupScore,
          lyapunov_exponent: lyapunovExponent,
          hawkes_branching_ratio: hawkesBranchingRatio,
          mros_score: mros,
          aas_score: aas,
          // Derived insights
          acquisition_priority: mros > 0.7 ? "high" : mros > 0.4 ? "medium" : "low",
          succession_urgency: successionRisk > 0.6 ? "urgent" : successionRisk > 0.3 ? "moderate" : "low",
          market_opportunity: rollupScore > 0.6 ? "excellent" : rollupScore > 0.3 ? "good" : "limited",
        },
      }
    })

    const revenues = features.map((f: any) => f.properties.revenue_estimate || 0)
    const overallHHI = computeHHI(revenues)
    const overallFragmentation = computeFragmentation(revenues)
    const avgSuccessionRisk =
      enrichedFeatures.reduce((sum: number, f: any) => sum + f.properties.succession_risk, 0) / enrichedFeatures.length
    const avgRollupScore =
      enrichedFeatures.reduce((sum: number, f: any) => sum + f.properties.rollup_opportunity_score, 0) /
      enrichedFeatures.length

    return NextResponse.json({
      success: true,
      features: enrichedFeatures,
      summary: {
        total_businesses: features.length,
        hhi_index: overallHHI,
        fragmentation_score: overallFragmentation,
        avg_succession_risk: avgSuccessionRisk,
        avg_rollup_score: avgRollupScore,
        market_concentration: overallHHI > 0.25 ? "concentrated" : overallHHI > 0.15 ? "moderate" : "fragmented",
        rollup_opportunity: avgRollupScore > 0.6 ? "high" : avgRollupScore > 0.3 ? "medium" : "low",
      },
      byBusiness: enrichedFeatures.reduce((acc: any, f: any) => {
        acc[f.properties.business_id] = {
          succession_risk: f.properties.succession_risk,
          rollup_opportunity_score: f.properties.rollup_opportunity_score,
          mros_score: f.properties.mros_score,
          aas_score: f.properties.aas_score,
        }
        return acc
      }, {}),
    })
  } catch (error: any) {
    console.error("[v0] Advanced metrics computation error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

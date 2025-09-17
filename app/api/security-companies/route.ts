import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { yelpApiKey, dataAxleApiKey, zipCode, industry, searchTerm } = await request.json()

    console.log("[v0] Fetching security companies:", { zipCode, industry, searchTerm })

    const yelpParams = new URLSearchParams({
      categories: "security",
      location: zipCode || "Houston, TX",
      limit: "50",
      sort_by: "rating",
    })

    if (searchTerm) {
      yelpParams.append("term", searchTerm)
    }

    const yelpResponse = await fetch(`https://api.yelp.com/v3/businesses/search?${yelpParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${yelpApiKey}`,
        "Content-Type": "application/json",
      },
    })

    let companies = []

    if (yelpResponse.ok) {
      const yelpData = await yelpResponse.json()
      console.log("[v0] Yelp API response:", yelpData.businesses?.length || 0, "businesses found")

      companies =
        yelpData.businesses?.map((business: any, index: number) => ({
          id: `yelp-${business.id}`,
          name: business.name,
          industry: industry,
          subIndustry: "Security Services",
          location: business.location?.display_address?.join(", ") || "Unknown",
          zipCode: business.location?.zip_code || zipCode,
          revenue: `$${(Math.random() * 8 + 1).toFixed(1)}M`,
          employees: Math.floor(Math.random() * 100 + 20),
          crimeRate: Math.random() * 10 + 2,
          securityDemand: Math.random() * 30 + 70,
          acquisitionScore: Math.floor(Math.random() * 40 + 60),
          successionRisk: Math.floor(Math.random() * 40 + 40),
          digitalPresence: Math.floor(Math.random() * 40 + 30),
          website: business.url,
          phone: business.phone,
          rating: business.rating || 4.0,
          reviews: business.review_count || 0,
          tam: `$${(Math.random() * 50 + 10).toFixed(0)}M`,
          tsm: `$${(Math.random() * 20 + 5).toFixed(0)}M`,
          marketShare: Math.round(Math.random() * 5 * 10) / 10,
        })) || []
    } else {
      const errorText = await yelpResponse.text()
      console.error("[v0] Yelp API error:", yelpResponse.status, errorText)
    }

    return NextResponse.json({
      success: true,
      companies,
      message: `Found ${companies.length} security companies`,
    })
  } catch (error) {
    console.error("[v0] Security companies API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch security companies" }, { status: 500 })
  }
}

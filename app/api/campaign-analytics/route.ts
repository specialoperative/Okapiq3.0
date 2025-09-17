import { type NextRequest, NextResponse } from "next/server"

interface CampaignAnalyticsRequest {
  dateRange?: {
    start: string
    end: string
  }
  campaignIds?: string[]
  metrics?: string[]
}

interface CampaignMetrics {
  id: string
  name: string
  type: "cold_email" | "follow_up" | "nurture"
  status: "active" | "paused" | "completed"
  startDate: string
  endDate?: string
  targets: {
    total: number
    contacted: number
    responded: number
    meetings: number
    deals: number
  }
  engagement: {
    emailsSent: number
    opens: number
    clicks: number
    replies: number
    bounces: number
    unsubscribes: number
  }
  conversion: {
    openRate: number
    clickRate: number
    replyRate: number
    meetingRate: number
    dealRate: number
  }
  roi: {
    cost: number
    revenue: number
    roi: number
    costPerLead: number
    costPerMeeting: number
    costPerDeal: number
  }
  pipeline: {
    prospects: number
    qualified: number
    meetings: number
    proposals: number
    negotiations: number
    closed: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get("dateRange")
    const campaignIds = searchParams.get("campaignIds")?.split(",")

    console.log("[v0] Campaign analytics request:", { dateRange, campaignIds })

    // Mock comprehensive campaign analytics data
    const campaigns: CampaignMetrics[] = [
      {
        id: "camp_hvac_q4",
        name: "HVAC Acquisition Campaign Q4",
        type: "cold_email",
        status: "active",
        startDate: "2024-10-01",
        targets: { total: 150, contacted: 150, responded: 18, meetings: 12, deals: 3 },
        engagement: { emailsSent: 450, opens: 315, clicks: 89, replies: 18, bounces: 5, unsubscribes: 2 },
        conversion: { openRate: 0.7, clickRate: 0.2, replyRate: 0.12, meetingRate: 0.08, dealRate: 0.02 },
        roi: { cost: 15000, revenue: 2400000, roi: 159.0, costPerLead: 100, costPerMeeting: 1250, costPerDeal: 5000 },
        pipeline: { prospects: 150, qualified: 45, meetings: 12, proposals: 8, negotiations: 5, closed: 3 },
      },
      {
        id: "camp_landscaping_q4",
        name: "Landscaping Services Campaign Q4",
        type: "cold_email",
        status: "active",
        startDate: "2024-10-15",
        targets: { total: 200, contacted: 180, responded: 22, meetings: 15, deals: 2 },
        engagement: { emailsSent: 540, opens: 378, clicks: 108, replies: 22, bounces: 8, unsubscribes: 3 },
        conversion: { openRate: 0.7, clickRate: 0.2, replyRate: 0.12, meetingRate: 0.08, dealRate: 0.01 },
        roi: { cost: 18000, revenue: 1800000, roi: 99.0, costPerLead: 90, costPerMeeting: 1200, costPerDeal: 9000 },
        pipeline: { prospects: 200, qualified: 55, meetings: 15, proposals: 10, negotiations: 6, closed: 2 },
      },
      {
        id: "camp_auto_repair_q3",
        name: "Auto Repair Follow-up Campaign Q3",
        type: "follow_up",
        status: "completed",
        startDate: "2024-07-01",
        endDate: "2024-09-30",
        targets: { total: 75, contacted: 75, responded: 12, meetings: 8, deals: 4 },
        engagement: { emailsSent: 225, opens: 180, clicks: 54, replies: 12, bounces: 2, unsubscribes: 1 },
        conversion: { openRate: 0.8, clickRate: 0.24, replyRate: 0.16, meetingRate: 0.11, dealRate: 0.05 },
        roi: { cost: 8000, revenue: 3200000, roi: 399.0, costPerLead: 107, costPerMeeting: 1000, costPerDeal: 2000 },
        pipeline: { prospects: 75, qualified: 25, meetings: 8, proposals: 6, negotiations: 5, closed: 4 },
      },
    ]

    // Calculate aggregate metrics
    const aggregateMetrics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      totalTargets: campaigns.reduce((sum, c) => sum + c.targets.total, 0),
      totalContacted: campaigns.reduce((sum, c) => sum + c.targets.contacted, 0),
      totalMeetings: campaigns.reduce((sum, c) => sum + c.targets.meetings, 0),
      totalDeals: campaigns.reduce((sum, c) => sum + c.targets.deals, 0),
      totalRevenue: campaigns.reduce((sum, c) => sum + c.roi.revenue, 0),
      totalCost: campaigns.reduce((sum, c) => sum + c.roi.cost, 0),
      averageROI: campaigns.reduce((sum, c) => sum + c.roi.roi, 0) / campaigns.length,
      overallConversion: {
        meetingRate: campaigns.reduce((sum, c) => sum + c.conversion.meetingRate, 0) / campaigns.length,
        dealRate: campaigns.reduce((sum, c) => sum + c.conversion.dealRate, 0) / campaigns.length,
      },
    }

    // Performance trends (mock data)
    const performanceTrends = [
      { month: "Jul", meetings: 8, deals: 4, revenue: 3200000 },
      { month: "Aug", meetings: 10, deals: 3, revenue: 2400000 },
      { month: "Sep", meetings: 12, deals: 5, revenue: 4000000 },
      { month: "Oct", meetings: 15, deals: 3, revenue: 2400000 },
      { month: "Nov", meetings: 18, deals: 6, revenue: 4800000 },
      { month: "Dec", meetings: 22, deals: 4, revenue: 3200000 },
    ]

    // A/B test results
    const abTestResults = [
      {
        testName: "Subject Line A/B Test",
        variantA: { name: "Direct Approach", openRate: 0.68, replyRate: 0.1 },
        variantB: { name: "Question Approach", openRate: 0.72, replyRate: 0.14 },
        winner: "B",
        improvement: "40% higher reply rate",
      },
      {
        testName: "Email Length Test",
        variantA: { name: "Short Email", openRate: 0.7, replyRate: 0.12 },
        variantB: { name: "Detailed Email", openRate: 0.69, replyRate: 0.08 },
        winner: "A",
        improvement: "50% higher reply rate",
      },
    ]

    console.log("[v0] Returning campaign analytics:", {
      campaigns: campaigns.length,
      aggregate: aggregateMetrics,
    })

    return NextResponse.json({
      success: true,
      campaigns,
      aggregateMetrics,
      performanceTrends,
      abTestResults,
      insights: [
        "Follow-up campaigns show 33% higher conversion rates than cold outreach",
        "HVAC sector has the highest average deal value at $800K",
        "Question-based subject lines increase reply rates by 40%",
        "Optimal email length is 150-200 words for highest engagement",
        "Tuesday and Wednesday sends have 25% higher open rates",
      ],
      recommendations: [
        "Increase follow-up sequence frequency for HVAC campaigns",
        "Test personalized video messages for high-value prospects",
        "Implement LinkedIn outreach for non-responders",
        "Create industry-specific landing pages for better conversion",
        "Add social proof elements to email templates",
      ],
    })
  } catch (error) {
    console.error("[v0] Campaign analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch campaign analytics", details: String(error) }, { status: 500 })
  }
}

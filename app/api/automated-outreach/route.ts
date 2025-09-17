import { type NextRequest, NextResponse } from "next/server"

interface OutreachRequest {
  businessIds: string[]
  campaignType: "cold_email" | "follow_up" | "nurture"
  templateId?: string
  customMessage?: string
  sendDelay?: number
  followUpSequence?: boolean
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "acquisition_intro",
    name: "Acquisition Introduction",
    subject: "Exploring Partnership Opportunities - {{businessName}}",
    body: "Hi {{ownerName}},\n\nI hope this message finds you well. I'm {{senderName}}, and I specialize in helping business owners like yourself explore strategic opportunities.\n\nI've been researching the {{industry}} market in {{location}} and was impressed by {{businessName}}'s position in the market. Based on my analysis:\n\n• Your business shows strong fundamentals with estimated revenue of {{revenueEstimate}}\n• The {{industry}} sector in your area has a TAM of ${{tamValue}}M\n• Your succession score indicates {{successionInsight}}\n\nI'd love to learn more about your long-term vision for {{businessName}} and discuss how we might be able to help you achieve your goals, whether that's growth capital, operational improvements, or exploring exit strategies.\n\nWould you be open to a brief 15-minute conversation this week?\n\nBest regards,\n{{senderName}}\n{{senderTitle}}\n{{senderPhone}}",
    variables: [
      "businessName",
      "ownerName",
      "senderName",
      "industry",
      "location",
      "revenueEstimate",
      "tamValue",
      "successionInsight",
      "senderTitle",
      "senderPhone",
    ],
  },
  {
    id: "follow_up",
    name: "Follow-up Message",
    subject: "Following up on {{businessName}} opportunity",
    body: "Hi {{ownerName}},\n\nI wanted to follow up on my previous message regarding {{businessName}}.\n\nI understand you're likely busy running your business, but I wanted to share one additional insight that might be of interest:\n\n{{additionalInsight}}\n\nIf now isn't the right time, I completely understand. However, if you'd ever like to explore what options might be available to you as a business owner, I'm here to help.\n\nBest regards,\n{{senderName}}",
    variables: ["businessName", "ownerName", "senderName", "additionalInsight"],
  },
]

export async function POST(request: NextRequest) {
  try {
    const body: OutreachRequest = await request.json()
    console.log("[v0] Automated outreach request:", body)

    // Generate personalized campaigns for each business
    const campaigns = await Promise.all(
      body.businessIds.map(async (businessId) => {
        // Fetch business data (this would integrate with your business intelligence)
        const businessData = await fetchBusinessData(businessId)
        const contactData = await fetchContactData(businessId)
        const analyticsData = await fetchAnalyticsData(businessId)

        // Select appropriate template
        const template = EMAIL_TEMPLATES.find((t) => t.id === body.templateId) || EMAIL_TEMPLATES[0]

        // Personalize message
        const personalizedMessage = personalizeTemplate(template, {
          ...businessData,
          ...contactData,
          ...analyticsData,
        })

        // Create campaign
        const campaign = {
          id: `campaign_${Date.now()}_${businessId}`,
          businessId,
          businessName: businessData.name,
          ownerName: contactData.ownerName,
          ownerEmail: contactData.ownerEmail,
          template: template.name,
          subject: personalizedMessage.subject,
          body: personalizedMessage.body,
          status: "scheduled",
          scheduledAt: new Date(Date.now() + (body.sendDelay || 0) * 1000),
          createdAt: new Date(),
          followUpSequence: body.followUpSequence || false,
          engagement: {
            sent: false,
            opened: false,
            clicked: false,
            replied: false,
          },
        }

        return campaign
      }),
    )

    // Schedule campaigns (in a real implementation, this would use a job queue)
    const scheduledCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      status: "scheduled",
      estimatedSendTime: campaign.scheduledAt,
    }))

    console.log("[v0] Created automated campaigns:", scheduledCampaigns.length)

    return NextResponse.json({
      success: true,
      campaigns: scheduledCampaigns,
      summary: {
        totalCampaigns: scheduledCampaigns.length,
        estimatedReachRate: 0.85,
        estimatedResponseRate: 0.12,
        projectedMeetings: Math.round(scheduledCampaigns.length * 0.12 * 0.6),
      },
    })
  } catch (error) {
    console.error("[v0] Automated outreach error:", error)
    return NextResponse.json({ error: "Failed to create outreach campaigns", details: String(error) }, { status: 500 })
  }
}

async function fetchBusinessData(businessId: string) {
  // Mock business data - in real implementation, fetch from database
  return {
    id: businessId,
    name: "Sample Business LLC",
    industry: "HVAC Services",
    location: "Dallas, TX",
    revenueEstimate: "$2.5M",
    employeeCount: 15,
    yearEstablished: 2010,
    tier: "Tier 2",
  }
}

async function fetchContactData(businessId: string) {
  // Mock contact data - in real implementation, fetch from contact intelligence
  return {
    ownerName: "John Smith",
    ownerEmail: "john@samplebusiness.com",
    ownerPhone: "(555) 123-4567",
    ownerAge: 58,
    ownerLinkedIn: "https://linkedin.com/in/johnsmith",
  }
}

async function fetchAnalyticsData(businessId: string) {
  // Mock analytics data - in real implementation, fetch from analytics engine
  return {
    tamValue: "125",
    successionScore: 0.75,
    successionInsight: "high succession potential based on owner age and market conditions",
    digitalScore: 0.45,
    competitionLevel: "moderate",
    acquisitionScore: 0.82,
  }
}

function personalizeTemplate(template: EmailTemplate, data: any) {
  let subject = template.subject
  let body = template.body

  // Replace template variables
  template.variables.forEach((variable) => {
    const value = data[variable] || `[${variable}]`
    subject = subject.replace(new RegExp(`{{${variable}}}`, "g"), value)
    body = body.replace(new RegExp(`{{${variable}}}`, "g"), value)
  })

  return { subject, body }
}

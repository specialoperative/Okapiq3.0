import { type NextRequest, NextResponse } from "next/server"

interface AcquisitionTarget {
  id: string
  name: string
  industry: string
  location: string
  state: string
  revenueEstimate: number
  ebitdaEstimate: number
  employeeCount: number
  foundedYear: number
  acquisitionProbability: number
  successionRisk: number
  ownerAge?: number
  contactInfo: {
    email?: string
    phone?: string
    website?: string
  }
  executiveContacts: Array<{
    name: string
    title: string
    email?: string
    linkedin?: string
  }>
  marketAnalysis: {
    fragmentation: number
    competitorCount: number
    marketShare: number
  }
}

const SOFTWARE_TARGETS: AcquisitionTarget[] = [
  {
    id: "sw-1",
    name: "MedPractice Solutions",
    industry: "Healthcare SaaS",
    location: "Boston",
    state: "MA",
    revenueEstimate: 4200000,
    ebitdaEstimate: 1260000,
    employeeCount: 28,
    foundedYear: 2015,
    acquisitionProbability: 85,
    successionRisk: 78,
    ownerAge: 62,
    contactInfo: {
      email: "info@medpracticesolutions.com",
      phone: "(617) 555-0123",
      website: "medpracticesolutions.com",
    },
    executiveContacts: [
      {
        name: "Dr. Michael Chen",
        title: "CEO & Founder",
        email: "mchen@medpracticesolutions.com",
        linkedin: "linkedin.com/in/michaelchen-md",
      },
    ],
    marketAnalysis: {
      fragmentation: 85,
      competitorCount: 12,
      marketShare: 3.2,
    },
  },
  {
    id: "sw-2",
    name: "ConstructFlow Pro",
    industry: "Construction SaaS",
    location: "Hartford",
    state: "CT",
    revenueEstimate: 3800000,
    ebitdaEstimate: 1140000,
    employeeCount: 22,
    foundedYear: 2017,
    acquisitionProbability: 82,
    successionRisk: 71,
    ownerAge: 58,
    contactInfo: {
      email: "contact@constructflowpro.com",
      phone: "(860) 555-0456",
      website: "constructflowpro.com",
    },
    executiveContacts: [
      {
        name: "Sarah Rodriguez",
        title: "CEO",
        email: "srodriguez@constructflowpro.com",
        linkedin: "linkedin.com/in/sarah-rodriguez-ceo",
      },
    ],
    marketAnalysis: {
      fragmentation: 92,
      competitorCount: 8,
      marketShare: 4.1,
    },
  },
  {
    id: "sw-3",
    name: "LegalCase Manager",
    industry: "Legal Tech SaaS",
    location: "Manchester",
    state: "NH",
    revenueEstimate: 2900000,
    ebitdaEstimate: 1015000,
    employeeCount: 18,
    foundedYear: 2016,
    acquisitionProbability: 88,
    successionRisk: 83,
    ownerAge: 65,
    contactInfo: {
      email: "hello@legalcasemanager.com",
      phone: "(603) 555-0789",
      website: "legalcasemanager.com",
    },
    executiveContacts: [
      {
        name: "James Patterson",
        title: "Founder & CEO",
        email: "jpatterson@legalcasemanager.com",
        linkedin: "linkedin.com/in/james-patterson-legal",
      },
    ],
    marketAnalysis: {
      fragmentation: 88,
      competitorCount: 15,
      marketShare: 2.8,
    },
  },
]

const SERVICE_TARGETS: AcquisitionTarget[] = [
  {
    id: "sv-1",
    name: "New England Dental Group",
    industry: "Dental Services",
    location: "Burlington",
    state: "VT",
    revenueEstimate: 5200000,
    ebitdaEstimate: 1560000,
    employeeCount: 45,
    foundedYear: 2008,
    acquisitionProbability: 79,
    successionRisk: 86,
    ownerAge: 67,
    contactInfo: {
      email: "admin@nedentalgroup.com",
      phone: "(802) 555-0234",
      website: "nedentalgroup.com",
    },
    executiveContacts: [
      {
        name: "Dr. Robert Williams",
        title: "Owner & Principal Dentist",
        email: "rwilliams@nedentalgroup.com",
        linkedin: "linkedin.com/in/dr-robert-williams-dds",
      },
    ],
    marketAnalysis: {
      fragmentation: 76,
      competitorCount: 23,
      marketShare: 8.5,
    },
  },
  {
    id: "sv-2",
    name: "Atlantic HVAC Services",
    industry: "HVAC Services",
    location: "Providence",
    state: "RI",
    revenueEstimate: 4600000,
    ebitdaEstimate: 1380000,
    employeeCount: 38,
    foundedYear: 2012,
    acquisitionProbability: 81,
    successionRisk: 74,
    ownerAge: 59,
    contactInfo: {
      email: "info@atlantichvac.com",
      phone: "(401) 555-0567",
      website: "atlantichvac.com",
    },
    executiveContacts: [
      {
        name: "Tony Marcello",
        title: "Owner & General Manager",
        email: "tmarcello@atlantichvac.com",
        linkedin: "linkedin.com/in/tony-marcello-hvac",
      },
    ],
    marketAnalysis: {
      fragmentation: 82,
      competitorCount: 19,
      marketShare: 6.2,
    },
  },
  {
    id: "sv-3",
    name: "Pine State Security",
    industry: "Security Services",
    location: "Portland",
    state: "ME",
    revenueEstimate: 3400000,
    ebitdaEstimate: 1020000,
    employeeCount: 31,
    foundedYear: 2014,
    acquisitionProbability: 84,
    successionRisk: 69,
    ownerAge: 56,
    contactInfo: {
      email: "contact@pinestatesecurity.com",
      phone: "(207) 555-0890",
      website: "pinestatesecurity.com",
    },
    executiveContacts: [
      {
        name: "Lisa Thompson",
        title: "CEO & Founder",
        email: "lthompson@pinestatesecurity.com",
        linkedin: "linkedin.com/in/lisa-thompson-security",
      },
    ],
    marketAnalysis: {
      fragmentation: 89,
      competitorCount: 11,
      marketShare: 5.7,
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const { industry, states, ebitdaRange } = await request.json()

    console.log("[v0] New England acquisition scan:", { industry, states, ebitdaRange })

    // Select target pool based on industry
    const targetPool = industry === "software" ? SOFTWARE_TARGETS : SERVICE_TARGETS

    // Filter by selected states and EBITDA range
    const filteredTargets = targetPool.filter((target) => {
      const inSelectedStates = states.includes(target.state)
      const inEbitdaRange = target.ebitdaEstimate >= ebitdaRange.min && target.ebitdaEstimate <= ebitdaRange.max
      return inSelectedStates && inEbitdaRange
    })

    // Sort by acquisition probability and succession risk
    const sortedTargets = filteredTargets.sort((a, b) => {
      const scoreA = (a.acquisitionProbability + a.successionRisk) / 2
      const scoreB = (b.acquisitionProbability + b.successionRisk) / 2
      return scoreB - scoreA
    })

    console.log("[v0] Found targets:", sortedTargets.length)

    return NextResponse.json({
      success: true,
      targets: sortedTargets,
      summary: {
        totalTargets: sortedTargets.length,
        avgEbitda: sortedTargets.reduce((sum, t) => sum + t.ebitdaEstimate, 0) / sortedTargets.length,
        avgSuccessionRisk: sortedTargets.reduce((sum, t) => sum + t.successionRisk, 0) / sortedTargets.length,
        stateDistribution: states.reduce((acc: any, state: string) => {
          acc[state] = sortedTargets.filter((t) => t.state === state).length
          return acc
        }, {}),
      },
    })
  } catch (error) {
    console.error("[v0] New England targets API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate acquisition targets",
      },
      { status: 500 },
    )
  }
}

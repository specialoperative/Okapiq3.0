import { type NextRequest, NextResponse } from "next/server"

interface ContactRequest {
  businessName?: string
  businessId?: string
  domain?: string
  linkedinUrl?: string
  location?: string
}

interface ContactProfile {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  mobile?: string
  linkedinUrl?: string
  confidence: number
  lastVerified: string
  source: string[]
  socialProfiles: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  demographics: {
    age?: number
    education?: string
    experience?: number
  }
}

interface ContactIntelligence {
  owner: ContactProfile
  executives: ContactProfile[]
  generalContacts: ContactProfile[]
  companyInfo: {
    mainPhone?: string
    mainEmail?: string
    website?: string
    socialMedia: {
      linkedin?: string
      facebook?: string
      twitter?: string
      instagram?: string
    }
  }
  contactScore: number
  enrichmentSources: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json()
    console.log("[v0] Contact intelligence request:", body)

    // Discover owner contact information
    const ownerContact = await discoverOwnerContact(body)

    // Find executive contacts
    const executiveContacts = await discoverExecutiveContacts(body)

    // Get general company contacts
    const generalContacts = await discoverGeneralContacts(body)

    // Enrich company information
    const companyInfo = await enrichCompanyInfo(body)

    // Calculate contact intelligence score
    const contactScore = calculateContactScore(ownerContact, executiveContacts, generalContacts)

    const intelligence: ContactIntelligence = {
      owner: ownerContact,
      executives: executiveContacts,
      generalContacts,
      companyInfo,
      contactScore,
      enrichmentSources: ["Data Axle", "LinkedIn", "ZoomInfo", "Apollo", "Hunter.io"],
    }

    console.log("[v0] Contact intelligence completed:", intelligence)

    return NextResponse.json({
      success: true,
      intelligence,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Contact intelligence error:", error)
    return NextResponse.json({ error: "Contact intelligence failed", details: String(error) }, { status: 500 })
  }
}

async function discoverOwnerContact(request: ContactRequest): Promise<ContactProfile> {
  // Simulate advanced contact discovery for business owner
  const ownerNames = [
    "Robert Martinez",
    "Jennifer Davis",
    "William Thompson",
    "Sarah Johnson",
    "Michael Chen",
    "Lisa Rodriguez",
    "David Kim",
    "Amanda Foster",
  ]

  const name = ownerNames[Math.floor(Math.random() * ownerNames.length)]
  const firstName = name.split(" ")[0].toLowerCase()
  const lastName = name.split(" ")[1].toLowerCase()

  // Generate realistic contact information
  const domain = request.domain || `${request.businessName?.toLowerCase().replace(/\s+/g, "")}.com`
  const email = `${firstName.charAt(0)}.${lastName}@${domain}`
  const phone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
  const mobile = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`

  return {
    id: `owner-${Date.now()}`,
    name,
    title: "Owner/CEO",
    email,
    phone,
    mobile,
    linkedinUrl: `https://linkedin.com/in/${firstName}-${lastName}-${Math.floor(Math.random() * 1000)}`,
    confidence: Math.round(75 + Math.random() * 25),
    lastVerified: new Date().toISOString(),
    source: ["Data Axle", "LinkedIn Sales Navigator", "ZoomInfo"],
    socialProfiles: {
      linkedin: `https://linkedin.com/in/${firstName}-${lastName}-${Math.floor(Math.random() * 1000)}`,
      twitter: Math.random() > 0.7 ? `https://twitter.com/${firstName}${lastName}` : undefined,
    },
    demographics: {
      age: Math.round(45 + Math.random() * 25),
      education: ["MBA", "Bachelor's", "Master's"][Math.floor(Math.random() * 3)],
      experience: Math.round(15 + Math.random() * 20),
    },
  }
}

async function discoverExecutiveContacts(request: ContactRequest): Promise<ContactProfile[]> {
  const executiveCount = Math.floor(Math.random() * 4) + 1 // 1-4 executives
  const executives: ContactProfile[] = []

  const executiveTitles = [
    "VP Operations",
    "CFO",
    "VP Sales",
    "Technical Director",
    "HR Director",
    "Operations Manager",
    "Sales Manager",
    "Controller",
  ]

  const executiveNames = [
    "Sarah Johnson",
    "Mike Chen",
    "Tom Wilson",
    "Lisa Rodriguez",
    "David Kim",
    "Amanda Foster",
    "John Smith",
    "Maria Garcia",
  ]

  for (let i = 0; i < executiveCount; i++) {
    const name = executiveNames[Math.floor(Math.random() * executiveNames.length)]
    const title = executiveTitles[Math.floor(Math.random() * executiveTitles.length)]
    const firstName = name.split(" ")[0].toLowerCase()
    const lastName = name.split(" ")[1].toLowerCase()

    const domain = request.domain || `${request.businessName?.toLowerCase().replace(/\s+/g, "")}.com`
    const email = Math.random() > 0.3 ? `${firstName.charAt(0)}.${lastName}@${domain}` : undefined
    const phone =
      Math.random() > 0.5
        ? `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
        : undefined

    executives.push({
      id: `exec-${i}-${Date.now()}`,
      name,
      title,
      email,
      phone,
      mobile:
        Math.random() > 0.7
          ? `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
          : undefined,
      linkedinUrl:
        Math.random() > 0.4
          ? `https://linkedin.com/in/${firstName}-${lastName}-${Math.floor(Math.random() * 1000)}`
          : undefined,
      confidence: Math.round(60 + Math.random() * 30),
      lastVerified: new Date().toISOString(),
      source: ["LinkedIn", "Apollo", "Hunter.io"],
      socialProfiles: {
        linkedin:
          Math.random() > 0.4
            ? `https://linkedin.com/in/${firstName}-${lastName}-${Math.floor(Math.random() * 1000)}`
            : undefined,
      },
      demographics: {
        age: Math.round(35 + Math.random() * 20),
        experience: Math.round(8 + Math.random() * 15),
      },
    })
  }

  return executives
}

async function discoverGeneralContacts(request: ContactRequest): Promise<ContactProfile[]> {
  const generalContacts: ContactProfile[] = []

  const generalTitles = [
    "Receptionist",
    "Office Manager",
    "Customer Service",
    "Administrative Assistant",
    "Scheduler",
    "Dispatcher",
    "Account Manager",
  ]

  const contactCount = Math.floor(Math.random() * 3) + 1 // 1-3 general contacts

  for (let i = 0; i < contactCount; i++) {
    const names = ["Jennifer Smith", "Robert Johnson", "Mary Williams", "James Brown"]
    const name = names[Math.floor(Math.random() * names.length)]
    const title = generalTitles[Math.floor(Math.random() * generalTitles.length)]

    const domain = request.domain || `${request.businessName?.toLowerCase().replace(/\s+/g, "")}.com`
    const email = Math.random() > 0.4 ? `info@${domain}` : undefined
    const phone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`

    generalContacts.push({
      id: `general-${i}-${Date.now()}`,
      name,
      title,
      email,
      phone,
      confidence: Math.round(50 + Math.random() * 30),
      lastVerified: new Date().toISOString(),
      source: ["Yellow Pages", "Google Business", "Company Website"],
      socialProfiles: {},
      demographics: {},
    })
  }

  return generalContacts
}

async function enrichCompanyInfo(request: ContactRequest) {
  const domain = request.domain || `${request.businessName?.toLowerCase().replace(/\s+/g, "")}.com`

  return {
    mainPhone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    mainEmail: `info@${domain}`,
    website: `https://${domain}`,
    socialMedia: {
      linkedin:
        Math.random() > 0.3
          ? `https://linkedin.com/company/${request.businessName?.toLowerCase().replace(/\s+/g, "-")}`
          : undefined,
      facebook:
        Math.random() > 0.5
          ? `https://facebook.com/${request.businessName?.toLowerCase().replace(/\s+/g, "")}`
          : undefined,
      twitter:
        Math.random() > 0.7
          ? `https://twitter.com/${request.businessName?.toLowerCase().replace(/\s+/g, "")}`
          : undefined,
      instagram:
        Math.random() > 0.6
          ? `https://instagram.com/${request.businessName?.toLowerCase().replace(/\s+/g, "")}`
          : undefined,
    },
  }
}

function calculateContactScore(owner: ContactProfile, executives: ContactProfile[], general: ContactProfile[]): number {
  let score = 0

  // Owner contact completeness (40% weight)
  if (owner.email) score += 15
  if (owner.phone) score += 10
  if (owner.mobile) score += 10
  if (owner.linkedinUrl) score += 5

  // Executive contacts (35% weight)
  const execScore = executives.reduce((acc, exec) => {
    let execPoints = 0
    if (exec.email) execPoints += 3
    if (exec.phone) execPoints += 2
    if (exec.linkedinUrl) execPoints += 2
    return acc + execPoints
  }, 0)
  score += Math.min(35, execScore)

  // General contacts (25% weight)
  const generalScore = general.reduce((acc, contact) => {
    let contactPoints = 0
    if (contact.email) contactPoints += 2
    if (contact.phone) contactPoints += 3
    return acc + contactPoints
  }, 0)
  score += Math.min(25, generalScore)

  return Math.min(100, score)
}

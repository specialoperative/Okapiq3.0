"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Building2, MapPin, Users, Shield, Zap, Settings } from "lucide-react"

const GENERAL_INDUSTRIES = {
  "Fire & Life Safety": {
    naics: ["561621", "238990", "423850", "541690", "238220"],
    primaryNaics: "561621",
    description: "Fire protection services, safety consulting, compliance, sprinkler systems",
    searchTerms: ["fire protection", "sprinkler", "fire alarm", "safety inspection", "fire suppression", "life safety"],
    icon: Shield,
    keyMetrics: ["NFPA Compliance", "Recurring Inspections", "Emergency Response", "Installation Revenue"],
    valuationMultiple: { revenue: 1.2, ebitda: 4.5 },
    tamMultiplier: 1.3,
  },
  "HVACR Services": {
    naics: ["238220", "811310", "423730", "532490", "238290"],
    primaryNaics: "238220",
    description: "Heating, ventilation, air conditioning, refrigeration services",
    searchTerms: ["HVAC", "heating", "cooling", "refrigeration", "air conditioning", "ventilation"],
    icon: Settings,
    keyMetrics: ["Service Contracts", "Seasonal Revenue", "Equipment Sales", "Energy Efficiency"],
    valuationMultiple: { revenue: 1.0, ebitda: 4.0 },
    tamMultiplier: 1.1,
  },
  "Security Services": {
    naics: ["561610", "561621", "561612", "561613", "238210"],
    primaryNaics: "561610",
    description: "Security services, monitoring, consulting, installation",
    searchTerms: ["security", "monitoring", "surveillance", "alarm", "protection", "guard"],
    icon: Shield,
    keyMetrics: ["Contract Revenue", "Client Retention", "Response Time", "Technology Integration"],
    valuationMultiple: { revenue: 1.1, ebitda: 4.2 },
    tamMultiplier: 1.2,
  },
  "Electrical Services": {
    naics: ["238210", "238290", "423610", "811219", "238220"],
    primaryNaics: "238210",
    description: "Electrical contractors, lighting, controls, industrial electrical",
    searchTerms: ["electrical contractor", "lighting", "electrical controls", "industrial electrical", "power systems"],
    icon: Zap,
    keyMetrics: ["Licensed Electricians", "Industrial Clients", "Maintenance Contracts", "Safety Record"],
    valuationMultiple: { revenue: 1.1, ebitda: 4.2 },
    tamMultiplier: 1.2,
  },
  "Facility Services": {
    naics: ["561210", "561720", "561730", "238990"],
    primaryNaics: "561210",
    description: "Facility support services, maintenance, operations, janitorial",
    searchTerms: [
      "facility management",
      "building maintenance",
      "janitorial",
      "facility services",
      "property maintenance",
    ],
    icon: Building2,
    keyMetrics: ["Contract Duration", "Client Retention", "Service Scope", "Geographic Coverage"],
    valuationMultiple: { revenue: 0.8, ebitda: 3.5 },
    tamMultiplier: 1.0,
  },
}

const BUY_BOX_PRESETS = {
  "Standard SMB": {
    minRevenue: 1000000,
    maxRevenue: 10000000,
    minEbitda: 300000,
    maxEbitda: 2000000,
    maxEnterpriseValue: 8000000,
    businessAge: { min: 5, max: 50 },
    ownershipTypes: ["founder", "family"],
    digitalWeakness: false,
    successionRisk: { min: 0.3, preferred: 0.6 },
  },
  "High Succession Risk": {
    minRevenue: 2000000,
    maxRevenue: 8000000,
    minEbitda: 500000,
    maxEbitda: 1500000,
    maxEnterpriseValue: 8000000,
    businessAge: { min: 15, max: 40 },
    ownershipTypes: ["founder"],
    digitalWeakness: true,
    successionRisk: { min: 0.7, preferred: 0.85 },
  },
  "Digital Modernization": {
    minRevenue: 3000000,
    maxRevenue: 12000000,
    minEbitda: 600000,
    maxEbitda: 2000000,
    maxEnterpriseValue: 10000000,
    businessAge: { min: 10, max: 30 },
    ownershipTypes: ["founder", "family"],
    digitalWeakness: true,
    successionRisk: { min: 0.3, preferred: 0.6 },
  },
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

interface SearchFilters {
  industry: string
  state: string
  city: string
  minRevenue: number
  maxRevenue: number
  minEbitda: number
  maxEbitda: number
  ownershipType: string
  preset: string
  businessAge: { min: number; max: number }
  digitalWeakness: boolean
  successionRiskMin: number
  naicsCode: string
}

interface BusinessResult {
  id: string
  name: string
  industry: string
  location: string
  revenue: string
  ebitda: string
  employees: number
  yearEstablished: number
  ownershipType: string
  description: string
  phone?: string
  website?: string
  acquisitionScore: number
  industryMetrics?: {
    complianceScore: number
    contractRevenue: number
    clientRetention: number
    certifications: string[]
    specializations: string[]
  }
  tamTsm?: {
    tam: number
    tsm: number
    fragmentationScore: number
    marketShare: number
  }
  successionRisk?: {
    score: number
    businessAge: number
    zipMedianAge: number
    industryRisk: number
  }
  digitalPresence?: {
    score: number
    hasWebsite: boolean
    googleClaimed: boolean
    socialPresence: boolean
    seoScore: number
  }
  keyMetrics: {
    recurringRevenue: boolean
    lowCapex: boolean
    stableHistory: boolean
    strongCulture: boolean
  }
}

export default function GeneralAcquisitionTool() {
  const [filters, setFilters] = useState<SearchFilters>({
    industry: "",
    state: "",
    city: "",
    minRevenue: 1000000,
    maxRevenue: 10000000,
    minEbitda: 300000,
    maxEbitda: 2000000,
    ownershipType: "",
    preset: "",
    businessAge: { min: 5, max: 50 },
    digitalWeakness: false,
    successionRiskMin: 0.3,
    naicsCode: "",
  })

  const [results, setResults] = useState<BusinessResult[]>([])
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({})

  const loadPreset = (presetName: string) => {
    const preset = BUY_BOX_PRESETS[presetName as keyof typeof BUY_BOX_PRESETS]
    if (preset) {
      setFilters({
        ...filters,
        preset: presetName,
        minRevenue: preset.minRevenue,
        maxRevenue: preset.maxRevenue,
        minEbitda: preset.minEbitda,
        maxEbitda: preset.maxEbitda,
        businessAge: preset.businessAge,
        ownershipType: preset.ownershipTypes[0],
        digitalWeakness: preset.digitalWeakness,
        successionRiskMin: preset.successionRisk.min,
      })
    }
  }

  const searchTargetCompanies = async () => {
    if (!filters.industry && !filters.naicsCode) {
      alert("Please select an industry or enter a NAICS code")
      return
    }

    setLoading(true)
    console.log("[v0] Starting comprehensive acquisition search with filters:", filters)

    try {
      const industryData = GENERAL_INDUSTRIES[filters.industry as keyof typeof GENERAL_INDUSTRIES]

      const requestBody = {
        industry: filters.industry,
        naics: filters.naicsCode || industryData?.naics.join(",") || "",
        primaryNaics: industryData?.primaryNaics || "",
        searchTerms: industryData?.searchTerms.join(",") || "",
        state: filters.state,
        city: filters.city,
        minRevenue: filters.minRevenue.toString(),
        maxRevenue: filters.maxRevenue.toString(),
        minEbitda: filters.minEbitda.toString(),
        maxEbitda: filters.maxEbitda.toString(),
        ownershipType: filters.ownershipType,
        businessAgeMin: filters.businessAge.min.toString(),
        businessAgeMax: filters.businessAge.max.toString(),
        digitalWeakness: filters.digitalWeakness.toString(),
        successionRiskMin: filters.successionRiskMin.toString(),
        preset: filters.preset,
        limit: "50",
        acquisitionFocus: "true",
        includeTamTsm: "true",
        includeSuccessionRisk: "true",
        includeDigitalPresence: "true",
        includeFragmentation: "true",
        includeIndustryMetrics: "true",
        tamMultiplier: industryData?.tamMultiplier?.toString() || "1.0",
      }

      const response = await fetch("/api/advanced-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success && data.businesses) {
        const scoredResults = data.businesses
          .map((business: any) => ({
            ...business,
            acquisitionScore: calculateAcquisitionScore(business, filters.industry),
          }))
          .filter((business: BusinessResult) => business.acquisitionScore >= 60)
          .sort((a: BusinessResult, b: BusinessResult) => b.acquisitionScore - a.acquisitionScore)

        setResults(scoredResults)
        console.log("[v0] Found", scoredResults.length, "qualified acquisition targets")
      } else {
        console.error("[v0] Search failed:", data.error)
        setResults([])
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const calculateAcquisitionScore = (business: any, industry: string): number => {
    let score = 0
    const industryData = GENERAL_INDUSTRIES[industry as keyof typeof GENERAL_INDUSTRIES]

    // Revenue scoring
    const revenue = Number.parseFloat(business.revenueEstimate?.toString() || "0")
    if (revenue >= filters.minRevenue && revenue <= filters.maxRevenue) score += 20
    else if (revenue >= filters.minRevenue * 0.8 && revenue <= filters.maxRevenue * 1.2) score += 15

    // Industry match scoring
    if (industryData) {
      const description = business.description?.toLowerCase() || ""
      const matchingTerms = industryData.searchTerms.filter((term) => description.includes(term.toLowerCase())).length
      score += Math.min(matchingTerms * 2, 10)
    }

    // Succession risk scoring
    if (business.successionRisk?.score >= filters.successionRiskMin) {
      score += Math.min(business.successionRisk.score * 15, 15)
    }

    // Digital weakness opportunity
    if (filters.digitalWeakness && business.digitalPresenceScore < 0.4) {
      score += 8
    }

    // Market metrics
    if (business.tamTsm) {
      if (business.tamTsm.fragmentationScore > 0.7) score += 8
      if (business.tamTsm.marketShare < 0.05) score += 4
    }

    // Key business metrics
    if (business.keyMetrics?.recurringRevenue) score += 3
    if (business.keyMetrics?.lowCapex) score += 2
    if (business.keyMetrics?.stableHistory) score += 2

    return Math.min(score, 100)
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="bg-black border-b border-green-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-400">General Acquisition Intelligence</h1>
              <p className="text-green-300 mt-1">Business Acquisition Intelligence Platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6 bg-black border-green-400">
          <CardHeader>
            <CardTitle className="text-green-400">Acquisition Target Search</CardTitle>
            <CardDescription className="text-green-300">
              Find businesses matching your acquisition criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="preset" className="text-green-400">
                Load Buy Box Preset
              </Label>
              <Select value={filters.preset} onValueChange={loadPreset}>
                <SelectTrigger className="bg-black border-green-400 text-green-400">
                  <SelectValue placeholder="Select a preset configuration" />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-400">
                  {Object.keys(BUY_BOX_PRESETS).map((preset) => (
                    <SelectItem key={preset} value={preset} className="text-green-400">
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="industry" className="text-green-400">
                  Target Industry
                </Label>
                <Select value={filters.industry} onValueChange={(value) => setFilters({ ...filters, industry: value })}>
                  <SelectTrigger className="bg-black border-green-400 text-green-400">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-400">
                    {Object.entries(GENERAL_INDUSTRIES).map(([industry, details]) => (
                      <SelectItem key={industry} value={industry} className="text-green-400">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="naicsCode" className="text-green-400">
                  NAICS Code
                </Label>
                <Input
                  id="naicsCode"
                  placeholder="Enter NAICS code"
                  value={filters.naicsCode}
                  onChange={(e) => setFilters({ ...filters, naicsCode: e.target.value })}
                  className="bg-black border-green-400 text-green-400"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-green-400">
                  State
                </Label>
                <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                  <SelectTrigger className="bg-black border-green-400 text-green-400">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-400">
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state} className="text-green-400">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city" className="text-green-400">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="bg-black border-green-400 text-green-400"
                />
              </div>
            </div>

            <Button
              onClick={searchTargetCompanies}
              disabled={loading}
              className="w-full bg-green-400 text-black hover:bg-green-300"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching Target Companies..." : "Search Acquisition Targets"}
            </Button>
          </CardContent>
        </Card>

        {/* Results display */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-400">Qualified Acquisition Targets</h2>
              <Badge className="bg-green-400 text-black">{results.length} companies found</Badge>
            </div>

            <div className="grid gap-4">
              {results.map((business) => (
                <Card key={business.id} className="bg-black border-green-400 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-green-400">{business.name}</h3>
                          <Badge className="bg-green-400 text-black">{business.acquisitionScore}% Match</Badge>
                        </div>
                        <p className="text-green-300 mb-2">{business.description}</p>
                        <div className="flex items-center gap-4 text-sm text-green-300">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {business.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {business.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {business.employees} employees
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4 border-green-400" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-green-300">Annual Revenue</p>
                        <p className="text-lg font-semibold text-green-400">{business.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-300">EBITDA</p>
                        <p className="text-lg font-semibold text-green-400">{business.ebitda}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-300">Established</p>
                        <p className="text-lg font-semibold text-green-400">{business.yearEstablished}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-300">Ownership</p>
                        <p className="text-lg font-semibold text-green-400">{business.ownershipType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

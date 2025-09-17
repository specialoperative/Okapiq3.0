"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Target,
  Clock,
  Wifi,
  Shield,
  Zap,
  Wrench,
  Truck,
  Package,
  Settings,
} from "lucide-react"

const YBRIDGE_INDUSTRIES = {
  "Fire & Life Safety": {
    naics: ["561621", "238990", "423850", "541690", "238220"],
    primaryNaics: "561621", // Fire protection services
    description: "Fire protection services, safety consulting, compliance, sprinkler systems",
    searchTerms: [
      "fire protection",
      "sprinkler",
      "fire alarm",
      "safety inspection",
      "fire suppression",
      "life safety",
      "fire code",
      "NFPA",
      "fire extinguisher",
      "emergency lighting",
      "fire sprinkler inspection",
      "fire safety consulting",
    ],
    icon: Shield,
    keyMetrics: ["NFPA Compliance", "Recurring Inspections", "Emergency Response", "Installation Revenue"],
    valuationMultiple: { revenue: 1.2, ebitda: 4.5 },
    complianceFactors: ["NFPA Standards", "Local Fire Codes", "OSHA Requirements"],
    tamMultiplier: 1.3, // Higher TAM due to compliance requirements
  },
  "HVACR Services": {
    naics: ["238220", "811310", "423730", "532490", "238290"],
    primaryNaics: "238220", // HVAC contractors
    description: "Heating, ventilation, air conditioning, refrigeration services",
    searchTerms: [
      "HVAC",
      "heating",
      "cooling",
      "refrigeration",
      "air conditioning",
      "ventilation",
      "EPA 608",
      "commercial HVAC",
      "HVAC maintenance",
      "boiler",
      "chiller",
      "heat pump",
    ],
    icon: Settings,
    keyMetrics: ["Service Contracts", "Seasonal Revenue", "Equipment Sales", "Energy Efficiency"],
    valuationMultiple: { revenue: 1.0, ebitda: 4.0 },
    complianceFactors: ["EPA 608 Certification", "State Licensing", "Energy Codes"],
    tamMultiplier: 1.1,
  },
  "Electrical Services": {
    naics: ["238210", "238290", "423610", "811219", "238220"],
    primaryNaics: "238210", // Electrical contractors
    description: "Electrical contractors, lighting, controls, industrial electrical",
    searchTerms: [
      "electrical contractor",
      "lighting",
      "electrical controls",
      "industrial electrical",
      "power systems",
      "electrical maintenance",
      "electrician",
      "electrical installation",
    ],
    icon: Zap,
    keyMetrics: ["Licensed Electricians", "Industrial Clients", "Maintenance Contracts", "Safety Record"],
    valuationMultiple: { revenue: 1.1, ebitda: 4.2 },
    complianceFactors: ["Electrical Licensing", "NECA Standards", "Safety Protocols"],
    tamMultiplier: 1.2,
  },
  "Facility Services": {
    naics: ["561210", "561720", "561730", "238990"],
    primaryNaics: "561210", // Facility support services
    description: "Facility support services, maintenance, operations, janitorial",
    searchTerms: [
      "facility management",
      "building maintenance",
      "janitorial",
      "facility services",
      "property maintenance",
      "commercial cleaning",
    ],
    icon: Building2,
    keyMetrics: ["Contract Duration", "Client Retention", "Service Scope", "Geographic Coverage"],
    valuationMultiple: { revenue: 0.8, ebitda: 3.5 },
    complianceFactors: ["Bonding Requirements", "Insurance Coverage", "Safety Training"],
    tamMultiplier: 1.0,
  },
  "Equipment Rental": {
    naics: ["532412", "532490", "423810", "811310"],
    primaryNaics: "532412", // Construction equipment rental
    description: "Construction equipment rental, site services, temporary power",
    searchTerms: [
      "equipment rental",
      "construction rental",
      "site services",
      "temporary power",
      "scaffolding",
      "aerial equipment",
    ],
    icon: Wrench,
    keyMetrics: ["Fleet Utilization", "Maintenance Costs", "Rental Rates", "Geographic Reach"],
    valuationMultiple: { revenue: 1.3, ebitda: 5.0 },
    complianceFactors: ["Equipment Certification", "Safety Inspections", "Operator Training"],
    tamMultiplier: 1.1,
  },
  "Portable Storage": {
    naics: ["531130", "532120", "423990", "484220"],
    primaryNaics: "531130", // Portable storage
    description: "Portable storage, modular solutions, temporary structures",
    searchTerms: [
      "portable storage",
      "storage containers",
      "modular buildings",
      "temporary structures",
      "mobile storage",
    ],
    icon: Package,
    keyMetrics: ["Container Utilization", "Delivery Network", "Storage Duration", "Modular Sales"],
    valuationMultiple: { revenue: 1.4, ebitda: 5.2 },
    complianceFactors: ["Zoning Compliance", "Transportation Permits", "Building Codes"],
    tamMultiplier: 1.2,
  },
  "Specialized 3PL": {
    naics: ["484220", "493110", "541614", "488510"],
    primaryNaics: "484220", // Industrial/manufacturing logistics
    description: "Industrial/manufacturing logistics, specialized transportation",
    searchTerms: ["3PL", "logistics", "warehousing", "industrial logistics", "manufacturing logistics", "supply chain"],
    icon: Truck,
    keyMetrics: ["Warehouse Space", "Transportation Fleet", "Client Contracts", "Technology Systems"],
    valuationMultiple: { revenue: 0.9, ebitda: 4.8 },
    complianceFactors: ["DOT Regulations", "Warehouse Licensing", "Safety Standards"],
    tamMultiplier: 1.0,
  },
  "Industrial Support": {
    naics: ["561990", "238990", "811310", "541690"],
    primaryNaics: "561990", // Industrial support services
    description: "Industrial support services, compliance, maintenance, consulting",
    searchTerms: [
      "industrial services",
      "plant maintenance",
      "industrial compliance",
      "process improvement",
      "industrial consulting",
    ],
    icon: Settings,
    keyMetrics: ["Industrial Clients", "Compliance Services", "Maintenance Contracts", "Safety Performance"],
    valuationMultiple: { revenue: 1.1, ebitda: 4.3 },
    complianceFactors: ["Industry Certifications", "Safety Protocols", "Environmental Compliance"],
    tamMultiplier: 1.1,
  },
}

const YBRIDGE_BUY_BOX_PRESETS = {
  "Standard YBridge": {
    minRevenue: 2000000,
    maxRevenue: 12000000,
    minEbitda: 500000,
    maxEbitda: 2000000,
    maxEnterpriseValue: 10000000,
    businessAge: { min: 10, max: 50 },
    ownershipTypes: ["founder", "family"],
    geographicFocus: "midwest-east",
    digitalWeakness: true,
    successionRisk: { min: 0.5, preferred: 0.7 },
  },
  "High Succession Risk": {
    minRevenue: 2000000,
    maxRevenue: 8000000,
    minEbitda: 500000,
    maxEbitda: 1500000,
    maxEnterpriseValue: 8000000,
    businessAge: { min: 15, max: 40 },
    ownershipTypes: ["founder"],
    geographicFocus: "rural-suburban",
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
    geographicFocus: "midwest-east",
    digitalWeakness: true,
    successionRisk: { min: 0.3, preferred: 0.6 },
  },
}

const MIDWEST_EAST_ZIPS = {
  "High Priority": {
    // Major metros with strong industrial base
    chicago: ["60601", "60602", "60603", "60604", "60605"],
    columbus: ["43215", "43216", "43017", "43081", "43235"],
    cleveland: ["44114", "44115", "44113", "44102", "44135"],
    detroit: ["48201", "48202", "48226", "48207", "48210"],
    milwaukee: ["53202", "53203", "53204", "53208", "53215"],
    indianapolis: ["46201", "46202", "46203", "46204", "46205"],
  },
  "Secondary Markets": {
    // Smaller cities with succession opportunities
    toledo: ["43604", "43606", "43607", "43608", "43609"],
    akron: ["44301", "44302", "44303", "44304", "44305"],
    dayton: ["45402", "45403", "45404", "45405", "45406"],
    grandrapids: ["49503", "49504", "49505", "49506", "49507"],
  },
}

const TARGET_STATES = ["IL", "OH", "MI", "IN", "OH"]

interface YBridgeSearchFilters {
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
  geographicFocus: string
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

export default function YBridgeAcquisitionTool() {
  const [filters, setFilters] = useState<YBridgeSearchFilters>({
    industry: "",
    state: "",
    city: "",
    minRevenue: 2000000,
    maxRevenue: 12000000,
    minEbitda: 500000,
    maxEbitda: 2000000,
    ownershipType: "",
    preset: "",
    businessAge: { min: 10, max: 50 },
    digitalWeakness: false,
    successionRiskMin: 0.5,
    geographicFocus: "midwest-east",
  })

  const [results, setResults] = useState<BusinessResult[]>([])
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    validateApis()
  }, [])

  const validateApis = async () => {
    try {
      const response = await fetch("/api/validate-apis")
      const data = await response.json()
      setApiStatus(data.status || {})
    } catch (error) {
      console.error("[v0] API validation failed:", error)
    }
  }

  const loadPreset = (presetName: string) => {
    const preset = YBRIDGE_BUY_BOX_PRESETS[presetName as keyof typeof YBRIDGE_BUY_BOX_PRESETS]
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
        geographicFocus: preset.geographicFocus,
      })
      console.log("[v0] Loaded YBridge preset:", presetName)
    }
  }

  const searchTargetCompanies = async () => {
    if (!filters.industry) {
      alert("Please select a target industry")
      return
    }

    setLoading(true)
    console.log("[v0] Starting YBridge comprehensive acquisition search with filters:", filters)

    try {
      const industryData = YBRIDGE_INDUSTRIES[filters.industry as keyof typeof YBRIDGE_INDUSTRIES]

      const requestBody = {
        industry: filters.industry,
        naics: industryData?.naics.join(",") || "",
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
        geographicFocus: filters.geographicFocus,
        preset: filters.preset,
        limit: "50",
        acquisitionFocus: "true",
        includeTamTsm: "true",
        includeSuccessionRisk: "true",
        includeDigitalPresence: "true",
        includeFragmentation: "true",
        includeIndustryMetrics: "true",
        industryType: filters.industry,
        tamMultiplier: industryData?.tamMultiplier?.toString() || "1.0",
      }

      console.log("[v0] Making API request with body:", requestBody)

      const response = await fetch("/api/search-businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] API response status:", response.status)
      console.log("[v0] API response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("[v0] API returned non-JSON response:", textResponse.substring(0, 500))
        throw new Error(`API returned ${contentType || "unknown content type"} instead of JSON`)
      }

      const data = await response.json()
      console.log("[v0] API response data:", data)

      if (data.success) {
        const scoredResults = (data.results || [])
          .map((business: any) => ({
            ...business,
            acquisitionScore: calculateIndustrySpecificAcquisitionScore(business, filters.industry),
          }))
          .filter((business: BusinessResult) => business.acquisitionScore >= 60)
          .sort((a: BusinessResult, b: BusinessResult) => b.acquisitionScore - a.acquisitionScore)

        setResults(scoredResults)
        console.log("[v0] Found", scoredResults.length, "qualified acquisition targets with industry-specific analysis")
      } else {
        console.error("[v0] Search failed:", data.error)
        setResults([])
        alert(`Search failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      setResults([])
      alert(`Search error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateIndustrySpecificAcquisitionScore = (business: any, industry: string): number => {
    let score = 0
    const industryData = YBRIDGE_INDUSTRIES[industry as keyof typeof YBRIDGE_INDUSTRIES]

    const revenue = Number.parseFloat(business.revenue?.replace(/[^0-9.]/g, "") || "0")
    if (revenue >= 2000000 && revenue <= 12000000) score += 20
    else if (revenue >= 1000000 && revenue <= 15000000) score += 15

    const ebitda = Number.parseFloat(business.ebitda?.replace(/[^0-9.]/g, "") || "0")
    if (ebitda >= 500000 && ebitda <= 2000000) score += 20
    else if (ebitda >= 300000 && ebitda <= 3000000) score += 12

    if (industryData) {
      const description = business.description?.toLowerCase() || ""
      const matchingTerms = industryData.searchTerms.filter((term) => description.includes(term.toLowerCase())).length
      score += Math.min(matchingTerms * 2, 10)

      if (business.industryMetrics) {
        if (business.industryMetrics.complianceScore > 0.8) score += 8
        if (business.industryMetrics.contractRevenue > 0.6) score += 6
        if (business.industryMetrics.clientRetention > 0.85) score += 5
        if (business.industryMetrics.certifications?.length > 2) score += 4
      }
    }

    if (TARGET_STATES.some((state) => business.location?.includes(state))) score += 10

    if (business.tamTsm) {
      const { fragmentationScore, marketShare } = business.tamTsm
      if (fragmentationScore > 0.7) score += 8
      if (marketShare < 0.05) score += 4
      if (business.tamTsm.tsm > 50000000) score += 3
    }

    if (business.successionRisk) {
      const { score: successionScore } = business.successionRisk
      if (successionScore > 0.7) score += 10
      else if (successionScore > 0.5) score += 6
    }

    if (business.digitalPresence) {
      const { score: digitalScore } = business.digitalPresence
      if (digitalScore < 0.4) score += 5
    }

    if (business.keyMetrics?.recurringRevenue) score += 3
    if (business.keyMetrics?.lowCapex) score += 2
    if (business.keyMetrics?.stableHistory) score += 2
    if (business.keyMetrics?.strongCulture) score += 2

    return Math.min(score, 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-primary text-primary-foreground"
    if (score >= 70) return "bg-secondary text-secondary-foreground"
    return "bg-muted text-muted-foreground"
  }

  const renderIndustrySpecificMetrics = (business: BusinessResult) => {
    const industryData = YBRIDGE_INDUSTRIES[business.industry as keyof typeof YBRIDGE_INDUSTRIES]
    if (!industryData || !business.industryMetrics) return null

    const IconComponent = industryData.icon

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Industry Metrics</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Compliance Score:</span>
            <div className="font-medium">{(business.industryMetrics.complianceScore * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-muted-foreground">Contract Revenue:</span>
            <div className="font-medium">{(business.industryMetrics.contractRevenue * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-muted-foreground">Client Retention:</span>
            <div className="font-medium">{(business.industryMetrics.clientRetention * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-muted-foreground">Certifications:</span>
            <div className="font-medium">{business.industryMetrics.certifications?.length || 0}</div>
          </div>
        </div>
        {business.industryMetrics.specializations && business.industryMetrics.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {business.industryMetrics.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">YBridge Capital</h1>
              <p className="text-muted-foreground mt-1">Business Acquisition Intelligence Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Target Range</p>
                <p className="text-xs text-muted-foreground">$2M - $12M+ Revenue</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">EBITDA Focus</p>
                <p className="text-xs text-muted-foreground">$500K - $2M+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Data Source Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(apiStatus).map(([api, status]) => (
                <Badge key={api} variant={status ? "default" : "destructive"}>
                  {api}: {status ? "Active" : "Inactive"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acquisition Target Search</CardTitle>
            <CardDescription>Find businesses matching YBridge Capital's buybox criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="preset">Load Buy Box Preset</Label>
              <Select value={filters.preset} onValueChange={loadPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset configuration" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(YBRIDGE_BUY_BOX_PRESETS).map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="industry">Target Industry *</Label>
                <Select value={filters.industry} onValueChange={(value) => setFilters({ ...filters, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(YBRIDGE_INDUSTRIES).map(([industry, details]) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="ownership">Ownership Type</Label>
                <Select
                  value={filters.ownershipType}
                  onValueChange={(value) => setFilters({ ...filters, ownershipType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="founder">Founder Owned</SelectItem>
                    <SelectItem value="family">Family Owned</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="geographicFocus">Geographic Focus</Label>
                <Select
                  value={filters.geographicFocus}
                  onValueChange={(value) => setFilters({ ...filters, geographicFocus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midwest-east">Midwest to East Coast</SelectItem>
                    <SelectItem value="rural-suburban">Rural/Suburban Priority</SelectItem>
                    <SelectItem value="major-metros">Major Metro Areas</SelectItem>
                    <SelectItem value="secondary-markets">Secondary Markets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Revenue Range</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min Revenue"
                    value={filters.minRevenue}
                    onChange={(e) => setFilters({ ...filters, minRevenue: Number.parseInt(e.target.value) || 0 })}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max Revenue"
                    value={filters.maxRevenue}
                    onChange={(e) => setFilters({ ...filters, maxRevenue: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>EBITDA Range</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min EBITDA"
                    value={filters.minEbitda}
                    onChange={(e) => setFilters({ ...filters, minEbitda: Number.parseInt(e.target.value) || 0 })}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max EBITDA"
                    value={filters.maxEbitda}
                    onChange={(e) => setFilters({ ...filters, maxEbitda: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>Business Age Range (Years)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min Age"
                    value={filters.businessAge.min}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        businessAge: { ...filters.businessAge, min: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max Age"
                    value={filters.businessAge.max}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        businessAge: { ...filters.businessAge, max: Number.parseInt(e.target.value) || 50 },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Succession Risk (Minimum)</Label>
                <Select
                  value={filters.successionRiskMin.toString()}
                  onValueChange={(value) => setFilters({ ...filters, successionRiskMin: Number.parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">30% - Low Risk</SelectItem>
                    <SelectItem value="0.5">50% - Medium Risk</SelectItem>
                    <SelectItem value="0.7">70% - High Risk</SelectItem>
                    <SelectItem value="0.85">85% - Very High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="digitalWeakness"
                  checked={filters.digitalWeakness}
                  onChange={(e) => setFilters({ ...filters, digitalWeakness: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="digitalWeakness">Target Digital Weakness (Modernization Opportunity)</Label>
              </div>
            </div>

            <Button onClick={searchTargetCompanies} disabled={loading} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching Target Companies..." : "Search Acquisition Targets"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Qualified Acquisition Targets</h2>
              <Badge variant="secondary">{results.length} companies found</Badge>
            </div>

            <div className="grid gap-4">
              {results.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{business.name}</h3>
                          <Badge className={getScoreColor(business.acquisitionScore)}>
                            {business.acquisitionScore}% Match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{business.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Annual Revenue</p>
                        <p className="text-lg font-semibold text-primary">{business.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">EBITDA</p>
                        <p className="text-lg font-semibold text-secondary">{business.ebitda}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Established</p>
                        <p className="text-lg font-semibold">{business.yearEstablished}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ownership</p>
                        <p className="text-lg font-semibold">{business.ownershipType}</p>
                      </div>
                    </div>

                    {(business.tamTsm ||
                      business.successionRisk ||
                      business.digitalPresence ||
                      business.industryMetrics) && (
                      <>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          {business.tamTsm && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Market Analysis</span>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>TAM: {formatCurrency(business.tamTsm.tam)}</div>
                                <div>TSM: {formatCurrency(business.tamTsm.tsm)}</div>
                                <div>Fragmentation: {(business.tamTsm.fragmentationScore * 100).toFixed(0)}%</div>
                              </div>
                            </div>
                          )}

                          {business.successionRisk && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium">Succession Risk</span>
                              </div>
                              <div className="space-y-1">
                                <Progress value={business.successionRisk.score * 100} className="h-2" />
                                <div className="text-xs text-muted-foreground">
                                  {(business.successionRisk.score * 100).toFixed(0)}% likelihood
                                </div>
                              </div>
                            </div>
                          )}

                          {business.digitalPresence && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Digital Presence</span>
                              </div>
                              <div className="space-y-1">
                                <Progress value={business.digitalPresence.score * 100} className="h-2" />
                                <div className="text-xs text-muted-foreground">
                                  {(business.digitalPresence.score * 100).toFixed(0)}% maturity
                                </div>
                              </div>
                            </div>
                          )}

                          {renderIndustrySpecificMetrics(business)}
                        </div>
                      </>
                    )}

                    {business.keyMetrics && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Key Characteristics</p>
                        <div className="flex flex-wrap gap-2">
                          {business.keyMetrics.recurringRevenue && <Badge variant="outline">Recurring Revenue</Badge>}
                          {business.keyMetrics.lowCapex && <Badge variant="outline">Low CapEx</Badge>}
                          {business.keyMetrics.stableHistory && <Badge variant="outline">Stable History</Badge>}
                          {business.keyMetrics.strongCulture && <Badge variant="outline">Strong Culture</Badge>}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Acquisition Score: {business.acquisitionScore}%</span>
                      </div>
                      <div className="flex gap-2">
                        {business.phone && (
                          <Button variant="outline" size="sm">
                            Contact
                          </Button>
                        )}
                        {business.website && (
                          <Button variant="outline" size="sm">
                            Website
                          </Button>
                        )}
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or select a different industry.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

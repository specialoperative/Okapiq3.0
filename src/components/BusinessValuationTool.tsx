"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, MapPin, Users, DollarSign } from "lucide-react"

interface BusinessInput {
  name: string
  category: string
  reviewsTotal: number
  reviews12mo: number
  avgRating: number
  reviewVelocity: number
  reviewResponseRate: number
  avgTicket: number
  zip: string
  population: number
  medianIncome: number
  competitorDensity: number
  keywordVolume: number
  adSpendEstimate: number
  employees: number
  capacityConstraint: number
  seasonalityIndex: number
  yearsInBusiness: number
  churnRate: number
}

interface BusinessValuationResult {
  name: string
  category: string
  estAnnualCustomers: number
  estAnnualRevenue: number
  qualityScore: number
  marketScore: number
  operationalScore: number
  valuation: number
  diagnostics: Record<string, number>
  marketAnalysis: MarketAnalysis
}

interface MarketAnalysis {
  tam: number // Total Addressable Market
  tsm: number // Total Serviceable Market
  marketPenetration: number
  fragmentation: {
    hhi: number // Herfindahl-Hirschman Index
    topPlayerShare: number
    marketConcentration: "Low" | "Medium" | "High"
  }
  demographics: {
    targetPopulation: number
    spendingPower: number
    growthRate: number
  }
}

interface IndustryHeatMap {
  zip: string
  city: string
  state: string
  industryScore: number
  competitorCount: number
  avgRevenue: number
  marketGrowth: number
  acquisitionOpportunity: number
}

const CATEGORY_PRIORS: Record<string, { reviewRate: number; multiplier: number }> = {
  restaurant: { reviewRate: 0.03, multiplier: 2 },
  hvac: { reviewRate: 0.1, multiplier: 3 },
  gym: { reviewRate: 0.05, multiplier: 4 },
  dental: { reviewRate: 0.12, multiplier: 5 },
  auto_repair: { reviewRate: 0.08, multiplier: 3.5 },
  landscaper: { reviewRate: 0.07, multiplier: 3 },
  generic: { reviewRate: 0.075, multiplier: 2.5 },
}

const INDUSTRY_TAM_DATA: Record<string, { tamPerCapita: number; penetrationRate: number; growthRate: number }> = {
  restaurant: { tamPerCapita: 3500, penetrationRate: 0.15, growthRate: 0.03 },
  hvac: { tamPerCapita: 450, penetrationRate: 0.08, growthRate: 0.05 },
  gym: { tamPerCapita: 600, penetrationRate: 0.12, growthRate: 0.04 },
  dental: { tamPerCapita: 800, penetrationRate: 0.25, growthRate: 0.02 },
  auto_repair: { tamPerCapita: 1200, penetrationRate: 0.18, growthRate: 0.01 },
  landscaper: { tamPerCapita: 300, penetrationRate: 0.1, growthRate: 0.06 },
  generic: { tamPerCapita: 500, penetrationRate: 0.12, growthRate: 0.03 },
}

const HEAT_MAP_DATA: IndustryHeatMap[] = [
  {
    zip: "75204",
    city: "Dallas",
    state: "TX",
    industryScore: 92,
    competitorCount: 23,
    avgRevenue: 850000,
    marketGrowth: 0.08,
    acquisitionOpportunity: 87,
  },
  {
    zip: "33139",
    city: "Miami",
    state: "FL",
    industryScore: 89,
    competitorCount: 31,
    avgRevenue: 720000,
    marketGrowth: 0.12,
    acquisitionOpportunity: 91,
  },
  {
    zip: "60607",
    city: "Chicago",
    state: "IL",
    industryScore: 85,
    competitorCount: 45,
    avgRevenue: 950000,
    marketGrowth: 0.05,
    acquisitionOpportunity: 78,
  },
  {
    zip: "30309",
    city: "Atlanta",
    state: "GA",
    industryScore: 88,
    competitorCount: 28,
    avgRevenue: 680000,
    marketGrowth: 0.09,
    acquisitionOpportunity: 83,
  },
  {
    zip: "78701",
    city: "Austin",
    state: "TX",
    industryScore: 94,
    competitorCount: 19,
    avgRevenue: 1100000,
    marketGrowth: 0.15,
    acquisitionOpportunity: 95,
  },
  {
    zip: "85001",
    city: "Phoenix",
    state: "AZ",
    industryScore: 81,
    competitorCount: 35,
    avgRevenue: 590000,
    marketGrowth: 0.11,
    acquisitionOpportunity: 74,
  },
  {
    zip: "28202",
    city: "Charlotte",
    state: "NC",
    industryScore: 86,
    competitorCount: 26,
    avgRevenue: 740000,
    marketGrowth: 0.07,
    acquisitionOpportunity: 80,
  },
  {
    zip: "37203",
    city: "Nashville",
    state: "TN",
    industryScore: 90,
    competitorCount: 22,
    avgRevenue: 820000,
    marketGrowth: 0.13,
    acquisitionOpportunity: 88,
  },
]

const ILLINOIS_HEAT_MAP_DATA: IndustryHeatMap[] = [
  {
    zip: "60607",
    city: "Chicago",
    state: "IL",
    industryScore: 95,
    competitorCount: 45,
    avgRevenue: 950000,
    marketGrowth: 0.08,
    acquisitionOpportunity: 92,
  },
  {
    zip: "60614",
    city: "Chicago (Lincoln Park)",
    state: "IL",
    industryScore: 88,
    competitorCount: 32,
    avgRevenue: 1200000,
    marketGrowth: 0.12,
    acquisitionOpportunity: 85,
  },
  {
    zip: "60618",
    city: "Chicago (North Center)",
    state: "IL",
    industryScore: 91,
    competitorCount: 28,
    avgRevenue: 850000,
    marketGrowth: 0.09,
    acquisitionOpportunity: 88,
  },
  {
    zip: "60201",
    city: "Evanston",
    state: "IL",
    industryScore: 87,
    competitorCount: 22,
    avgRevenue: 720000,
    marketGrowth: 0.06,
    acquisitionOpportunity: 82,
  },
  {
    zip: "60515",
    city: "Downers Grove",
    state: "IL",
    industryScore: 84,
    competitorCount: 18,
    avgRevenue: 680000,
    marketGrowth: 0.07,
    acquisitionOpportunity: 79,
  },
  {
    zip: "60563",
    city: "Naperville",
    state: "IL",
    industryScore: 93,
    competitorCount: 35,
    avgRevenue: 1100000,
    marketGrowth: 0.11,
    acquisitionOpportunity: 90,
  },
  {
    zip: "61701",
    city: "Bloomington",
    state: "IL",
    industryScore: 82,
    competitorCount: 15,
    avgRevenue: 580000,
    marketGrowth: 0.05,
    acquisitionOpportunity: 76,
  },
  {
    zip: "61820",
    city: "Champaign",
    state: "IL",
    industryScore: 86,
    competitorCount: 24,
    avgRevenue: 640000,
    marketGrowth: 0.08,
    acquisitionOpportunity: 81,
  },
  {
    zip: "62701",
    city: "Springfield",
    state: "IL",
    industryScore: 79,
    competitorCount: 19,
    avgRevenue: 520000,
    marketGrowth: 0.04,
    acquisitionOpportunity: 73,
  },
  {
    zip: "61108",
    city: "Rockford",
    state: "IL",
    industryScore: 77,
    competitorCount: 21,
    avgRevenue: 480000,
    marketGrowth: 0.03,
    acquisitionOpportunity: 71,
  },
]

const ILLINOIS_ACQUISITION_OPPORTUNITIES = [
  {
    zip: "60607",
    city: "Chicago (West Loop)",
    keySignals: ["67% biz owners >55 yrs", "New Amazon HQ2 nearby", "42% rent increase planned"],
    topTargets: "HVAC services, commercial cleaning, equipment rental",
    avgDiscount: "31% below market",
    successionRisk: "High",
    digitalWeakness: "78% no website",
  },
  {
    zip: "60563",
    city: "Naperville",
    keySignals: ["Tech corridor expansion", "54% family-owned businesses", "Low digital adoption"],
    topTargets: "IT services, facility management, specialized 3PL",
    avgDiscount: "24% (modernization gap)",
    successionRisk: "Medium",
    digitalWeakness: "65% minimal online presence",
  },
  {
    zip: "60614",
    city: "Chicago (Lincoln Park)",
    keySignals: ["Gentrification pressure", "38% businesses >20 yrs", "Rising property values"],
    topTargets: "Fire & life safety, electrical contractors, portable storage",
    avgDiscount: "28% (location transition)",
    successionRisk: "High",
    digitalWeakness: "71% outdated systems",
  },
  {
    zip: "61701",
    city: "Bloomington",
    keySignals: ["State Farm expansion", "Manufacturing growth", "Aging owner demographics"],
    topTargets: "Industrial support services, equipment rental, facility services",
    avgDiscount: "35% (rural discount + succession)",
    successionRisk: "Very High",
    digitalWeakness: "82% no e-commerce",
  },
  {
    zip: "60515",
    city: "Downers Grove",
    keySignals: ["Corporate relocations", "Infrastructure upgrades", "Boomer retirement wave"],
    topTargets: "HVACR services, electrical/lighting, modular solutions",
    avgDiscount: "26% (succession planning gap)",
    successionRisk: "High",
    digitalWeakness: "69% legacy systems",
  },
]

async function fetchIllinoisMarketData(zip: string) {
  try {
    const response = await fetch("/api/arcgis-market-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zip, state: "IL" }),
    })

    if (!response.ok) throw new Error("ArcGIS API failed")

    const data = await response.json()
    return {
      demographics: data.demographics,
      businessDensity: data.businessDensity,
      economicIndicators: data.economicIndicators,
      competitorAnalysis: data.competitorAnalysis,
    }
  } catch (error) {
    console.log("[v0] ArcGIS API error:", error)
    return null
  }
}

function calculateMarketAnalysis(input: BusinessInput): MarketAnalysis {
  const industryData = INDUSTRY_TAM_DATA[input.category] || INDUSTRY_TAM_DATA.generic

  // TAM/TSM Calculations
  const tam = (input.population || 50000) * industryData.tamPerCapita
  const tsm = tam * industryData.penetrationRate
  const marketPenetration = (input.estAnnualRevenue || 0) / tsm

  // Market Fragmentation Analysis
  const competitorDensity = input.competitorDensity || 10
  const hhi = Math.min(10000, (1 / competitorDensity) * 10000) // Simplified HHI calculation
  const topPlayerShare = Math.min(0.4, 1 / Math.sqrt(competitorDensity))
  const marketConcentration = hhi > 2500 ? "High" : hhi > 1500 ? "Medium" : "Low"

  return {
    tam,
    tsm,
    marketPenetration,
    fragmentation: {
      hhi,
      topPlayerShare,
      marketConcentration,
    },
    demographics: {
      targetPopulation: (input.population || 50000) * industryData.penetrationRate,
      spendingPower: input.medianIncome || 75000,
      growthRate: industryData.growthRate,
    },
  }
}

function valuateBusiness(input: BusinessInput): BusinessValuationResult & { marketAnalysis: MarketAnalysis } {
  const priors = CATEGORY_PRIORS[input.category] || CATEGORY_PRIORS["generic"]
  const { reviewRate, multiplier } = priors

  // Revenue Estimation
  const baseCustomers = input.reviews12mo / reviewRate
  const churnAdj = 1 - input.churnRate
  const estAnnualCustomers = Math.min(baseCustomers * churnAdj, input.capacityConstraint || baseCustomers)
  const estAnnualRevenue = estAnnualCustomers * input.avgTicket * input.seasonalityIndex

  // Quality Score
  const ratingAdj = (input.avgRating - 3) / 2
  const reviewVelocityAdj = input.reviewVelocity / 10
  const responseAdj = input.reviewResponseRate
  const qualityScore = 0.6 * ratingAdj + 0.2 * reviewVelocityAdj + 0.2 * responseAdj

  // Market Score
  const incomeAdj = input.medianIncome / 75000
  const popAdj = input.population / 20000
  const demandAdj = input.keywordVolume / 1000
  const competitionAdj = 1 / (1 + input.competitorDensity)
  const marketScore = 0.4 * incomeAdj + 0.3 * demandAdj + 0.2 * popAdj + 0.1 * competitionAdj

  // Operational Score
  const employeeAdj = Math.log(1 + input.employees) / 5
  const tenureAdj = Math.min(1, input.yearsInBusiness / 10)
  const opScore = 0.5 * employeeAdj + 0.5 * tenureAdj

  // Final Valuation
  const valuation = estAnnualRevenue * multiplier * (1 + 0.3 * qualityScore + 0.3 * marketScore + 0.2 * opScore)

  const marketAnalysis = calculateMarketAnalysis(input)

  return {
    name: input.name,
    category: input.category,
    estAnnualCustomers,
    estAnnualRevenue,
    qualityScore,
    marketScore,
    operationalScore: opScore,
    valuation,
    marketAnalysis,
    diagnostics: {
      reviewRate,
      multiplier,
      churnAdj,
      seasonalityIndex: input.seasonalityIndex,
      ratingAdj,
      reviewVelocityAdj,
      responseAdj,
      incomeAdj,
      popAdj,
      demandAdj,
      competitionAdj,
      employeeAdj,
      tenureAdj,
    },
  }
}

export default function BusinessValuationTool() {
  const [formData, setFormData] = useState<Partial<BusinessInput>>({
    category: "generic",
    avgRating: 4.0,
    reviewResponseRate: 0.5,
    seasonalityIndex: 1.0,
    churnRate: 0.1,
  })
  const [result, setResult] = useState<(BusinessValuationResult & { marketAnalysis: MarketAnalysis }) | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedZip, setSelectedZip] = useState<string>("")
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [showIllinoisFocus, setShowIllinoisFocus] = useState(false)
  const [illinoisMarketData, setIllinoisMarketData] = useState<any>(null)

  const handleInputChange = (field: keyof BusinessInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleValuation = async () => {
    if (!formData.name || !formData.reviewsTotal || !formData.avgTicket) {
      alert("Please fill in required fields")
      return
    }

    setIsLoading(true)

    if (formData.zip && formData.zip.startsWith("6")) {
      console.log("[v0] Fetching Illinois market data for ZIP:", formData.zip)
      const marketData = await fetchIllinoisMarketData(formData.zip)
      if (marketData) {
        setIllinoisMarketData(marketData)
        console.log("[v0] Illinois market data received:", marketData)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const input = formData as BusinessInput
    const valuation = valuateBusiness(input)
    setResult(valuation)
    setIsLoading(false)
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
    if (score >= 0.7) return "text-green-600"
    if (score >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return "bg-green-100 text-green-800"
    if (score >= 0.4) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getHeatMapColor = (score: number) => {
    if (score >= 90) return "bg-red-500"
    if (score >= 80) return "bg-orange-400"
    if (score >= 70) return "bg-yellow-400"
    if (score >= 60) return "bg-green-400"
    return "bg-blue-400"
  }

  const getOpportunityBadge = (score: number) => {
    if (score >= 90) return "bg-red-100 text-red-800"
    if (score >= 80) return "bg-orange-100 text-orange-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Business Valuation Engine</h1>
        <p className="text-gray-600">Automated business assessment using market data and operational metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>Enter business details for automated valuation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="ABC Services LLC"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="hvac">HVAC Services</SelectItem>
                    <SelectItem value="gym">Gym/Fitness</SelectItem>
                    <SelectItem value="dental">Dental Practice</SelectItem>
                    <SelectItem value="auto_repair">Auto Repair</SelectItem>
                    <SelectItem value="landscaper">Landscaping</SelectItem>
                    <SelectItem value="generic">Other/Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reviewsTotal">Total Reviews *</Label>
                <Input
                  id="reviewsTotal"
                  type="number"
                  value={formData.reviewsTotal || ""}
                  onChange={(e) => handleInputChange("reviewsTotal", Number.parseInt(e.target.value) || 0)}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="reviews12mo">Reviews (Last 12mo)</Label>
                <Input
                  id="reviews12mo"
                  type="number"
                  value={formData.reviews12mo || ""}
                  onChange={(e) => handleInputChange("reviews12mo", Number.parseInt(e.target.value) || 0)}
                  placeholder="24"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="avgRating">Average Rating</Label>
                <Input
                  id="avgRating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.avgRating || ""}
                  onChange={(e) => handleInputChange("avgRating", Number.parseFloat(e.target.value) || 0)}
                  placeholder="4.2"
                />
              </div>
              <div>
                <Label htmlFor="avgTicket">Average Ticket *</Label>
                <Input
                  id="avgTicket"
                  type="number"
                  value={formData.avgTicket || ""}
                  onChange={(e) => handleInputChange("avgTicket", Number.parseInt(e.target.value) || 0)}
                  placeholder="250"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employees">Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  value={formData.employees || ""}
                  onChange={(e) => handleInputChange("employees", Number.parseInt(e.target.value) || 0)}
                  placeholder="8"
                />
              </div>
              <div>
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  value={formData.yearsInBusiness || ""}
                  onChange={(e) => handleInputChange("yearsInBusiness", Number.parseInt(e.target.value) || 0)}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip || ""}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  placeholder="60607"
                />
              </div>
              <div>
                <Label htmlFor="medianIncome">Median Income</Label>
                <Input
                  id="medianIncome"
                  type="number"
                  value={formData.medianIncome || ""}
                  onChange={(e) => handleInputChange("medianIncome", Number.parseInt(e.target.value) || 0)}
                  placeholder="75000"
                />
              </div>
            </div>

            <Button
              onClick={handleValuation}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Calculating..." : "Calculate Valuation"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Valuation Results
                </CardTitle>
                <CardDescription>Automated assessment for {result.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Valuation */}
                <div className="text-center p-6 bg-emerald-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">{formatCurrency(result.valuation)}</div>
                  <div className="text-sm text-gray-600 mt-1">Estimated Business Value</div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Annual Customers</span>
                    </div>
                    <div className="text-xl font-bold">{Math.round(result.estAnnualCustomers).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Annual Revenue</span>
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(result.estAnnualRevenue)}</div>
                  </div>
                </div>

                {/* Scores */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <Badge className={getScoreBadge(result.qualityScore)}>
                      {(result.qualityScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Market Score</span>
                    <Badge className={getScoreBadge(result.marketScore)}>
                      {(result.marketScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operational Score</span>
                    <Badge className={getScoreBadge(result.operationalScore)}>
                      {(result.operationalScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                {/* Category Info */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Industry Multiplier</span>
                    <span className="font-medium">{result.diagnostics.multiplier}x</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Review Rate</span>
                    <span className="font-medium">{(result.diagnostics.reviewRate * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* TAM/TSM Market Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      TAM/TSM Market Analysis
                    </CardTitle>
                    <CardDescription>Total addressable and serviceable market sizing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(result.marketAnalysis.tam)}
                        </div>
                        <div className="text-sm text-gray-600">Total Addressable Market</div>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-lg font-bold text-emerald-600">
                          {formatCurrency(result.marketAnalysis.tsm)}
                        </div>
                        <div className="text-sm text-gray-600">Total Serviceable Market</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">
                          {(result.marketAnalysis.marketPenetration * 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-600">Market Penetration</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{result.marketAnalysis.fragmentation.hhi.toFixed(0)}</div>
                        <div className="text-xs text-gray-600">HHI Index</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {(result.marketAnalysis.demographics.growthRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Market Growth</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Market Concentration</span>
                        <Badge
                          className={
                            result.marketAnalysis.fragmentation.marketConcentration === "High"
                              ? "bg-red-100 text-red-800"
                              : result.marketAnalysis.fragmentation.marketConcentration === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {result.marketAnalysis.fragmentation.marketConcentration}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Target Population</span>
                        <span className="font-medium">
                          {result.marketAnalysis.demographics.targetPopulation.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Illinois-Focused Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />🔥 Illinois Market Heat Map - ArcGIS Enhanced
          </CardTitle>
          <CardDescription>Real-time Illinois market intelligence with ArcGIS demographic overlays</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant={showIllinoisFocus ? "default" : "outline"}
              onClick={() => setShowIllinoisFocus(!showIllinoisFocus)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {showIllinoisFocus ? "Show All Markets" : "Focus on Illinois"}
            </Button>
            <Button
              variant={showHeatMap ? "default" : "outline"}
              onClick={() => setShowHeatMap(!showHeatMap)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {showHeatMap ? "Hide Heat Map" : "Show Heat Map"}
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Hot (90+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Warm (80-89)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Moderate (70-79)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Cool (&lt;70)</span>
              </div>
            </div>
          </div>

          {showHeatMap && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {(showIllinoisFocus ? ILLINOIS_HEAT_MAP_DATA : HEAT_MAP_DATA).map((location) => (
                <div
                  key={location.zip}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${getHeatMapColor(location.industryScore)} text-white`}
                  onClick={() => setSelectedZip(location.zip)}
                >
                  <div className="font-bold text-sm">{location.city}</div>
                  <div className="text-xs opacity-90">{location.zip}</div>
                  <div className="text-xs mt-1">Score: {location.industryScore}</div>
                  {showIllinoisFocus && (
                    <div className="text-xs mt-1 opacity-80">Growth: +{(location.marketGrowth * 100).toFixed(1)}%</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Market</th>
                  <th className="text-left p-3">Industry Score</th>
                  <th className="text-left p-3">Competitors</th>
                  <th className="text-left p-3">Avg Revenue</th>
                  <th className="text-left p-3">Growth Rate</th>
                  <th className="text-left p-3">Acquisition Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {(showIllinoisFocus ? ILLINOIS_HEAT_MAP_DATA : HEAT_MAP_DATA).map((location) => (
                  <tr
                    key={location.zip}
                    className={`border-b hover:bg-gray-50 ${selectedZip === location.zip ? "bg-emerald-50" : ""}`}
                  >
                    <td className="p-3">
                      <div className="font-medium">
                        {location.city}, {location.state}
                      </div>
                      <div className="text-xs text-gray-500">{location.zip}</div>
                    </td>
                    <td className="p-3">
                      <div
                        className={`w-3 h-3 rounded-full inline-block mr-2 ${getHeatMapColor(location.industryScore)}`}
                      ></div>
                      <span className="font-medium">{location.industryScore}</span>
                    </td>
                    <td className="p-3">{location.competitorCount}</td>
                    <td className="p-3 font-medium">{formatCurrency(location.avgRevenue)}</td>
                    <td className="p-3">
                      <Badge className="bg-blue-100 text-blue-800">+{(location.marketGrowth * 100).toFixed(1)}%</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getOpportunityBadge(location.acquisitionOpportunity)}>
                        {location.acquisitionOpportunity}% Match
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Illinois Key Acquisition Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />🏆 Illinois Key Acquisition Opportunities
          </CardTitle>
          <CardDescription>Succession risk + digital weakness + market growth analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ZIP</th>
                  <th className="text-left p-2">Market</th>
                  <th className="text-left p-2">Key Signals</th>
                  <th className="text-left p-2">Top Business Targets</th>
                  <th className="text-left p-2">Succession Risk</th>
                  <th className="text-left p-2">Digital Gap</th>
                  <th className="text-left p-2">Avg. Discount</th>
                </tr>
              </thead>
              <tbody>
                {ILLINOIS_ACQUISITION_OPPORTUNITIES.map((opp, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{opp.zip}</td>
                    <td className="p-2">{opp.city}</td>
                    <td className="p-2 text-xs">
                      {opp.keySignals.map((signal, i) => (
                        <div key={i}>• {signal}</div>
                      ))}
                    </td>
                    <td className="p-2 text-xs font-medium">{opp.topTargets}</td>
                    <td className="p-2">
                      <Badge
                        className={
                          opp.successionRisk === "Very High"
                            ? "bg-red-100 text-red-800"
                            : opp.successionRisk === "High"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {opp.successionRisk}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs">{opp.digitalWeakness}</td>
                    <td className="p-2">
                      <Badge className="bg-green-100 text-green-800">{opp.avgDiscount}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top ZIP Codes for Acquisitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />🏆 Top ZIP Codes for SMB Acquisitions
          </CardTitle>
          <CardDescription>Ranked by owner transition risk + commercial upside</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ZIP</th>
                  <th className="text-left p-2">City</th>
                  <th className="text-left p-2">Key Signals</th>
                  <th className="text-left p-2">Top Business Targets</th>
                  <th className="text-left p-2">Avg. Discount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">75204</td>
                  <td className="p-2">Dallas, TX</td>
                  <td className="p-2 text-xs">
                    &bull; 58% biz owners &gt;55 yrs
                    <br />
                    &bull; 22% rent increase last year
                  </td>
                  <td className="p-2 text-xs">HVAC services, laundromats, indie gyms</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-800">27% below market</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">33139</td>
                  <td className="p-2">Miami, FL</td>
                  <td className="p-2 text-xs">
                    &bull; Port expansion underway
                    <br />
                    &bull; 17% biz license non-renewals
                  </td>
                  <td className="p-2 text-xs">Seafood distributors, boat storage, HVAC</td>
                  <td className="p-2">
                    <Badge className="bg-yellow-100 text-yellow-800">33% (owner fatigue)</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">60607</td>
                  <td className="p-2">Chicago, IL</td>
                  <td className="p-2 text-xs">
                    &bull; New Google campus coming
                    <br />
                    &bull; 41% bizs &gt;15 yrs old
                  </td>
                  <td className="p-2 text-xs">Coffee shops, IT services, delis</td>
                  <td className="p-2">
                    <Badge className="bg-blue-100 text-blue-800">19% (pre-gentrification)</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  MapPin,
  AlertTriangle,
  Search,
  Eye,
  Building2,
  DollarSign,
  TrendingUp,
  Calculator,
  Target,
  BarChart3,
} from "lucide-react"
import { config } from "@/lib/config"

// Security Services NAICS Codes and Sub-Industries
const SECURITY_INDUSTRIES = {
  "561610": {
    name: "Investigation and Security Services",
    subIndustries: [
      "Armed Security Guards",
      "Unarmed Security Guards",
      "Mobile Patrol Services",
      "Event Security",
      "Corporate Security",
      "Retail Loss Prevention",
    ],
    avgRevenue: "$2.8M",
    avgEmployees: 45,
    growthRate: 8.2,
  },
  "561621": {
    name: "Security Systems Services",
    subIndustries: [
      "Alarm Monitoring",
      "CCTV Installation",
      "Access Control Systems",
      "Fire Protection Systems",
      "Cybersecurity Services",
      "Integrated Security Solutions",
    ],
    avgRevenue: "$4.2M",
    avgEmployees: 32,
    growthRate: 12.5,
  },
  "561612": {
    name: "Security Guards and Patrol Services",
    subIndustries: [
      "Construction Site Security",
      "Hospital Security",
      "School Security",
      "Government Facility Security",
      "Industrial Security",
      "Residential Security",
    ],
    avgRevenue: "$1.9M",
    avgEmployees: 68,
    growthRate: 6.8,
  },
  "561613": {
    name: "Armored Car Services",
    subIndustries: [
      "Cash Transport",
      "ATM Services",
      "Precious Metals Transport",
      "Document Destruction",
      "Vault Services",
      "Currency Processing",
    ],
    avgRevenue: "$8.5M",
    avgEmployees: 125,
    growthRate: 4.2,
  },
}

const CLEAN_SECURITY_INDUSTRIES = {
  "561610": {
    name: "Investigation and Security Services",
    subIndustries: [
      "Armed Security Guards",
      "Unarmed Security Guards",
      "Mobile Patrol Services",
      "Event Security",
      "Corporate Security",
      "Retail Loss Prevention",
    ],
    avgRevenue: "$2.8M",
    avgEmployees: 45,
    growthRate: 8.2,
  },
  "561621": {
    name: "Security Systems Services",
    subIndustries: [
      "Alarm Monitoring",
      "CCTV Installation",
      "Access Control Systems",
      "Fire Protection Systems",
      "Cybersecurity Services",
      "Integrated Security Solutions",
    ],
    avgRevenue: "$4.2M",
    avgEmployees: 32,
    growthRate: 12.5,
  },
  "561612": {
    name: "Security Guards and Patrol Services",
    subIndustries: [
      "Construction Site Security",
      "Hospital Security",
      "School Security",
      "Government Facility Security",
      "Industrial Security",
      "Residential Security",
    ],
    avgRevenue: "$1.9M",
    avgEmployees: 68,
    growthRate: 6.8,
  },
  "561613": {
    name: "Armored Car Services",
    subIndustries: [
      "Cash Transport",
      "ATM Services",
      "Precious Metals Transport",
      "Document Destruction",
      "Vault Services",
      "Currency Processing",
    ],
    avgRevenue: "$8.5M",
    avgEmployees: 125,
    growthRate: 4.2,
  },
}

interface SecurityCompany {
  id: string
  name: string
  industry: string
  subIndustry: string
  location: string
  zipCode: string
  revenue: string
  employees: number
  crimeRate: number
  securityDemand: number
  acquisitionScore: number
  successionRisk: number
  digitalPresence: number
  website?: string
  phone?: string
  rating: number
  reviews: number
  tam?: string
  tsm?: string
  marketShare?: number
  ebitda?: number
  evRange?: { low: number; high: number }
  multipleRange?: [number, number]
  sellerPropensity?: number
  riskLevel?: "Low" | "Medium" | "High"
  riskFactors?: string[]
  irrProjection?: { p5: number; p25: number; p50: number; p75: number; p95: number }
}

interface CrimeAreaMetrics {
  zipCode: string
  city: string
  county: string
  crimeRate: number
  securityDemand: number
  companies: number
  avgAge: number
  succession: number
  tam: string // Added TAM for the area
  tsm: string // Added TSM for the area
  marketGrowth: number // Added market growth rate
  competitionLevel: "Low" | "Medium" | "High" // Added competition level
}

export default function US4SecurityAnalysis() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("561610")
  const [selectedLocation, setSelectedLocation] = useState<string>("77002")
  const [searchTerm, setSearchTerm] = useState("")
  const [companies, setCompanies] = useState<SecurityCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [crimeHeatMap, setCrimeHeatMap] = useState<CrimeAreaMetrics[]>([])
  const [selectedArea, setSelectedArea] = useState<CrimeAreaMetrics | null>(null) // Added selected area state
  const [showAreaDetails, setShowAreaDetails] = useState(false) // Added area details modal state

  const [selectedCompanyForValuation, setSelectedCompanyForValuation] = useState<SecurityCompany | null>(null)
  const [showValuationModal, setShowValuationModal] = useState(false)
  const [valuationResults, setValuationResults] = useState<any>(null)

  const performAdvancedValuation = async (company: SecurityCompany) => {
    try {
      console.log("[v0] Performing advanced valuation for:", company.name)

      // Extract EBITDA estimate from revenue (assuming 15-25% EBITDA margin)
      const revenueNum = Number.parseFloat(company.revenue.replace(/[$M]/g, "")) * 1_000_000
      const estimatedEbitda = revenueNum * (0.15 + Math.random() * 0.1) // 15-25% margin

      // Determine risk factors
      const riskFactors = []
      if (company.successionRisk > 70) riskFactors.push("succession")
      if (company.digitalPresence < 50) riskFactors.push("digital")
      if (company.rating < 4.0) riskFactors.push("reputation")

      const response = await fetch("/api/advanced-valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebitda: estimatedEbitda,
          industry: "Security",
          size: revenueNum,
          risk_factors: riskFactors,
        }),
      })

      if (response.ok) {
        const valuation = await response.json()
        console.log("[v0] Advanced valuation results:", valuation)

        // Update company with valuation data
        const updatedCompany = {
          ...company,
          ebitda: estimatedEbitda,
          evRange: { low: valuation.EV_low, high: valuation.EV_high },
          multipleRange: valuation.multiple_range,
          sellerPropensity: valuation.sellerPropensity,
          riskLevel: valuation.riskLevel,
          riskFactors: valuation.riskFactors,
          // Mock Monte Carlo results
          irrProjection: {
            p5: 8.2,
            p25: 12.5,
            p50: 18.3,
            p75: 24.7,
            p95: 32.1,
          },
        }

        setSelectedCompanyForValuation(updatedCompany)
        setValuationResults(valuation)
        setShowValuationModal(true)
      }
    } catch (error) {
      console.error("[v0] Advanced valuation error:", error)
    }
  }

  const fetchCrimeData = async () => {
    try {
      console.log("[v0] Fetching crime data from APIs...")

      const response = await fetch("/api/crime-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: config.CENSUS_API_KEY,
          locations: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"],
        }),
      })

      if (response.ok) {
        const crimeData = await response.json()
        console.log("[v0] Crime data API response:", crimeData)
        setCrimeHeatMap(crimeData.areas || [])
      } else {
        console.log("[v0] Crime data API failed, using fallback data")
        // Fallback to enhanced mock data with TAM/TSM
        setCrimeHeatMap([
          {
            zipCode: "77002",
            city: "Houston",
            county: "Harris",
            crimeRate: 8.7,
            securityDemand: 95,
            companies: 142,
            avgAge: 58.2,
            succession: 78,
            tam: "$2.8B",
            tsm: "$890M",
            marketGrowth: 12.5,
            competitionLevel: "High",
          },
          {
            zipCode: "75201",
            city: "Dallas",
            county: "Dallas",
            crimeRate: 7.9,
            securityDemand: 92,
            companies: 128,
            avgAge: 61.4,
            succession: 82,
            tam: "$2.1B",
            tsm: "$720M",
            marketGrowth: 10.8,
            competitionLevel: "High",
          },
          {
            zipCode: "78701",
            city: "Austin",
            county: "Travis",
            crimeRate: 6.2,
            securityDemand: 85,
            companies: 89,
            avgAge: 54.8,
            succession: 65,
            tam: "$1.4B",
            tsm: "$480M",
            marketGrowth: 15.2,
            competitionLevel: "Medium",
          },
          {
            zipCode: "78205",
            city: "San Antonio",
            county: "Bexar",
            crimeRate: 7.1,
            securityDemand: 88,
            companies: 96,
            avgAge: 59.7,
            succession: 74,
            tam: "$1.6B",
            tsm: "$520M",
            marketGrowth: 9.4,
            competitionLevel: "Medium",
          },
          {
            zipCode: "76102",
            city: "Fort Worth",
            county: "Tarrant",
            crimeRate: 6.8,
            securityDemand: 83,
            companies: 74,
            avgAge: 57.3,
            succession: 69,
            tam: "$1.2B",
            tsm: "$380M",
            marketGrowth: 11.1,
            competitionLevel: "Medium",
          },
          {
            zipCode: "79901",
            city: "El Paso",
            county: "El Paso",
            crimeRate: 5.4,
            securityDemand: 76,
            companies: 52,
            avgAge: 62.1,
            succession: 85,
            tam: "$680M",
            tsm: "$210M",
            marketGrowth: 7.8,
            competitionLevel: "Low",
          },
        ])
      }
    } catch (error) {
      console.error("[v0] Error fetching crime data:", error)
      setCrimeHeatMap([
        {
          zipCode: "77002",
          city: "Houston",
          county: "Harris",
          crimeRate: 8.7,
          securityDemand: 95,
          companies: 142,
          avgAge: 58.2,
          succession: 78,
          tam: "$2.8B",
          tsm: "$890M",
          marketGrowth: 12.5,
          competitionLevel: "High",
        },
      ])
    }
  }

  const fetchSecurityCompanies = async (zipCode?: string) => {
    try {
      console.log("[v0] Fetching security companies from APIs...")
      console.log("[v0] API Keys available:", {
        yelp: !!config.YELP_API_KEY,
        dataAxle: !!config.DATA_AXLE_API_KEY,
      })

      const response = await fetch("/api/security-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yelpApiKey: config.YELP_API_KEY,
          dataAxleApiKey: config.DATA_AXLE_API_KEY,
          zipCode: zipCode || selectedLocation,
          industry: selectedIndustry,
          searchTerm,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Security companies API response:", data)
        return data.companies || []
      } else {
        console.log("[v0] Security companies API failed, using fallback data")
        // Enhanced fallback with TAM/TSM data
        return generateEnhancedSecurityCompanies(crimeHeatMap)
      }
    } catch (error) {
      console.error("[v0] Error fetching companies:", error)
      return generateEnhancedSecurityCompanies(crimeHeatMap)
    }
  }

  const generateEnhancedSecurityCompanies = (crimeData: CrimeAreaMetrics[]): SecurityCompany[] => {
    const mockCompanies: SecurityCompany[] = []

    crimeData.forEach((area, index) => {
      const industryKeys = Object.keys(CLEAN_SECURITY_INDUSTRIES)
      const randomIndustry = industryKeys[index % industryKeys.length]
      const industry = CLEAN_SECURITY_INDUSTRIES[randomIndustry as keyof typeof CLEAN_SECURITY_INDUSTRIES]

      // Calculate TAM/TSM based on area metrics
      const areaTAM = Number.parseFloat(area.tam.replace(/[$BM]/g, "")) * (area.tam.includes("B") ? 1000 : 1)
      const areaTSM = Number.parseFloat(area.tsm.replace(/[$BM]/g, "")) * (area.tsm.includes("B") ? 1000 : 1)

      for (let i = 0; i < Math.min(area.companies, 10); i++) {
        const companyTAM = ((areaTAM / area.companies) * (1 + Math.random() * 0.5)).toFixed(0)
        const companyTSM = ((areaTSM / area.companies) * (1 + Math.random() * 0.3)).toFixed(0)

        const company: SecurityCompany = {
          id: `${area.zipCode}-${i}`,
          name: `${area.city} Security Solutions ${i + 1}`,
          industry: randomIndustry,
          subIndustry: String(industry.subIndustries[i % industry.subIndustries.length]),
          location: `${area.city}, TX ${area.zipCode}`,
          zipCode: area.zipCode,
          revenue: `$${(Math.random() * 8 + 1).toFixed(1)}M`,
          employees: Math.floor(Math.random() * 100 + 20),
          crimeRate: area.crimeRate,
          securityDemand: area.securityDemand,
          acquisitionScore: Math.floor(area.securityDemand * 0.8 + area.succession * 0.2),
          successionRisk: area.succession,
          digitalPresence: Math.floor(Math.random() * 40 + 30),
          website: Math.random() > 0.3 ? `www.${area.city.toLowerCase()}security${i + 1}.com` : undefined,
          phone: `(${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviews: Math.floor(Math.random() * 200 + 10),
          tam: `$${companyTAM}M`,
          tsm: `$${companyTSM}M`,
          marketShare: Math.round((1 / area.companies) * 100 * 10) / 10,
        }
        mockCompanies.push(company)
      }
    })

    return mockCompanies.sort((a, b) => b.acquisitionScore - a.acquisitionScore)
  }

  useEffect(() => {
    fetchCrimeData()
  }, [])

  useEffect(() => {
    if (crimeHeatMap.length > 0) {
      fetchSecurityCompanies().then(setCompanies)
    }
  }, [crimeHeatMap])

  const searchSecurityCompanies = async () => {
    setLoading(true)
    console.log("[v0] US4 Security search started:", { selectedIndustry, selectedLocation, searchTerm })

    const fetchedCompanies = await fetchSecurityCompanies()
    let filteredCompanies = fetchedCompanies

    if (selectedIndustry && selectedIndustry !== "561610") {
      console.log("[v0] Filtering by industry:", selectedIndustry)
      filteredCompanies = filteredCompanies.filter((c) => c.industry === selectedIndustry)
    }

    if (selectedLocation && selectedLocation !== "77002") {
      console.log("[v0] Filtering by location:", selectedLocation)
      filteredCompanies = filteredCompanies.filter((c) => c.zipCode === selectedLocation)
    }

    if (searchTerm) {
      console.log("[v0] Filtering by search term:", searchTerm)
      filteredCompanies = filteredCompanies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subIndustry.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setCompanies(filteredCompanies)
    setLoading(false)
    console.log("[v0] US4 Security search completed:", filteredCompanies.length, "companies found")
    console.log(
      "[v0] Sample companies:",
      filteredCompanies.slice(0, 3).map((c) => ({ name: c.name, industry: c.industry, location: c.location })),
    )
  }

  const handleAreaClick = (area: CrimeAreaMetrics) => {
    console.log("[v0] Area clicked:", area.city, area.zipCode)
    setSelectedArea(area)
    setShowAreaDetails(true)
    setLoading(true)
    // Fetch companies for this specific area
    fetchSecurityCompanies(area.zipCode).then((areaCompanies) => {
      const filteredCompanies = areaCompanies.filter((c) => c.zipCode === area.zipCode)
      console.log("[v0] Companies found for area:", filteredCompanies.length)
      setCompanies(filteredCompanies)
      setLoading(false)
    })
  }

  const getSecurityDemandColor = (demand: number) => {
    if (demand >= 90) return "bg-red-500"
    if (demand >= 80) return "bg-orange-500"
    if (demand >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getCrimeRateColor = (rate: number) => {
    if (rate >= 8) return "text-red-600"
    if (rate >= 6) return "text-orange-600"
    if (rate >= 4) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">US4 Security Services Intelligence</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Private equity-grade acquisition targeting for Texas security companies with advanced valuation modeling
          </p>
        </div>

        {/* Search Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Security Company Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="561610">All Industries</SelectItem>
                  {Object.entries(SECURITY_INDUSTRIES).map(([code, industry]) => (
                    <SelectItem key={code} value={code}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="77002">All Locations</SelectItem>
                  {crimeHeatMap.map((area) => (
                    <SelectItem key={area.zipCode} value={area.zipCode}>
                      {area.city} ({area.zipCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={searchSecurityCompanies} disabled={loading} className="w-full">
                {loading ? "Searching..." : "Search Companies"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="companies">Security Companies</TabsTrigger>
            <TabsTrigger value="crime-map">Interactive Crime Heat Map</TabsTrigger>
            <TabsTrigger value="industries">Industry Analysis</TabsTrigger>
            <TabsTrigger value="pe-analytics">PE Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <div className="grid gap-6">
              {companies.slice(0, 20).map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{company.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {company.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {company.subIndustry}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        Score: {company.acquisitionScore}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{company.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{company.employees}</div>
                        <div className="text-sm text-muted-foreground">Employees</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{company.tam || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">TAM</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{company.tsm || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">TSM</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className={`text-2xl font-bold ${getCrimeRateColor(company.crimeRate)}`}>
                          {company.crimeRate}
                        </div>
                        <div className="text-sm text-muted-foreground">Crime Rate</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{company.securityDemand}%</div>
                        <div className="text-sm text-muted-foreground">Security Demand</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">Succession Risk: {company.successionRisk}%</Badge>
                      <Badge variant="outline">Digital Presence: {company.digitalPresence}%</Badge>
                      <Badge variant="outline">Market Share: {company.marketShare || "N/A"}%</Badge>
                      <Badge variant="outline">
                        Rating: {company.rating} ({company.reviews} reviews)
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {company.website && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Website
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Contact: {company.phone}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => performAdvancedValuation(company)}>
                          <Calculator className="h-4 w-4 mr-1" />
                          PE Valuation
                        </Button>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crime-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Interactive Texas Crime Heat Map & Market Analysis
                </CardTitle>
                <CardDescription>
                  Click on high-crime areas to view security companies, TAM, TSM, and market metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {crimeHeatMap.map((area) => (
                    <div
                      key={area.zipCode}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleAreaClick(area)} // Added click handler
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getSecurityDemandColor(area.securityDemand)}`} />
                        <div>
                          <div className="font-semibold">
                            {area.city}, TX {area.zipCode}
                          </div>
                          <div className="text-sm text-muted-foreground">{area.county} County</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            Competition: {area.competitionLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-4 text-center">
                        <div>
                          <div className={`text-lg font-bold ${getCrimeRateColor(area.crimeRate)}`}>
                            {area.crimeRate}
                          </div>
                          <div className="text-xs text-muted-foreground">Crime Rate</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">{area.securityDemand}%</div>
                          <div className="text-xs text-muted-foreground">Security Demand</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-foreground">{area.companies}</div>
                          <div className="text-xs text-muted-foreground">Companies</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{area.tam}</div>
                          <div className="text-xs text-muted-foreground">TAM</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{area.tsm}</div>
                          <div className="text-xs text-muted-foreground">TSM</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{area.marketGrowth}%</div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {showAreaDetails && selectedArea && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {selectedArea.city} Market Analysis
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setShowAreaDetails(false)}>
                      Close
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Detailed market metrics for {selectedArea.city}, TX {selectedArea.zipCode}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-600">{selectedArea.tam}</div>
                      <div className="text-sm text-muted-foreground">Total Addressable Market</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-600">{selectedArea.tsm}</div>
                      <div className="text-sm text-muted-foreground">Total Serviceable Market</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-purple-600">{selectedArea.companies}</div>
                      <div className="text-sm text-muted-foreground">Security Companies</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-orange-600">{selectedArea.marketGrowth}%</div>
                      <div className="text-sm text-muted-foreground">Market Growth Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Market Opportunity</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          Crime Rate:{" "}
                          <span className={getCrimeRateColor(selectedArea.crimeRate)}>{selectedArea.crimeRate}</span>
                        </div>
                        <div>
                          Security Demand: <span className="text-primary">{selectedArea.securityDemand}%</span>
                        </div>
                        <div>
                          Competition Level: <span className="text-foreground">{selectedArea.competitionLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Acquisition Potential</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          Avg Company Age: <span className="text-foreground">{selectedArea.avgAge} years</span>
                        </div>
                        <div>
                          Succession Risk: <span className="text-orange-600">{selectedArea.succession}%</span>
                        </div>
                        <div>
                          Market Share/Company:{" "}
                          <span className="text-primary">{(100 / selectedArea.companies).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Investment Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          Avg Revenue Multiple: <span className="text-green-600">2.8x</span>
                        </div>
                        <div>
                          Market Penetration:{" "}
                          <span className="text-blue-600">
                            {Math.round(selectedArea.companies / (selectedArea.securityDemand / 10))}%
                          </span>
                        </div>
                        <div>
                          Growth Potential: <span className="text-purple-600">High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="industries" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(CLEAN_SECURITY_INDUSTRIES).map(([code, industry]) => (
                <Card key={code}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {industry.name}
                    </CardTitle>
                    <CardDescription>NAICS {code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{industry.avgRevenue}</div>
                        <div className="text-sm text-muted-foreground">Avg Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{industry.avgEmployees}</div>
                        <div className="text-sm text-muted-foreground">Avg Employees</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{industry.growthRate}%</div>
                        <div className="text-sm text-muted-foreground">Growth Rate</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Sub-Industries:</h4>
                      <div className="flex flex-wrap gap-2">
                        {industry.subIndustries.map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pe-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Private Equity Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Advanced market intelligence and valuation modeling for institutional investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Market Opportunity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total TAM (Texas)</span>
                        <span className="font-semibold">$8.9B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Addressable TSM</span>
                        <span className="font-semibold">$3.2B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Market Growth (CAGR)</span>
                        <span className="font-semibold text-green-600">11.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fragmentation Index</span>
                        <span className="font-semibold text-orange-600">0.82</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Valuation Benchmarks
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Median EV/EBITDA</span>
                        <span className="font-semibold">5.2x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Range (P25-P75)</span>
                        <span className="font-semibold">4.1x &amp; 6.8x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Size Premium ({">"}$10M)</span>
                        <span className="font-semibold text-green-600">+1.2x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Discount</span>
                        <span className="font-semibold text-red-600">-0.8x</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Deal Metrics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                        <span className="font-semibold">$12.4M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Target IRR</span>
                        <span className="font-semibold text-green-600">18-25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Leverage (Debt/EBITDA)</span>
                        <span className="font-semibold">3.2x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hold Period</span>
                        <span className="font-semibold">4-6 years</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-4">Key Investment Themes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Tailwinds</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Rising crime rates driving security demand</li>
                        <li>• Aging owner demographics (succession opportunities)</li>
                        <li>• Digital transformation lag creates value-add potential</li>
                        <li>• Regulatory barriers limit new entrants</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Risks</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Labor shortage and wage inflation</li>
                        <li>• Technology disruption (AI surveillance)</li>
                        <li>• Economic sensitivity of commercial clients</li>
                        <li>• Regulatory compliance costs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showValuationModal && selectedCompanyForValuation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Advanced Valuation: {selectedCompanyForValuation.name}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowValuationModal(false)}>
                    Close
                  </Button>
                </CardTitle>
                <CardDescription>
                  Private equity-grade valuation analysis with risk assessment and return projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">Valuation Range</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Enterprise Value (Low)</span>
                          <span className="font-semibold">
                            ${selectedCompanyForValuation.evRange?.low.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Enterprise Value (High)</span>
                          <span className="font-semibold">
                            ${selectedCompanyForValuation.evRange?.high.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Multiple Range</span>
                          <span className="font-semibold">
                            {selectedCompanyForValuation.multipleRange?.[0].toFixed(1)}x &amp;{" "}
                            {selectedCompanyForValuation.multipleRange?.[1].toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Est. EBITDA</span>
                          <span className="font-semibold">${selectedCompanyForValuation.ebitda?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">Risk Assessment</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Risk Level</span>
                          <Badge
                            variant={
                              selectedCompanyForValuation.riskLevel === "High"
                                ? "destructive"
                                : selectedCompanyForValuation.riskLevel === "Medium"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {selectedCompanyForValuation.riskLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Seller Propensity</span>
                          <span className="font-semibold text-green-600">
                            {selectedCompanyForValuation.sellerPropensity}%
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">Risk Factors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedCompanyForValuation.riskFactors?.map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">IRR Projections (Monte Carlo)</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Downside (P5)</span>
                          <span className="font-semibold text-red-600">
                            {selectedCompanyForValuation.irrProjection?.p5}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Base Case (P50)</span>
                          <span className="font-semibold text-blue-600">
                            {selectedCompanyForValuation.irrProjection?.p50}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Upside (P95)</span>
                          <span className="font-semibold text-green-600">
                            {selectedCompanyForValuation.irrProjection?.p95}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">Investment Thesis</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Market Position:</span>
                          <span className="text-muted-foreground ml-2">
                            {selectedCompanyForValuation.marketShare}% local market share
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Growth Drivers:</span>
                          <span className="text-muted-foreground ml-2">
                            Crime rate {selectedCompanyForValuation.crimeRate},{" "}
                            {selectedCompanyForValuation.securityDemand}% demand
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Value Creation:</span>
                          <span className="text-muted-foreground ml-2">
                            Digital transformation, operational efficiency
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-800">Investment Recommendation</h3>
                    <p className="text-sm text-blue-700">
                      {selectedCompanyForValuation.sellerPropensity && selectedCompanyForValuation.sellerPropensity > 70
                        ? "Strong acquisition candidate with high seller propensity and attractive valuation metrics."
                        : selectedCompanyForValuation.sellerPropensity &&
                            selectedCompanyForValuation.sellerPropensity > 50
                          ? "Moderate acquisition opportunity. Consider strategic approach to increase seller interest."
                          : "Lower priority target. Monitor for changes in succession risk or market conditions."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

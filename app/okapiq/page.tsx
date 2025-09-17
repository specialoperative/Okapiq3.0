"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultiSelect } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import AdvancedAnalyticsPanel from "@/src/components/advanced/AdvancedAnalyticsPanel"
import ContactIntelligencePanel from "@/src/components/advanced/ContactIntelligencePanel"
import InteractiveMapPanel from "@/src/components/advanced/InteractiveMapPanel"
import LLMTierSheetPanel from "@/src/components/advanced/LLMTierSheetPanel"
import AutomatedOutreachPanel from "@/src/components/advanced/AutomatedOutreachPanel"
import CampaignAnalyticsDashboard from "@/src/components/advanced/CampaignAnalyticsDashboard"
import IllinoisMarketHeatMap from "@/src/components/advanced/IllinoisMarketHeatMap"
import GeneralAcquisitionTool from "@/src/components/GeneralAcquisitionTool"
import USAAgingAnalysis from "@/src/components/USAAgingAnalysis"
import NewEnglandZipCodeScoring from "@/src/components/advanced/NewEnglandZipCodeScoring"
import {
  Search,
  TrendingUp,
  Building2,
  DollarSign,
  Target,
  Download,
  FileText,
  Eye,
  Map,
  Brain,
  Users,
  BarChart3,
  MessageSquare,
  Flame,
  Briefcase,
  MapPin,
  RefreshCw,
  Save,
  Bell,
  Activity,
  Zap,
  Plus,
  Globe,
  TrendingDown,
} from "lucide-react"

interface LiveMarketFeed {
  newReviews: number
  hiringVelocity: number
  leadershipChanges: number
  maChatter: number
  lastUpdate: string
}

interface MarketData {
  tam: number
  tsm: number
  hhi: number
  companies: number
  avgRevenue: number
  growthRate: number
}

interface BusinessTarget {
  id: string
  name: string
  industry: string
  location: string
  revenue: number
  employees: number
  founded: number
  acquisitionScore: number
  successionRisk: number
  digitalPresence: number
  valuation: number
  ownerName?: string
  ownerAge?: number
  ownerEmail?: string
  ownerPhone?: string
  executiveContacts?: Array<{
    name: string
    title: string
    email?: string
    phone?: string
  }>
  zipCodeWealth?: number
  businessConcentration?: number
  fragmentation?: {
    competitors: number
    marketShare: number
    adArbitrageScore: number
  }
  tierSheet?: {
    websiteQuality: number
    seoScore: number
    reviewScore: number
    services: string[]
    clientTypes: string[]
    revenueStreams: string[]
  }
}

export default function OkapiqDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["all"])
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [naicsCode, setNaicsCode] = useState("")
  const [heatMapType, setHeatMapType] = useState("acquisition")
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [businessTargets, setBusinessTargets] = useState<BusinessTarget[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [buyBoxCriteria, setBuyBoxCriteria] = useState({
    minRevenue: 1000000,
    maxRevenue: 10000000,
    minEmployees: 10,
    maxEmployees: 100,
    minSuccessionRisk: 70,
    industries: [] as string[],
    locations: [] as string[],
  })

  const [liveMarketFeed, setLiveMarketFeed] = useState<LiveMarketFeed>({
    newReviews: 12,
    hiringVelocity: 8,
    leadershipChanges: 3,
    maChatter: 5,
    lastUpdate: new Date().toLocaleTimeString(),
  })
  const [savedTheses, setSavedTheses] = useState<string[]>([])
  const [alertsEnabled, setAlertsEnabled] = useState(false)
  const [revenueRange, setRevenueRange] = useState([1, 10])
  const [teamSizeRange, setTeamSizeRange] = useState([10, 100])
  const [successionRiskThreshold, setSuccessionRiskThreshold] = useState([70])
  const [fragmentationIndex, setFragmentationIndex] = useState([0.5])
  const [marketGrowthProxy, setMarketGrowthProxy] = useState(true)

  const mockMarketData: MarketData = {
    tam: 2400000000,
    tsm: 480000000,
    hhi: 0.15,
    companies: 12500,
    avgRevenue: 850000,
    growthRate: 8.5,
  }

  const mockBusinessTargets: BusinessTarget[] = [
    {
      id: "1",
      name: "Elite Security Solutions",
      industry: "Security Services",
      location: "Houston, TX",
      revenue: 2500000,
      employees: 45,
      founded: 2008,
      acquisitionScore: 92,
      successionRisk: 85,
      digitalPresence: 68,
      valuation: 12500000,
      ownerName: "Robert Martinez",
      ownerAge: 67,
      ownerEmail: "r.martinez@elitesecurity.com",
      ownerPhone: "(713) 555-0123",
      executiveContacts: [
        {
          name: "Sarah Johnson",
          title: "VP Operations",
          email: "s.johnson@elitesecurity.com",
          phone: "(713) 555-0124",
        },
        { name: "Mike Chen", title: "CFO", email: "m.chen@elitesecurity.com" },
      ],
      zipCodeWealth: 78,
      businessConcentration: 45,
      fragmentation: {
        competitors: 23,
        marketShare: 12.5,
        adArbitrageScore: 82,
      },
      tierSheet: {
        websiteQuality: 75,
        seoScore: 68,
        reviewScore: 4.2,
        services: ["Commercial Security", "Residential Monitoring", "Event Security"],
        clientTypes: ["Corporate", "Retail", "Healthcare"],
        revenueStreams: ["Monthly Monitoring", "Installation", "Consulting"],
      },
    },
  ]

  const runAnalysis = async () => {
    setLoading(true)
    try {
      console.log("[v0] Starting advanced intelligence analysis...")

      const nlQueryResponse = await fetch("/api/natural-language-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          naturalQuery: searchQuery || "security services companies for acquisition",
          intent: "acquisition",
        }),
      })

      let nlQueryData = null
      if (nlQueryResponse.ok) {
        nlQueryData = await nlQueryResponse.json()
        console.log("[v0] Natural language query processed:", nlQueryData)
      }

      const metricsResponse = await fetch("/api/advanced-metrics-compute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          features:
            nlQueryData?.results?.map((business: any) => ({
              type: "Feature",
              geometry: business.geom || { type: "Point", coordinates: [-95.3698, 29.7604] },
              properties: business,
            })) || [],
          dsl: {
            intent: "acquisition",
            where: [
              { field: "industry_code", op: "in", value: selectedIndustries.includes("all") ? [] : selectedIndustries },
              {
                field: "revenue_estimate",
                op: "between",
                value: [buyBoxCriteria.minRevenue, buyBoxCriteria.maxRevenue],
              },
            ],
            metrics: ["FS_ms", "HHI_local", "D2", "MROS", "AAS", "SRI"],
          },
        }),
      })

      let metricsData = null
      if (metricsResponse.ok) {
        metricsData = await metricsResponse.json()
        console.log("[v0] Advanced metrics computed:", metricsData)
      }

      const dealIntelResponse = await fetch("/api/deal-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery || "security services",
          filters: {
            industry: selectedIndustries.includes("all") ? undefined : selectedIndustries,
            location: selectedLocation === "all" ? undefined : selectedLocation,
            naicsCode: naicsCode || undefined,
            buyBoxCriteria,
          },
          location: selectedLocation === "all" ? "nationwide" : selectedLocation,
        }),
      })

      let dealIntelData = null
      if (dealIntelResponse.ok) {
        dealIntelData = await dealIntelResponse.json()
        console.log("[v0] Deal intelligence data received:", dealIntelData)
      }

      const response = await fetch("/api/advanced-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery || "security services",
          industry: selectedIndustries.includes("all") ? undefined : selectedIndustries,
          location: selectedLocation === "all" ? undefined : selectedLocation,
          naicsCode: naicsCode || undefined,
          buyBoxCriteria,
          maxResults: 50,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Advanced intelligence data received:", data)

      const transformedMarketData: MarketData = {
        tam:
          dealIntelData?.data?.analytics?.tam ||
          data.marketIntelligence?.tam ||
          metricsData?.summary?.tam_estimate ||
          mockMarketData.tam,
        tsm: dealIntelData?.data?.analytics?.tsm || data.marketIntelligence?.tsm || mockMarketData.tsm,
        hhi:
          metricsData?.summary?.hhi_index ||
          dealIntelData?.data?.analytics?.hhi ||
          data.marketIntelligence?.hhi ||
          mockMarketData.hhi,
        companies: nlQueryData?.results?.length || dealIntelData?.companies?.length || data.businesses?.length || 0,
        avgRevenue:
          metricsData?.summary?.avg_revenue ||
          dealIntelData?.data?.analytics?.avgRevenue ||
          data.marketIntelligence?.avgRevenue ||
          mockMarketData.avgRevenue,
        growthRate:
          dealIntelData?.data?.analytics?.growthRate ||
          data.marketIntelligence?.growthRate ||
          mockMarketData.growthRate,
      }

      const nlQueryCompanies = nlQueryData?.results || []
      const dealIntelCompanies = dealIntelData?.companies || []
      const advancedIntelCompanies = data.businesses || []

      const combinedBusinesses = [...nlQueryCompanies, ...dealIntelCompanies, ...advancedIntelCompanies].filter(
        (business, index, self) => index === self.findIndex((b) => b.name === business.name || b.id === business.id),
      ) // Remove duplicates

      const transformedTargets: BusinessTarget[] = combinedBusinesses.map((business: any, index: number) => {
        const businessId = business.id || business.business_id || `target-${index}`
        const advancedMetrics = metricsData?.byBusiness?.[businessId] || {}

        return {
          id: businessId,
          name: business.name || `Business ${index + 1}`,
          industry: business.industry || business.industry_code || selectedIndustries.join(", ") || "Unknown",
          location: business.location || business.headquarters_location || selectedLocation || "Unknown Location",
          revenue:
            business.revenueEstimate || business.revenue_estimate || Math.floor(Math.random() * 5000000) + 1000000,
          employees: business.employeeCount || business.employee_count || Math.floor(Math.random() * 100) + 10,
          founded: business.foundedYear || business.founding_year || 2000 + Math.floor(Math.random() * 20),
          acquisitionScore: advancedMetrics.aas_score
            ? Math.round(advancedMetrics.aas_score * 10)
            : business.acquisitionProbability || Math.floor(Math.random() * 40) + 60,
          successionRisk: advancedMetrics.succession_risk
            ? Math.round(advancedMetrics.succession_risk * 100)
            : business.successionRisk || Math.floor(Math.random() * 50) + 50,
          digitalPresence: business.digitalPresenceScore || Math.floor(Math.random() * 40) + 60,
          valuation:
            business.valuation ||
            (business.revenueEstimate || business.revenue_estimate || 2000000) * (2 + Math.random() * 3),
          ownerName: business.ownerInfo?.name || business.owner_name,
          ownerAge: business.ownerInfo?.estimatedAge || business.owner_age_estimate,
          ownerEmail: business.contactInfo?.email || business.owner_email,
          ownerPhone: business.contactInfo?.phone || business.owner_phone,
          executiveContacts: business.executiveContacts || [],
          zipCodeWealth: business.demographicData?.wealthIndex || business.zip_code_wealth,
          businessConcentration: business.marketAnalysis?.concentrationIndex || business.business_concentration,
          fragmentation: {
            competitors:
              business.competitorAnalysis?.competitorCount ||
              business.fragmentation?.competitors ||
              Math.floor(Math.random() * 30) + 10,
            marketShare:
              business.marketAnalysis?.estimatedMarketShare ||
              business.fragmentation?.marketShare ||
              Math.random() * 20,
            adArbitrageScore:
              business.digitalAnalysis?.adArbitrageScore ||
              business.fragmentation?.adArbitrageScore ||
              Math.floor(Math.random() * 40) + 60,
          },
          tierSheet: {
            websiteQuality:
              business.digitalAnalysis?.websiteQuality ||
              business.tierSheet?.websiteQuality ||
              Math.floor(Math.random() * 40) + 60,
            seoScore:
              business.digitalAnalysis?.seoScore || business.tierSheet?.seoScore || Math.floor(Math.random() * 40) + 60,
            reviewScore:
              business.reviewAnalysis?.averageRating || business.tierSheet?.reviewScore || 3 + Math.random() * 2,
            services: business.services || business.tierSheet?.services || ["Service 1", "Service 2"],
            clientTypes: business.clientTypes || business.tierSheet?.clientTypes || ["Corporate", "Retail"],
            revenueStreams: business.revenueStreams ||
              business.tierSheet?.revenueStreams || ["Primary Service", "Secondary Service"],
          },
        }
      })

      setMarketData(transformedMarketData)
      setBusinessTargets(transformedTargets)

      console.log("[v0] Analysis complete:", {
        marketData: transformedMarketData,
        targetCount: transformedTargets.length,
        nlQueryEnabled: !!nlQueryData,
        metricsEnabled: !!metricsData,
        dealIntelEnabled: !!dealIntelData,
      })

      if (transformedTargets.length === 0) {
        console.log("[v0] No businesses found - consider expanding search criteria")
      }
    } catch (error) {
      console.error("[v0] Advanced intelligence API error:", error)
      setMarketData(mockMarketData)
      setBusinessTargets([]) // Show empty state instead of mock data
    } finally {
      setLoading(false)
    }
  }

  const refreshTargets = async () => {
    setLiveMarketFeed({
      ...liveMarketFeed,
      lastUpdate: new Date().toLocaleTimeString(),
    })
    await runAnalysis()
  }

  const buildThesis = () => {
    console.log("[v0] Opening thesis builder...")
    // Thesis builder functionality
  }

  const autoTranslateThesis = () => {
    console.log("[v0] Auto-translating thesis to filters...")
    // AI thesis translation functionality
  }

  const saveParameters = () => {
    console.log("[v0] Saving investment parameters...")
    // Save parameters functionality
  }

  const setAlerts = () => {
    setAlertsEnabled(!alertsEnabled)
    console.log(`[v0] Alerts ${alertsEnabled ? "disabled" : "enabled"}`)
  }

  const generateHeatMap = async () => {
    setShowHeatMap(true)
    try {
      const response = await fetch("/api/map-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          naicsCode,
          location: selectedLocation,
          heatMapType,
          dataLayers: ["businessDensity", "acquisitionOpportunity", "successionRisk", "marketPotential"],
        }),
      })

      if (response.ok) {
        console.log("[v0] Heat map generated successfully")
      }
    } catch (error) {
      console.error("[v0] Heat map generation error:", error)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [])

  const exportToCRM = () => {
    const selectedData = businessTargets.filter((target) => selectedTargets.includes(target.id))

    if (exportFormat === "csv") {
      const csvData = selectedData.map((target) => ({
        Company: target.name,
        Industry: target.industry,
        Location: target.location,
        Revenue: target.revenue,
        Employees: target.employees,
        "Owner Name": target.ownerName,
        "Owner Email": target.ownerEmail,
        "Owner Phone": target.ownerPhone,
        "Acquisition Score": target.acquisitionScore,
        "Succession Risk": target.successionRisk,
        Valuation: target.valuation,
      }))

      const csv = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "okapiq-targets.csv"
      a.click()
    }

    console.log(`[v0] Exported ${selectedData.length} targets to ${exportFormat}`)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">🚀 Okapiq Terminal</h1>
            <p className="text-muted-foreground text-lg">
              Real-time market intelligence for SMB acquisitions, roll-ups, and sector scans.
            </p>
            <p className="text-sm text-chart-1 font-medium">Search. Score. Map. Outreach. Close.</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="text-sm font-medium mb-2">Live Market Data Feed</div>
              <div className="flex items-center gap-4 text-xs">
                <Badge variant="outline" className="text-chart-1 border-chart-1">
                  🎯 {businessTargets.length} Active Targets
                </Badge>
                <div className="text-muted-foreground">🔄 Pipeline Refresh: {liveMarketFeed.lastUpdate}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>📊 New reviews: {liveMarketFeed.newReviews}</div>
                <div>📈 Hiring velocity: {liveMarketFeed.hiringVelocity}</div>
                <div>👔 Leadership changes: {liveMarketFeed.leadershipChanges}</div>
                <div>💼 M&A chatter: {liveMarketFeed.maChatter}</div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={refreshTargets} className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Targets
                </Button>
                <Button size="sm" onClick={exportToCRM} variant="outline" className="text-xs bg-transparent">
                  <Download className="h-3 w-3 mr-1" />
                  Export to CRM
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Thesis Builder
          </CardTitle>
          <CardDescription>Search by NAICS / Keyword → Autocomplete, with synonyms + AI suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Search by NAICS / Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input"
            />
            <Input
              placeholder="NAICS Classification (e.g., 561621)"
              value={naicsCode}
              onChange={(e) => setNaicsCode(e.target.value)}
              className="bg-input"
            />
            <MultiSelect
              options={[
                { label: "All Sectors", value: "all" },
                { label: "Security Services (561621)", value: "security" },
                { label: "HVAC (238220)", value: "hvac" },
                { label: "Landscaping (561730)", value: "landscaping" },
                { label: "Plumbing (238221)", value: "plumbing" },
                { label: "Electrical (238210)", value: "electrical" },
                { label: "Cleaning Services (561720)", value: "cleaning" },
                { label: "Pest Control (561710)", value: "pest" },
                { label: "Software Publishers (511210)", value: "software" },
                { label: "Custom Programming (541511)", value: "programming" },
                { label: "Computer Systems Design (541512)", value: "systems" },
                { label: "Dental Practices (621210)", value: "dental" },
                { label: "Engineering Services (541330)", value: "engineering" },
                { label: "HR Consulting (541612)", value: "hr" },
              ]}
              onValueChange={setSelectedIndustries}
              defaultValue={selectedIndustries}
              placeholder="Select sectors..."
              variant="inverted"
              animation={2}
              maxCount={3}
              className="bg-input"
            />
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Geographic Focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">National Coverage</SelectItem>
                <SelectItem value="texas">Texas</SelectItem>
                <SelectItem value="california">California</SelectItem>
                <SelectItem value="florida">Florida</SelectItem>
                <SelectItem value="illinois">Illinois</SelectItem>
                <SelectItem value="new-york">New York</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={buildThesis} variant="outline">
              <FileText className="h-4 w-4 mr-2" />📝 Build Thesis
            </Button>
            <Button onClick={autoTranslateThesis} variant="outline">
              <Zap className="h-4 w-4 mr-2" />⚡ Auto-Translate Thesis → Filters
            </Button>
            <Button onClick={runAnalysis} disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Processing..." : "📊 Run Scan"}
            </Button>
          </div>

          <div className="border-t pt-4 mb-4">
            <h4 className="text-sm font-medium mb-3">Investment Parameters Panel</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Revenue Range: ${revenueRange[0]}M – ${revenueRange[1]}M
                </label>
                <Slider
                  value={revenueRange}
                  onValueChange={setRevenueRange}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Team Size: {teamSizeRange[0]}+ employees</label>
                <Slider
                  value={teamSizeRange}
                  onValueChange={setTeamSizeRange}
                  max={500}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Succession Risk: {successionRiskThreshold[0]}%+</label>
                <Slider
                  value={successionRiskThreshold}
                  onValueChange={setSuccessionRiskThreshold}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Fragmentation Index: {fragmentationIndex[0].toFixed(2)}
                </label>
                <Slider
                  value={fragmentationIndex}
                  onValueChange={setFragmentationIndex}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="market-growth" checked={marketGrowthProxy} onCheckedChange={setMarketGrowthProxy} />
                <label htmlFor="market-growth" className="text-xs">
                  Market Growth Proxy
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveParameters} size="sm" variant="outline">
                <Save className="h-4 w-4 mr-1" />➕ Save Parameters
              </Button>
              <Button onClick={setAlerts} size="sm" variant="outline">
                <Bell className="h-4 w-4 mr-1" />🔔 Set Alerts
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Visualization Suite</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={generateHeatMap} variant="outline" size="sm">
                <Map className="h-4 w-4 mr-1" />🗺 Heatmap
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-1" />📍 Targets Map
              </Button>
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-1" />🌀 Cluster View
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-1" />🧮 Correlation Explorer
              </Button>
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-1" />📑 AI Tier Sheets
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />🔍 Deep Dive
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />📤 Export Visual
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />🎯 Add to Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-12 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-1" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="maps">
            <Map className="h-4 w-4 mr-1" />
            Maps
          </TabsTrigger>
          <TabsTrigger value="illinois">
            <Flame className="h-4 w-4 mr-1" />
            Illinois
          </TabsTrigger>
          <TabsTrigger value="tiersheet">
            <Brain className="h-4 w-4 mr-1" />
            AI Tier Sheets
          </TabsTrigger>
          <TabsTrigger value="outreach">
            <MessageSquare className="h-4 w-4 mr-1" />
            Outreach
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <TrendingUp className="h-4 w-4 mr-1" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="targets">
            <Target className="h-4 w-4 mr-1" />
            Targets
          </TabsTrigger>
          <TabsTrigger value="acquisition">
            <Briefcase className="h-4 w-4 mr-1" />
            Acquisition
          </TabsTrigger>
          <TabsTrigger value="usa-aging">
            <MapPin className="h-4 w-4 mr-1" />
            USA Demographics
          </TabsTrigger>
          <TabsTrigger value="new-england">
            <DollarSign className="h-4 w-4 mr-1" />
            New England
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Addressable Market (TAM)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1">
                  ${marketData ? (marketData.tam / 1000000000).toFixed(1) : "12.5"}B
                </div>
                <p className="text-xs text-muted-foreground">+12% QoQ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Serviceable Market (TSM)</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">
                  ${marketData ? (marketData.tsm / 1000000).toFixed(0) : "2,500"}M
                </div>
                <p className="text-xs text-muted-foreground">20% of TAM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">
                  {marketData ? marketData.companies.toLocaleString() : "33"}
                </div>
                <p className="text-xs text-muted-foreground">Filtered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Acquisition Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">7.8/10</div>
                <p className="text-xs text-muted-foreground">Investment Grade</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fragmentation Index</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1">0.68</div>
                <p className="text-xs text-muted-foreground">High fragmentation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Succession Risk Index</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">0.52</div>
                <p className="text-xs text-muted-foreground">Medium risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competitive Concentration</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">21%</div>
                <p className="text-xs text-muted-foreground">Top 5 firms market share</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Actions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                  📈 Open Market Report
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                  📤 Export Dashboard
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                  📧 Send to Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdvancedAnalyticsPanel
            businessId={businessTargets[0]?.id}
            zipCode={businessTargets[0]?.location?.split(", ")[1]?.split(" ")[1]}
            industry={selectedIndustries.join(", ")}
            businessData={businessTargets}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <ContactIntelligencePanel businessTargets={businessTargets} selectedBusinesses={selectedTargets} />
        </TabsContent>

        <TabsContent value="maps" className="space-y-6">
          <InteractiveMapPanel
            searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            businessTargets={businessTargets}
            heatMapType={heatMapType}
          />
        </TabsContent>

        <TabsContent value="illinois" className="space-y-6">
          <IllinoisMarketHeatMap />
        </TabsContent>

        <TabsContent value="tiersheet" className="space-y-6">
          <LLMTierSheetPanel
            selectedBusiness={businessTargets.find((b) => selectedTargets.includes(b.id))}
            businessTargets={businessTargets}
          />
        </TabsContent>

        <TabsContent value="outreach" className="space-y-6">
          <AutomatedOutreachPanel
            selectedBusinesses={selectedTargets}
            businessTargets={businessTargets}
            onCampaignCreate={(campaign) => console.log("[v0] Campaign created:", campaign)}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignAnalyticsDashboard campaigns={[]} businessTargets={businessTargets} />
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Acquisition Pipeline</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{businessTargets.length} prospects</Badge>
                  <Button size="sm" onClick={() => setSelectedTargets(businessTargets.map((t) => t.id))}>
                    Select Portfolio
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Qualified acquisition targets ranked by investment attractiveness and succession probability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessTargets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No qualified prospects identified. Execute search parameters to discover investment opportunities.
                    </p>
                  </div>
                ) : (
                  businessTargets.map((target) => (
                    <div key={target.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedTargets.includes(target.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTargets([...selectedTargets, target.id])
                              } else {
                                setSelectedTargets(selectedTargets.filter((id) => id !== target.id))
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{target.name}</h4>
                              <Badge variant="outline">{target.industry}</Badge>
                              <Badge
                                variant={
                                  target.acquisitionScore >= 8
                                    ? "default"
                                    : target.acquisitionScore >= 6
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                Investment Grade: {target.acquisitionScore}/10
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Annual Revenue:</span>
                                <div className="font-medium">${(target.revenue / 1000000).toFixed(1)}M</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Team Size:</span>
                                <div className="font-medium">{target.employees}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Established:</span>
                                <div className="font-medium">{target.founded}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Enterprise Value:</span>
                                <div className="font-medium">${(target.valuation / 1000000).toFixed(1)}M</div>
                              </div>
                            </div>
                            {target.ownerName && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Principal:</span>
                                    <div className="font-medium">{target.ownerName}</div>
                                  </div>
                                  {target.ownerAge && (
                                    <div>
                                      <span className="text-muted-foreground">Age:</span>
                                      <div className="font-medium">{target.ownerAge}</div>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-muted-foreground">Transition Probability:</span>
                                    <div className="font-medium">{target.successionRisk}%</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Due Diligence
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            Investment Memo
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-6">
          <GeneralAcquisitionTool />
        </TabsContent>

        <TabsContent value="usa-aging" className="space-y-6">
          <USAAgingAnalysis />
        </TabsContent>

        <TabsContent value="new-england" className="space-y-6">
          <NewEnglandZipCodeScoring />
        </TabsContent>
      </Tabs>
    </div>
  )
}

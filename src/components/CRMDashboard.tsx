"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  Mail,
  Phone,
  MapPin,
  Building2,
  TrendingUp,
  Search,
  RefreshCw,
  Globe,
  Star,
  Target,
  Activity,
} from "lucide-react"

interface Business {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  email?: string
  industry: string
  naicsCode: string
  rating?: number
  reviewCount?: number
  estimatedRevenue?: string
  employeeCount?: string
  yearEstablished?: number
  acquisitionScore?: number
  successionRisk?: number
  digitalPresence?: number
  marketOpportunity?: number
  emailScrapingStatus?: "pending" | "scraped" | "failed"
  lastUpdated?: Date
  logo?: string
}

export default function CRMDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [emailScrapingProgress, setEmailScrapingProgress] = useState(0)
  const [isScrapingEmails, setIsScrapingEmails] = useState(false)

  useEffect(() => {
    const mockBusinesses: Business[] = [
      {
        id: "1",
        name: "ABC Fire Safety Systems",
        address: "123 Main St, Dallas, TX 75201",
        phone: "(214) 555-0123",
        website: "https://abcfiresafety.com",
        industry: "Fire & Life Safety",
        naicsCode: "561621",
        rating: 4.5,
        reviewCount: 87,
        estimatedRevenue: "$2.5M",
        employeeCount: "15-25",
        yearEstablished: 2008,
        acquisitionScore: 85,
        successionRisk: 72,
        digitalPresence: 45,
        marketOpportunity: 78,
        emailScrapingStatus: "pending",
        lastUpdated: new Date(),
        logo: "https://example.com/logo1.png",
      },
      {
        id: "2",
        name: "Texas HVAC Solutions",
        address: "456 Oak Ave, Houston, TX 77001",
        phone: "(713) 555-0456",
        website: "https://texashvac.com",
        industry: "HVACR Services",
        naicsCode: "238220",
        rating: 4.2,
        reviewCount: 134,
        estimatedRevenue: "$4.2M",
        employeeCount: "25-50",
        yearEstablished: 2005,
        acquisitionScore: 92,
        successionRisk: 85,
        digitalPresence: 38,
        marketOpportunity: 88,
        emailScrapingStatus: "pending",
        lastUpdated: new Date(),
        logo: "https://example.com/logo2.png",
      },
      {
        id: "3",
        name: "Elite Security Guards",
        address: "789 Pine St, Austin, TX 78701",
        phone: "(512) 555-0789",
        website: "https://elitesecurity.com",
        industry: "Security Services",
        naicsCode: "561612",
        rating: 4.7,
        reviewCount: 203,
        estimatedRevenue: "$3.8M",
        employeeCount: "50-100",
        yearEstablished: 2010,
        acquisitionScore: 88,
        successionRisk: 65,
        digitalPresence: 62,
        marketOpportunity: 82,
        emailScrapingStatus: "pending",
        lastUpdated: new Date(),
        logo: "https://example.com/logo3.png",
      },
    ]
    setBusinesses(mockBusinesses)
    setFilteredBusinesses(mockBusinesses)
  }, [])

  useEffect(() => {
    let filtered = businesses

    if (searchTerm) {
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.industry.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedIndustry !== "all") {
      filtered = filtered.filter((business) => business.industry === selectedIndustry)
    }

    setFilteredBusinesses(filtered)
  }, [searchTerm, selectedIndustry, businesses])

  const scrapeEmails = async () => {
    setIsScrapingEmails(true)
    setEmailScrapingProgress(0)

    const businessesToScrape = filteredBusinesses.filter((b) => b.website && b.emailScrapingStatus === "pending")

    for (let i = 0; i < businessesToScrape.length; i++) {
      const business = businessesToScrape[i]

      try {
        console.log(`[v0] Scraping emails for ${business.name} at ${business.website}`)

        const response = await fetch(`/api/scrape-email?url=${encodeURIComponent(business.website!)}`)
        const data = await response.json()

        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === business.id
              ? {
                  ...b,
                  email: data.email || "No email found",
                  emailScrapingStatus: data.email ? "scraped" : ("failed" as const),
                }
              : b,
          ),
        )

        console.log(`[v0] Found email for ${business.name}: ${data.email || "None"}`)
      } catch (error) {
        console.log(`[v0] Failed to scrape email for ${business.name}:`, error)

        setBusinesses((prev) =>
          prev.map((b) => (b.id === business.id ? { ...b, emailScrapingStatus: "failed" as const } : b)),
        )
      }

      setEmailScrapingProgress(((i + 1) / businessesToScrape.length) * 100)
    }

    setIsScrapingEmails(false)
  }

  const exportToCSV = () => {
    const headers = [
      "Company Name",
      "Industry",
      "NAICS Code",
      "Address",
      "Phone",
      "Website",
      "Email",
      "Rating",
      "Reviews",
      "Est. Revenue",
      "Employees",
      "Year Est.",
      "Acquisition Score",
      "Succession Risk",
      "Digital Presence",
      "Market Opportunity",
      "Logo",
    ]

    const csvData = filteredBusinesses.map((business) => [
      business.name,
      business.industry,
      business.naicsCode,
      business.address,
      business.phone || "",
      business.website || "",
      business.email || "",
      business.rating || "",
      business.reviewCount || "",
      business.estimatedRevenue || "",
      business.employeeCount || "",
      business.yearEstablished || "",
      business.acquisitionScore || "",
      business.successionRisk || "",
      business.digitalPresence || "",
      business.marketOpportunity || "",
      business.logo || "",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `business-leads-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log(`[v0] Exported ${filteredBusinesses.length} businesses to CSV`)
  }

  const totalBusinesses = businesses.length
  const avgAcquisitionScore = businesses.reduce((sum, b) => sum + (b.acquisitionScore || 0), 0) / totalBusinesses
  const highSuccessionRisk = businesses.filter((b) => (b.successionRisk || 0) > 70).length
  const emailsScraped = businesses.filter((b) => b.emailScrapingStatus === "scraped").length

  const industries = Array.from(new Set(businesses.map((b) => b.industry)))

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Intelligence CRM</h1>
            <p className="text-muted-foreground">Comprehensive acquisition pipeline management</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={scrapeEmails}
              disabled={isScrapingEmails}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {isScrapingEmails ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Scrape Emails
                </>
              )}
            </Button>
            <Button onClick={exportToCSV} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalBusinesses}</div>
              <p className="text-xs text-muted-foreground">Active prospects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Acquisition Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{avgAcquisitionScore.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Succession Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{highSuccessionRisk}</div>
              <p className="text-xs text-muted-foreground">Ready for acquisition</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Scraped</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{emailsScraped}</div>
              <p className="text-xs text-muted-foreground">Contact info available</p>
            </CardContent>
          </Card>
        </div>

        {isScrapingEmails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Email Scraping in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={emailScrapingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Scraping emails from business websites... {emailScrapingProgress.toFixed(0)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
                >
                  <option value="all">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Pipeline ({filteredBusinesses.length})</CardTitle>
            <CardDescription>Comprehensive business intelligence and acquisition targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {/* Enhanced business display with company logos */}
                          {business.logo && (
                            <img
                              src={business.logo || "/placeholder.svg"}
                              alt={`${business.name} logo`}
                              className="w-10 h-10 rounded object-cover border flex-shrink-0"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = "none"
                              }}
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{business.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {business.address}
                            </div>
                            {business.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">
                                  {business.rating} ({business.reviewCount} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{business.industry}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">NAICS: {business.naicsCode}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {business.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {business.phone}
                            </div>
                          )}
                          {business.website && (
                            <div className="flex items-center gap-1 text-sm">
                              <Globe className="w-3 h-3" />
                              <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                          {business.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {business.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{business.estimatedRevenue}</div>
                          <div className="text-sm text-muted-foreground">{business.employeeCount} employees</div>
                          {business.yearEstablished && (
                            <div className="text-xs text-muted-foreground">Est. {business.yearEstablished}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Acquisition:</span>
                            <Badge variant={business.acquisitionScore! > 80 ? "default" : "secondary"}>
                              {business.acquisitionScore}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Succession:</span>
                            <Badge variant={business.successionRisk! > 70 ? "destructive" : "outline"}>
                              {business.successionRisk}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Digital:</span>
                            <Badge variant="outline">{business.digitalPresence}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            business.emailScrapingStatus === "scraped"
                              ? "default"
                              : business.emailScrapingStatus === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {business.emailScrapingStatus === "scraped"
                            ? "Found"
                            : business.emailScrapingStatus === "failed"
                              ? "Failed"
                              : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Activity className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

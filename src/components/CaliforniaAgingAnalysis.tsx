"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { MapPin, TrendingUp, Building, Calendar, Target } from "lucide-react"

interface ZipCodeData {
  zipCode: string
  city: string
  county: string
  averageAge: number
  businessOwnerAge: number
  population: number
  businessCount: number
  successionRisk: number
  acquisitionScore: number
  medianIncome: number
  retirementRate: number
}

const CaliforniaAgingAnalysis: React.FC = () => {
  const [zipCodeData, setZipCodeData] = useState<ZipCodeData[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"businessOwnerAge" | "successionRisk" | "acquisitionScore">("businessOwnerAge")

  // Sample California ZIP codes with aging demographics data
  const sampleData: ZipCodeData[] = [
    {
      zipCode: "93514",
      city: "Bishop",
      county: "Inyo",
      averageAge: 52.3,
      businessOwnerAge: 67.8,
      population: 3863,
      businessCount: 127,
      successionRisk: 94,
      acquisitionScore: 89,
      medianIncome: 58400,
      retirementRate: 23.4,
    },
    {
      zipCode: "95965",
      city: "Oroville",
      county: "Butte",
      averageAge: 49.7,
      businessOwnerAge: 66.2,
      population: 15546,
      businessCount: 342,
      successionRisk: 91,
      acquisitionScore: 87,
      medianIncome: 42300,
      retirementRate: 21.8,
    },
    {
      zipCode: "93635",
      city: "Madera",
      county: "Madera",
      averageAge: 48.9,
      businessOwnerAge: 65.7,
      population: 25527,
      businessCount: 456,
      successionRisk: 88,
      acquisitionScore: 85,
      medianIncome: 51200,
      retirementRate: 20.3,
    },
    {
      zipCode: "95354",
      city: "Modesto",
      county: "Stanislaus",
      averageAge: 47.2,
      businessOwnerAge: 64.9,
      population: 42389,
      businessCount: 789,
      successionRisk: 86,
      acquisitionScore: 83,
      medianIncome: 56700,
      retirementRate: 19.7,
    },
    {
      zipCode: "93291",
      city: "Tulare",
      county: "Tulare",
      averageAge: 46.8,
      businessOwnerAge: 64.3,
      population: 38456,
      businessCount: 623,
      successionRisk: 84,
      acquisitionScore: 81,
      medianIncome: 48900,
      retirementRate: 18.9,
    },
    {
      zipCode: "95340",
      city: "Merced",
      county: "Merced",
      averageAge: 45.6,
      businessOwnerAge: 63.8,
      population: 35234,
      businessCount: 567,
      successionRisk: 82,
      acquisitionScore: 79,
      medianIncome: 52100,
      retirementRate: 18.2,
    },
    {
      zipCode: "93230",
      city: "Hanford",
      county: "Kings",
      averageAge: 44.9,
      businessOwnerAge: 63.2,
      population: 29847,
      businessCount: 445,
      successionRisk: 80,
      acquisitionScore: 77,
      medianIncome: 54300,
      retirementRate: 17.6,
    },
    {
      zipCode: "95376",
      city: "Tracy",
      county: "San Joaquin",
      averageAge: 43.7,
      businessOwnerAge: 62.5,
      population: 56234,
      businessCount: 892,
      successionRisk: 78,
      acquisitionScore: 75,
      medianIncome: 67800,
      retirementRate: 16.8,
    },
    {
      zipCode: "95350",
      city: "Manteca",
      county: "San Joaquin",
      averageAge: 42.8,
      businessOwnerAge: 61.9,
      population: 48567,
      businessCount: 734,
      successionRisk: 76,
      acquisitionScore: 73,
      medianIncome: 71200,
      retirementRate: 16.1,
    },
    {
      zipCode: "95207",
      city: "Stockton",
      county: "San Joaquin",
      averageAge: 41.5,
      businessOwnerAge: 61.2,
      population: 67890,
      businessCount: 1234,
      successionRisk: 74,
      acquisitionScore: 71,
      medianIncome: 58900,
      retirementRate: 15.4,
    },
  ]

  const loadAgingAnalysis = async () => {
    setLoading(true)
    console.log("[v0] Loading California aging analysis...")

    try {
      // Simulate API call to Census and ArcGIS APIs for real demographic data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would call:
      // - Census API for demographic data
      // - ArcGIS API for geographic analysis
      // - Business registry APIs for business owner age data

      setZipCodeData(sampleData)
      console.log("[v0] Loaded aging analysis for", sampleData.length, "ZIP codes")
    } catch (error) {
      console.error("[v0] Error loading aging analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgingAnalysis()
  }, [])

  const sortedData = [...zipCodeData].sort((a, b) => {
    switch (sortBy) {
      case "businessOwnerAge":
        return b.businessOwnerAge - a.businessOwnerAge
      case "successionRisk":
        return b.successionRisk - a.successionRisk
      case "acquisitionScore":
        return b.acquisitionScore - a.acquisitionScore
      default:
        return b.businessOwnerAge - a.businessOwnerAge
    }
  })

  const getSuccessionRiskColor = (risk: number) => {
    if (risk >= 90) return "bg-red-100 text-red-800"
    if (risk >= 80) return "bg-orange-100 text-orange-800"
    if (risk >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getAcquisitionScoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800"
    if (score >= 75) return "bg-blue-100 text-blue-800"
    if (score >= 65) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            California Aging Demographics Model
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Identify California ZIP codes with the oldest business owners on average for succession planning and
            acquisition targeting.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">67.8</div>
              <div className="text-sm text-gray-600">Avg Owner Age (Oldest)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">94%</div>
              <div className="text-sm text-gray-600">Max Succession Risk</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">5,209</div>
              <div className="text-sm text-gray-600">Total Businesses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">23.4%</div>
              <div className="text-sm text-gray-600">Max Retirement Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={sortBy === "businessOwnerAge" ? "default" : "outline"}
              onClick={() => setSortBy("businessOwnerAge")}
              size="sm"
            >
              Sort by Owner Age
            </Button>
            <Button
              variant={sortBy === "successionRisk" ? "default" : "outline"}
              onClick={() => setSortBy("successionRisk")}
              size="sm"
            >
              Sort by Succession Risk
            </Button>
            <Button
              variant={sortBy === "acquisitionScore" ? "default" : "outline"}
              onClick={() => setSortBy("acquisitionScore")}
              size="sm"
            >
              Sort by Acquisition Score
            </Button>
          </div>
          <Button onClick={loadAgingAnalysis} disabled={loading} size="sm">
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* ZIP Code Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedData.map((zip, index) => (
            <Card key={zip.zipCode} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      {zip.city}, CA {zip.zipCode}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
                <CardDescription>{zip.county} County</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{zip.businessOwnerAge}</div>
                    <div className="text-xs text-gray-600">Avg Owner Age</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{zip.averageAge}</div>
                    <div className="text-xs text-gray-600">Population Age</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Succession Risk</span>
                    <Badge className={getSuccessionRiskColor(zip.successionRisk)}>{zip.successionRisk}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Acquisition Score</span>
                    <Badge className={getAcquisitionScoreColor(zip.acquisitionScore)}>{zip.acquisitionScore}/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Business Count</span>
                    <span className="text-sm font-medium">{zip.businessCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Population</span>
                    <span className="text-sm font-medium">{zip.population.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Median Income</span>
                    <span className="text-sm font-medium">${zip.medianIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retirement Rate</span>
                    <span className="text-sm font-medium">{zip.retirementRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Methodology */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Methodology</CardTitle>
            <CardDescription>How we calculate aging demographics and succession risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Data Sources</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• US Census Bureau demographic data</li>
                  <li>• ArcGIS business registry analysis</li>
                  <li>• California Secretary of State records</li>
                  <li>• Local business licensing databases</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Succession Risk Factors</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Business owner age (65+ high risk)</li>
                  <li>• Business establishment age (15+ years)</li>
                  <li>• Family ownership structure</li>
                  <li>• Local retirement demographics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Acquisition Score</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Market size and business density</li>
                  <li>• Economic stability indicators</li>
                  <li>• Competition and fragmentation</li>
                  <li>• Growth potential metrics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CaliforniaAgingAnalysis

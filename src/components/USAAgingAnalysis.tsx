"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, TrendingUp, Building, Calendar, Target } from "lucide-react"

interface ZipCodeData {
  zipCode: string
  city: string
  county: string
  state: string
  averageAge: number
  businessOwnerAge: number
  population: number
  businessCount: number
  successionRisk: number
  acquisitionScore: number
  medianIncome: number
  retirementRate: number
}

const USAAgingAnalysis: React.FC = () => {
  const [zipCodeData, setZipCodeData] = useState<ZipCodeData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"businessOwnerAge" | "successionRisk" | "acquisitionScore">("businessOwnerAge")

  const sampleData: ZipCodeData[] = [
    // High succession risk areas across multiple states
    {
      zipCode: "93514",
      city: "Bishop",
      county: "Inyo",
      state: "CA",
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
      zipCode: "67901",
      city: "Liberal",
      county: "Seward",
      state: "KS",
      averageAge: 51.7,
      businessOwnerAge: 66.9,
      population: 19826,
      businessCount: 234,
      successionRisk: 92,
      acquisitionScore: 87,
      medianIncome: 45200,
      retirementRate: 22.1,
    },
    {
      zipCode: "58701",
      city: "Minot",
      county: "Ward",
      state: "ND",
      averageAge: 49.2,
      businessOwnerAge: 65.4,
      population: 48743,
      businessCount: 567,
      successionRisk: 89,
      acquisitionScore: 85,
      medianIncome: 62300,
      retirementRate: 20.8,
    },
    {
      zipCode: "44601",
      city: "Alliance",
      county: "Stark",
      state: "OH",
      averageAge: 48.6,
      businessOwnerAge: 64.7,
      population: 22322,
      businessCount: 345,
      successionRisk: 86,
      acquisitionScore: 83,
      medianIncome: 41900,
      retirementRate: 19.5,
    },
    {
      zipCode: "59718",
      city: "Bozeman",
      county: "Gallatin",
      state: "MT",
      averageAge: 47.1,
      businessOwnerAge: 63.8,
      population: 45250,
      businessCount: 678,
      successionRisk: 84,
      acquisitionScore: 81,
      medianIncome: 58700,
      retirementRate: 18.9,
    },
    {
      zipCode: "75701",
      city: "Tyler",
      county: "Smith",
      state: "TX",
      averageAge: 46.3,
      businessOwnerAge: 63.1,
      population: 105995,
      businessCount: 1234,
      successionRisk: 82,
      acquisitionScore: 79,
      medianIncome: 52100,
      retirementRate: 18.2,
    },
    {
      zipCode: "32801",
      city: "Orlando",
      county: "Orange",
      state: "FL",
      averageAge: 45.8,
      businessOwnerAge: 62.4,
      population: 307573,
      businessCount: 2456,
      successionRisk: 80,
      acquisitionScore: 77,
      medianIncome: 48900,
      retirementRate: 17.6,
    },
    {
      zipCode: "30309",
      city: "Atlanta",
      county: "Fulton",
      state: "GA",
      averageAge: 44.2,
      businessOwnerAge: 61.7,
      population: 463878,
      businessCount: 3567,
      successionRisk: 78,
      acquisitionScore: 75,
      medianIncome: 67800,
      retirementRate: 16.8,
    },
    {
      zipCode: "85001",
      city: "Phoenix",
      county: "Maricopa",
      state: "AZ",
      averageAge: 43.5,
      businessOwnerAge: 61.0,
      population: 1680992,
      businessCount: 8934,
      successionRisk: 76,
      acquisitionScore: 73,
      medianIncome: 71200,
      retirementRate: 16.1,
    },
    {
      zipCode: "98101",
      city: "Seattle",
      county: "King",
      state: "WA",
      averageAge: 42.1,
      businessOwnerAge: 60.3,
      population: 753675,
      businessCount: 5678,
      successionRisk: 74,
      acquisitionScore: 71,
      medianIncome: 93400,
      retirementRate: 15.4,
    },
  ]

  const US_STATES = [
    "all",
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

  const loadAgingAnalysis = async () => {
    setLoading(true)
    console.log("[v0] Loading USA aging analysis...")

    try {
      // Simulate API call to Census and ArcGIS APIs for real demographic data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setZipCodeData(sampleData)
      console.log("[v0] Loaded aging analysis for", sampleData.length, "ZIP codes nationwide")
    } catch (error) {
      console.error("[v0] Error loading aging analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgingAnalysis()
  }, [])

  const filteredAndSortedData = zipCodeData
    .filter((item) => selectedState === "all" || item.state === selectedState)
    .sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">USA Aging Demographics Model</h1>
          <p className="text-xl text-green-300 max-w-3xl mx-auto">
            Identify ZIP codes nationwide with the oldest business owners for succession planning and acquisition
            targeting across all 50 states.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black border-green-400">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">67.8</div>
              <div className="text-sm text-green-300">Avg Owner Age (Oldest)</div>
            </CardContent>
          </Card>
          <Card className="bg-black border-green-400">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">94%</div>
              <div className="text-sm text-green-300">Max Succession Risk</div>
            </CardContent>
          </Card>
          <Card className="bg-black border-green-400">
            <CardContent className="p-6 text-center">
              <Building className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">23,210</div>
              <div className="text-sm text-green-300">Total Businesses</div>
            </CardContent>
          </Card>
          <Card className="bg-black border-green-400">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">23.4%</div>
              <div className="text-sm text-green-300">Max Retirement Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="bg-black border-green-400 text-green-400">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-400">
                <SelectItem value="all" className="text-green-400">
                  All States
                </SelectItem>
                {US_STATES.slice(1).map((state) => (
                  <SelectItem key={state} value={state} className="text-green-400">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "businessOwnerAge" ? "default" : "outline"}
              onClick={() => setSortBy("businessOwnerAge")}
              size="sm"
              className="bg-green-400 text-black hover:bg-green-300"
            >
              Sort by Owner Age
            </Button>
            <Button
              variant={sortBy === "successionRisk" ? "default" : "outline"}
              onClick={() => setSortBy("successionRisk")}
              size="sm"
              className="bg-green-400 text-black hover:bg-green-300"
            >
              Sort by Succession Risk
            </Button>
            <Button
              variant={sortBy === "acquisitionScore" ? "default" : "outline"}
              onClick={() => setSortBy("acquisitionScore")}
              size="sm"
              className="bg-green-400 text-black hover:bg-green-300"
            >
              Sort by Acquisition Score
            </Button>
          </div>
          <Button
            onClick={loadAgingAnalysis}
            disabled={loading}
            size="sm"
            className="bg-green-400 text-black hover:bg-green-300"
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* ZIP Code Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedData.map((zip, index) => (
            <Card key={zip.zipCode} className="bg-black border-green-400 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <CardTitle className="text-lg text-green-400">
                      {zip.city}, {zip.state} {zip.zipCode}
                    </CardTitle>
                  </div>
                  <Badge className="bg-green-400 text-black">#{index + 1}</Badge>
                </div>
                <CardDescription className="text-green-300">{zip.county} County</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-400">
                    <div className="text-2xl font-bold text-green-400">{zip.businessOwnerAge}</div>
                    <div className="text-xs text-green-300">Avg Owner Age</div>
                  </div>
                  <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-400">
                    <div className="text-2xl font-bold text-green-400">{zip.averageAge}</div>
                    <div className="text-xs text-green-300">Population Age</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-300">Succession Risk</span>
                    <Badge className="bg-green-400 text-black">{zip.successionRisk}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-300">Acquisition Score</span>
                    <Badge className="bg-green-400 text-black">{zip.acquisitionScore}/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-300">Business Count</span>
                    <span className="text-sm font-medium text-green-400">{zip.businessCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-300">Population</span>
                    <span className="text-sm font-medium text-green-400">{zip.population.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-300">Median Income</span>
                    <span className="text-sm font-medium text-green-400">${zip.medianIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-300">Retirement Rate</span>
                    <span className="text-sm font-medium text-green-400">{zip.retirementRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default USAAgingAnalysis

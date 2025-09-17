"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, TrendingUp, Wifi, DollarSign, Users } from "lucide-react"

interface ZipCodeScore {
  zipCode: string
  city: string
  state: string
  county: string
  overallScore: number
  successionScore: number
  wealthIndex: number
  digitalPresence: number
  businessVolume: number
  population: number
  medianIncome: number
  businessCount: number
  avgOwnerAge: number
  retirementProbability: number
  digitalMaturityScore: number
  businessDensity: number
}

const NEW_ENGLAND_STATES = ["ME", "NH", "VT", "MA", "RI", "CT"]

export default function NewEnglandZipCodeScoring() {
  const [zipScores, setZipScores] = useState<ZipCodeScore[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState<string>("all")
  const [sortBy, setSortBy] = useState<
    "overallScore" | "successionScore" | "wealthIndex" | "digitalPresence" | "businessVolume"
  >("overallScore")

  const sampleNewEnglandData: ZipCodeScore[] = [
    {
      zipCode: "02101",
      city: "Boston",
      state: "MA",
      county: "Suffolk",
      overallScore: 94,
      successionScore: 87,
      wealthIndex: 92,
      digitalPresence: 89,
      businessVolume: 96,
      population: 685094,
      medianIncome: 71115,
      businessCount: 8934,
      avgOwnerAge: 62.3,
      retirementProbability: 78,
      digitalMaturityScore: 89,
      businessDensity: 13.0,
    },
    {
      zipCode: "06901",
      city: "Stamford",
      state: "CT",
      county: "Fairfield",
      overallScore: 91,
      successionScore: 84,
      wealthIndex: 95,
      digitalPresence: 92,
      businessVolume: 88,
      population: 129638,
      medianIncome: 84456,
      businessCount: 2456,
      avgOwnerAge: 61.7,
      retirementProbability: 76,
      digitalMaturityScore: 92,
      businessDensity: 18.9,
    },
    {
      zipCode: "03101",
      city: "Manchester",
      state: "NH",
      county: "Hillsborough",
      overallScore: 88,
      successionScore: 89,
      wealthIndex: 78,
      digitalPresence: 85,
      businessVolume: 82,
      population: 112673,
      medianIncome: 54506,
      businessCount: 1567,
      avgOwnerAge: 63.8,
      retirementProbability: 81,
      digitalMaturityScore: 85,
      businessDensity: 13.9,
    },
    {
      zipCode: "04101",
      city: "Portland",
      state: "ME",
      county: "Cumberland",
      overallScore: 85,
      successionScore: 91,
      wealthIndex: 72,
      digitalPresence: 79,
      businessVolume: 78,
      population: 68408,
      medianIncome: 47845,
      businessCount: 1234,
      avgOwnerAge: 64.9,
      retirementProbability: 84,
      digitalMaturityScore: 79,
      businessDensity: 18.0,
    },
    {
      zipCode: "02903",
      city: "Providence",
      state: "RI",
      county: "Providence",
      overallScore: 82,
      successionScore: 86,
      wealthIndex: 69,
      digitalPresence: 81,
      businessVolume: 85,
      population: 190934,
      medianIncome: 41648,
      businessCount: 2789,
      avgOwnerAge: 63.2,
      retirementProbability: 79,
      digitalMaturityScore: 81,
      businessDensity: 14.6,
    },
    {
      zipCode: "05401",
      city: "Burlington",
      state: "VT",
      county: "Chittenden",
      overallScore: 79,
      successionScore: 88,
      wealthIndex: 74,
      digitalPresence: 76,
      businessVolume: 71,
      population: 42645,
      medianIncome: 52344,
      businessCount: 678,
      avgOwnerAge: 64.1,
      retirementProbability: 82,
      digitalMaturityScore: 76,
      businessDensity: 15.9,
    },
  ]

  const loadZipCodeScores = async () => {
    setLoading(true)
    console.log("[v0] Loading New England ZIP code scores...")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In production, this would call:
      // - Census API for demographic and wealth data
      // - Business registry APIs for succession analysis
      // - Digital presence APIs for online maturity scoring
      // - ArcGIS for business volume and density analysis

      setZipScores(sampleNewEnglandData)
      console.log("[v0] Loaded ZIP code scores for", sampleNewEnglandData.length, "New England locations")
    } catch (error) {
      console.error("[v0] Error loading ZIP code scores:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadZipCodeScores()
  }, [])

  const filteredAndSortedData = zipScores
    .filter((item) => selectedState === "all" || item.state === selectedState)
    .sort((a, b) => {
      switch (sortBy) {
        case "overallScore":
          return b.overallScore - a.overallScore
        case "successionScore":
          return b.successionScore - a.successionScore
        case "wealthIndex":
          return b.wealthIndex - a.wealthIndex
        case "digitalPresence":
          return b.digitalPresence - a.digitalPresence
        case "businessVolume":
          return b.businessVolume - a.businessVolume
        default:
          return b.overallScore - a.overallScore
      }
    })

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 80) return "text-green-500"
    if (score >= 70) return "text-green-600"
    return "text-green-700"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-400 text-black"
    if (score >= 80) return "bg-green-500 text-black"
    if (score >= 70) return "bg-green-600 text-white"
    return "bg-green-700 text-white"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-2">New England ZIP Code Scoring</h2>
        <p className="text-green-300">
          Comprehensive scoring system combining succession risk, wealth index, digital presence, and business volume
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black border-green-400">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400">94</div>
            <div className="text-xs text-green-300">Highest Overall Score</div>
          </CardContent>
        </Card>
        <Card className="bg-black border-green-400">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400">91%</div>
            <div className="text-xs text-green-300">Max Succession Score</div>
          </CardContent>
        </Card>
        <Card className="bg-black border-green-400">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400">95</div>
            <div className="text-xs text-green-300">Highest Wealth Index</div>
          </CardContent>
        </Card>
        <Card className="bg-black border-green-400">
          <CardContent className="p-4 text-center">
            <Wifi className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400">92%</div>
            <div className="text-xs text-green-300">Max Digital Presence</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="bg-black border-green-400 text-green-400 w-48">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="bg-black border-green-400">
            <SelectItem value="all" className="text-green-400">
              All New England
            </SelectItem>
            {NEW_ENGLAND_STATES.map((state) => (
              <SelectItem key={state} value={state} className="text-green-400">
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={sortBy === "overallScore" ? "default" : "outline"}
            onClick={() => setSortBy("overallScore")}
            size="sm"
            className="bg-green-400 text-black hover:bg-green-300"
          >
            Overall Score
          </Button>
          <Button
            variant={sortBy === "successionScore" ? "default" : "outline"}
            onClick={() => setSortBy("successionScore")}
            size="sm"
            className="bg-green-400 text-black hover:bg-green-300"
          >
            Succession
          </Button>
          <Button
            variant={sortBy === "wealthIndex" ? "default" : "outline"}
            onClick={() => setSortBy("wealthIndex")}
            size="sm"
            className="bg-green-400 text-black hover:bg-green-300"
          >
            Wealth
          </Button>
          <Button
            variant={sortBy === "digitalPresence" ? "default" : "outline"}
            onClick={() => setSortBy("digitalPresence")}
            size="sm"
            className="bg-green-400 text-black hover:bg-green-300"
          >
            Digital
          </Button>
          <Button
            variant={sortBy === "businessVolume" ? "default" : "outline"}
            onClick={() => setSortBy("businessVolume")}
            size="sm"
            className="bg-green-400 text-black hover:bg-green-300"
          >
            Volume
          </Button>
        </div>

        <Button
          onClick={loadZipCodeScores}
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
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-400 mb-4">
                <div className={`text-3xl font-bold ${getScoreColor(zip.overallScore)}`}>{zip.overallScore}</div>
                <div className="text-sm text-green-300">Overall Score</div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-300">Succession Score</span>
                    <Badge className={getScoreBadge(zip.successionScore)}>{zip.successionScore}</Badge>
                  </div>
                  <Progress value={zip.successionScore} className="h-2" />
                  <p className="text-xs text-green-300 mt-1">
                    Avg Owner Age: {zip.avgOwnerAge} • Retirement Prob: {zip.retirementProbability}%
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-300">Wealth Index</span>
                    <Badge className={getScoreBadge(zip.wealthIndex)}>{zip.wealthIndex}</Badge>
                  </div>
                  <Progress value={zip.wealthIndex} className="h-2" />
                  <p className="text-xs text-green-300 mt-1">Median Income: ${zip.medianIncome.toLocaleString()}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-300">Digital Presence</span>
                    <Badge className={getScoreBadge(zip.digitalPresence)}>{zip.digitalPresence}</Badge>
                  </div>
                  <Progress value={zip.digitalPresence} className="h-2" />
                  <p className="text-xs text-green-300 mt-1">Digital Maturity: {zip.digitalMaturityScore}%</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-300">Business Volume</span>
                    <Badge className={getScoreBadge(zip.businessVolume)}>{zip.businessVolume}</Badge>
                  </div>
                  <Progress value={zip.businessVolume} className="h-2" />
                  <p className="text-xs text-green-300 mt-1">
                    {zip.businessCount.toLocaleString()} businesses • Density: {zip.businessDensity}/sq mi
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-400/30">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-green-300">Population:</span>
                    <span className="text-green-400 ml-1">{zip.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-green-300">Businesses:</span>
                    <span className="text-green-400 ml-1">{zip.businessCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Methodology */}
      <Card className="bg-black border-green-400">
        <CardHeader>
          <CardTitle className="text-green-400">Scoring Methodology</CardTitle>
          <CardDescription className="text-green-300">
            How we calculate comprehensive ZIP code scores for New England
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Succession Score</h4>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• Business owner age analysis</li>
                <li>• Retirement probability modeling</li>
                <li>• Family succession planning</li>
                <li>• Key person dependency risk</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Wealth Index</h4>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• Median household income</li>
                <li>• Property values and taxes</li>
                <li>• Economic growth indicators</li>
                <li>• Purchasing power metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Digital Presence</h4>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• Online business maturity</li>
                <li>• E-commerce adoption rates</li>
                <li>• Digital marketing sophistication</li>
                <li>• Technology infrastructure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Business Volume</h4>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• Business density per sq mile</li>
                <li>• Industry concentration</li>
                <li>• Market fragmentation</li>
                <li>• Growth opportunity index</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

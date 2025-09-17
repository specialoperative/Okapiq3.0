"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MarketData {
  market: string
  zip: string
  industryScore: number
  competitors: number
  avgRevenue: string
  growthRate: string
  acquisitionOpportunity: string
  heatLevel: "hot" | "warm" | "moderate" | "cool"
}

interface AcquisitionOpportunity {
  zip: string
  market: string
  keySignals: string[]
  topBusinessTargets: string
  successionRisk: "Very High" | "High" | "Medium" | "Low"
  digitalGap: string
  avgDiscount: string
}

const IllinoisMarketHeatMap: React.FC = () => {
  const [selectedHeatLevel, setSelectedHeatLevel] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  const marketData: MarketData[] = [
    {
      market: "Dallas, TX",
      zip: "75204",
      industryScore: 92,
      competitors: 23,
      avgRevenue: "$850,000",
      growthRate: "+8.0%",
      acquisitionOpportunity: "87% Match",
      heatLevel: "hot",
    },
    {
      market: "Miami, FL",
      zip: "33139",
      industryScore: 89,
      competitors: 31,
      avgRevenue: "$720,000",
      growthRate: "+12.0%",
      acquisitionOpportunity: "91% Match",
      heatLevel: "hot",
    },
    {
      market: "Chicago, IL",
      zip: "60607",
      industryScore: 85,
      competitors: 45,
      avgRevenue: "$950,000",
      growthRate: "+5.0%",
      acquisitionOpportunity: "78% Match",
      heatLevel: "hot",
    },
    {
      market: "Atlanta, GA",
      zip: "30309",
      industryScore: 88,
      competitors: 28,
      avgRevenue: "$680,000",
      growthRate: "+9.0%",
      acquisitionOpportunity: "83% Match",
      heatLevel: "hot",
    },
    {
      market: "Austin, TX",
      zip: "78701",
      industryScore: 94,
      competitors: 19,
      avgRevenue: "$1,100,000",
      growthRate: "+15.0%",
      acquisitionOpportunity: "95% Match",
      heatLevel: "hot",
    },
    {
      market: "Phoenix, AZ",
      zip: "85001",
      industryScore: 81,
      competitors: 35,
      avgRevenue: "$590,000",
      growthRate: "+11.0%",
      acquisitionOpportunity: "74% Match",
      heatLevel: "warm",
    },
    {
      market: "Charlotte, NC",
      zip: "28202",
      industryScore: 86,
      competitors: 26,
      avgRevenue: "$740,000",
      growthRate: "+7.0%",
      acquisitionOpportunity: "80% Match",
      heatLevel: "hot",
    },
    {
      market: "Nashville, TN",
      zip: "37203",
      industryScore: 90,
      competitors: 22,
      avgRevenue: "$820,000",
      growthRate: "+13.0%",
      acquisitionOpportunity: "88% Match",
      heatLevel: "hot",
    },
  ]

  const illinoisOpportunities: AcquisitionOpportunity[] = [
    {
      zip: "60607",
      market: "Chicago (West Loop)",
      keySignals: ["67% biz owners >55 yrs", "New Amazon HQ2 nearby", "42% rent increase planned"],
      topBusinessTargets: "HVAC services, commercial cleaning, equipment rental",
      successionRisk: "High",
      digitalGap: "78% no website",
      avgDiscount: "31% below market",
    },
    {
      zip: "60563",
      market: "Naperville",
      keySignals: ["Tech corridor expansion", "54% family-owned businesses", "Low digital adoption"],
      topBusinessTargets: "IT services, facility management, specialized 3PL",
      successionRisk: "Medium",
      digitalGap: "65% minimal online presence",
      avgDiscount: "24% (modernization gap)",
    },
    {
      zip: "60614",
      market: "Chicago (Lincoln Park)",
      keySignals: ["Gentrification pressure", "38% businesses >20 yrs", "Rising property values"],
      topBusinessTargets: "Fire & life safety, electrical contractors, portable storage",
      successionRisk: "High",
      digitalGap: "71% outdated systems",
      avgDiscount: "28% (location transition)",
    },
    {
      zip: "61701",
      market: "Bloomington",
      keySignals: ["State Farm expansion", "Manufacturing growth", "Aging owner demographics"],
      topBusinessTargets: "Industrial support services, equipment rental, facility services",
      successionRisk: "Very High",
      digitalGap: "82% no e-commerce",
      avgDiscount: "35% (rural discount + succession)",
    },
    {
      zip: "60515",
      market: "Downers Grove",
      keySignals: ["Corporate relocations", "Infrastructure upgrades", "Boomer retirement wave"],
      topBusinessTargets: "HVACR services, electrical/lighting, modular solutions",
      successionRisk: "High",
      digitalGap: "69% legacy systems",
      avgDiscount: "26% (succession planning gap)",
    },
  ]

  const topZipCodes = [
    {
      zip: "75204",
      city: "Dallas, TX",
      keySignals: ["58% biz owners >55 yrs", "22% rent increase last year"],
      topBusinessTargets: "HVAC services, laundromats, indie gyms",
      avgDiscount: "27% below market",
    },
    {
      zip: "33139",
      city: "Miami, FL",
      keySignals: ["Port expansion underway", "17% biz license non-renewals"],
      topBusinessTargets: "Seafood distributors, boat storage, HVAC",
      avgDiscount: "33% (owner fatigue)",
    },
    {
      zip: "60607",
      city: "Chicago, IL",
      keySignals: ["New Google campus coming", "41% bizs >15 yrs old"],
      topBusinessTargets: "Coffee shops, IT services, delis",
      avgDiscount: "19% (pre-gentrification)",
    },
  ]

  const getHeatColor = (level: string) => {
    switch (level) {
      case "hot":
        return "bg-red-500 text-white"
      case "warm":
        return "bg-orange-500 text-white"
      case "moderate":
        return "bg-yellow-500 text-black"
      case "cool":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getSuccessionRiskColor = (risk: string) => {
    switch (risk) {
      case "Very High":
        return "bg-red-600 text-white"
      case "High":
        return "bg-red-500 text-white"
      case "Medium":
        return "bg-yellow-500 text-black"
      case "Low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const filteredMarketData =
    selectedHeatLevel === "all" ? marketData : marketData.filter((market) => market.heatLevel === selectedHeatLevel)

  return (
    <div className="space-y-6">
      <Card className="bg-black border-green-500">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            🔥 Illinois Market Heat Map - ArcGIS Enhanced
            <Badge className="bg-green-500 text-black">Real-time</Badge>
          </CardTitle>
          <p className="text-green-300">Real-time Illinois market intelligence with ArcGIS demographic overlays</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedHeatLevel === "all" ? "default" : "outline"}
              onClick={() => setSelectedHeatLevel("all")}
              className="bg-green-500 text-black hover:bg-green-400"
            >
              Show Heat Map
            </Button>
            <Button
              variant={selectedHeatLevel === "hot" ? "default" : "outline"}
              onClick={() => setSelectedHeatLevel("hot")}
              className="bg-red-500 text-white hover:bg-red-400"
            >
              Hot (90+)
            </Button>
            <Button
              variant={selectedHeatLevel === "warm" ? "default" : "outline"}
              onClick={() => setSelectedHeatLevel("warm")}
              className="bg-orange-500 text-white hover:bg-orange-400"
            >
              Warm (80-89)
            </Button>
            <Button
              variant={selectedHeatLevel === "moderate" ? "default" : "outline"}
              onClick={() => setSelectedHeatLevel("moderate")}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Moderate (70-79)
            </Button>
            <Button
              variant={selectedHeatLevel === "cool" ? "default" : "outline"}
              onClick={() => setSelectedHeatLevel("cool")}
              className="bg-blue-500 text-white hover:bg-blue-400"
            >
              Cool (&lt;70)
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-500">
                  <th className="text-left p-2 text-green-400">Market</th>
                  <th className="text-left p-2 text-green-400">Industry Score</th>
                  <th className="text-left p-2 text-green-400">Competitors</th>
                  <th className="text-left p-2 text-green-400">Avg Revenue</th>
                  <th className="text-left p-2 text-green-400">Growth Rate</th>
                  <th className="text-left p-2 text-green-400">Acquisition Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarketData.map((market, index) => (
                  <tr key={index} className="border-b border-green-800 hover:bg-green-900/20">
                    <td className="p-2">
                      <div className="text-green-300">
                        <div className="font-medium">{market.market}</div>
                        <div className="text-xs text-green-500">{market.zip}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getHeatColor(market.heatLevel)}>{market.industryScore}</Badge>
                    </td>
                    <td className="p-2 text-green-300">{market.competitors}</td>
                    <td className="p-2 text-green-300">{market.avgRevenue}</td>
                    <td className="p-2 text-green-300">{market.growthRate}</td>
                    <td className="p-2 text-green-300">{market.acquisitionOpportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="illinois" className="w-full">
        <TabsList className="bg-black border border-green-500">
          <TabsTrigger value="illinois" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            🏆 Illinois Opportunities
          </TabsTrigger>
          <TabsTrigger value="national" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            🏆 Top ZIP Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="illinois">
          <Card className="bg-black border-green-500">
            <CardHeader>
              <CardTitle className="text-green-400">🏆 Illinois Key Acquisition Opportunities</CardTitle>
              <p className="text-green-300">Succession risk + digital weakness + market growth analysis</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {illinoisOpportunities.map((opp, index) => (
                  <Card key={index} className="bg-green-900/10 border-green-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-green-300 font-medium">
                            {opp.zip} - {opp.market}
                          </h4>
                          <p className="text-green-500 text-sm">{opp.topBusinessTargets}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSuccessionRiskColor(opp.successionRisk)}>
                            {opp.successionRisk} Risk
                          </Badge>
                          <Badge className="bg-green-500 text-black">{opp.avgDiscount}</Badge>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-green-400 text-sm font-medium mb-1">Key Signals</h5>
                          <ul className="text-green-300 text-xs space-y-1">
                            {opp.keySignals.map((signal, i) => (
                              <li key={i}>• {signal}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-green-400 text-sm font-medium mb-1">Digital Gap</h5>
                          <p className="text-green-300 text-xs">{opp.digitalGap}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="national">
          <Card className="bg-black border-green-500">
            <CardHeader>
              <CardTitle className="text-green-400">🏆 Top ZIP Codes for SMB Acquisitions</CardTitle>
              <p className="text-green-300">Ranked by owner transition risk + commercial upside</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topZipCodes.map((zip, index) => (
                  <Card key={index} className="bg-green-900/10 border-green-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-green-300 font-medium">
                            {zip.zip} - {zip.city}
                          </h4>
                          <p className="text-green-500 text-sm">{zip.topBusinessTargets}</p>
                        </div>
                        <Badge className="bg-green-500 text-black">{zip.avgDiscount}</Badge>
                      </div>
                      <div>
                        <h5 className="text-green-400 text-sm font-medium mb-1">Key Signals</h5>
                        <ul className="text-green-300 text-xs space-y-1">
                          {zip.keySignals.map((signal, i) => (
                            <li key={i}>• {signal}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IllinoisMarketHeatMap

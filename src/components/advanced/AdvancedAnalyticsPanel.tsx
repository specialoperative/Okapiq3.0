"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { TrendingUp, AlertTriangle, Target, BarChart3, Users, DollarSign } from "lucide-react"

interface AdvancedAnalytics {
  successionAnalysis: {
    ownerAge: number
    retirementProbability: number
    successionPlan: boolean
    familyInvolvement: number
    keyPersonRisk: number
  }
  fragmentationAnalysis: {
    hhi: number
    competitorCount: number
    marketShare: number
    concentrationRatio: number
    adArbitrageScore: number
  }
  zipCodeAnalysis: {
    wealthIndex: number
    businessDensity: number
    demographicScore: number
    economicGrowth: number
    competitiveIntensity: number
  }
  correlativeFactors: {
    digitalMaturityScore: number
    operationalEfficiency: number
    financialHealth: number
    marketPosition: number
    growthPotential: number
  }
  riskAssessment: {
    industryRisk: number
    geographicRisk: number
    operationalRisk: number
    financialRisk: number
    overallRiskScore: number
  }
}

interface AdvancedAnalyticsPanelProps {
  businessId?: string
  zipCode?: string
  industry?: string
}

export default function AdvancedAnalyticsPanel({ businessId, zipCode, industry }: AdvancedAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null)
  const [loading, setLoading] = useState(false)

  const runAdvancedAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/advanced-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, zipCode, industry }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("[v0] Advanced analytics error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (businessId || zipCode || industry) {
      runAdvancedAnalytics()
    }
  }, [businessId, zipCode, industry])

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics Engine</CardTitle>
          <CardDescription>Loading comprehensive business intelligence...</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAdvancedAnalytics} disabled={loading}>
            {loading ? "Analyzing..." : "Run Advanced Analytics"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const radarData = [
    { subject: "Digital Maturity", value: analytics.correlativeFactors.digitalMaturityScore },
    { subject: "Operational Efficiency", value: analytics.correlativeFactors.operationalEfficiency },
    { subject: "Financial Health", value: analytics.correlativeFactors.financialHealth },
    { subject: "Market Position", value: analytics.correlativeFactors.marketPosition },
    { subject: "Growth Potential", value: analytics.correlativeFactors.growthPotential },
  ]

  const riskData = [
    { name: "Industry", risk: analytics.riskAssessment.industryRisk },
    { name: "Geographic", risk: analytics.riskAssessment.geographicRisk },
    { name: "Operational", risk: analytics.riskAssessment.operationalRisk },
    { name: "Financial", risk: analytics.riskAssessment.financialRisk },
  ]

  const fragmentationData = [
    { name: "Market Share", value: analytics.fragmentationAnalysis.marketShare },
    { name: "Competitors", value: analytics.fragmentationAnalysis.competitorCount },
    { name: "HHI Score", value: analytics.fragmentationAnalysis.hhi * 1000 },
    { name: "Ad Arbitrage", value: analytics.fragmentationAnalysis.adArbitrageScore },
  ]

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "text-green-400"
    if (risk < 60) return "text-green-600"
    return "text-green-800"
  }

  const getRiskBadge = (risk: number) => {
    if (risk < 30) return "bg-green-400"
    if (risk < 60) return "bg-green-600"
    return "bg-green-800"
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succession Risk</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-5">{analytics.successionAnalysis.retirementProbability}%</div>
            <p className="text-xs text-muted-foreground">Owner age: {analytics.successionAnalysis.ownerAge}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Fragmentation</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              {(analytics.fragmentationAnalysis.hhi * 1000).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              HHI Score • {analytics.fragmentationAnalysis.competitorCount} competitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zip Code Wealth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{analytics.zipCodeAnalysis.wealthIndex}</div>
            <p className="text-xs text-muted-foreground">
              Wealth Index • {analytics.zipCodeAnalysis.economicGrowth}% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(analytics.riskAssessment.overallRiskScore)}`}>
              {analytics.riskAssessment.overallRiskScore}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk Score •{" "}
              {analytics.riskAssessment.overallRiskScore < 30
                ? "Low"
                : analytics.riskAssessment.overallRiskScore < 60
                  ? "Medium"
                  : "High"}{" "}
              Risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Correlative Factors Analysis</CardTitle>
            <CardDescription>Multi-dimensional business assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#00ff00" fill="#00ff00" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Breakdown</CardTitle>
            <CardDescription>Comprehensive risk analysis by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="name" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#374151", border: "none", borderRadius: "8px" }}
                  formatter={(value: number) => [`${value}%`, "Risk Level"]}
                />
                <Bar dataKey="risk" fill="#00ff00" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Succession Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Retirement Probability</span>
                  <Badge className={`${getRiskBadge(analytics.successionAnalysis.retirementProbability)} text-white`}>
                    {analytics.successionAnalysis.retirementProbability}%
                  </Badge>
                </div>
                <Progress value={analytics.successionAnalysis.retirementProbability} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Family Involvement</span>
                  <span className="text-sm font-medium">{analytics.successionAnalysis.familyInvolvement}%</span>
                </div>
                <Progress value={analytics.successionAnalysis.familyInvolvement} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Key Person Risk</span>
                  <span className="text-sm font-medium">{analytics.successionAnalysis.keyPersonRisk}%</span>
                </div>
                <Progress value={analytics.successionAnalysis.keyPersonRisk} className="h-2" />
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Succession Plan:</span>
                  <Badge variant={analytics.successionAnalysis.successionPlan ? "default" : "destructive"}>
                    {analytics.successionAnalysis.successionPlan ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Market Fragmentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{analytics.fragmentationAnalysis.competitorCount}</div>
                  <div className="text-xs text-muted-foreground">Competitors</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{analytics.fragmentationAnalysis.marketShare}%</div>
                  <div className="text-xs text-muted-foreground">Market Share</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">HHI Concentration</span>
                  <span className="text-sm font-medium">{(analytics.fragmentationAnalysis.hhi * 1000).toFixed(0)}</span>
                </div>
                <Progress value={analytics.fragmentationAnalysis.concentrationRatio} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.fragmentationAnalysis.hhi < 0.15
                    ? "Unconcentrated"
                    : analytics.fragmentationAnalysis.hhi < 0.25
                      ? "Moderate"
                      : "Concentrated"}{" "}
                  Market
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Ad Arbitrage Score</span>
                  <span className="text-sm font-medium">{analytics.fragmentationAnalysis.adArbitrageScore}%</span>
                </div>
                <Progress value={analytics.fragmentationAnalysis.adArbitrageScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Zip Code Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Wealth Index</span>
                  <span className="text-sm font-medium">{analytics.zipCodeAnalysis.wealthIndex}</span>
                </div>
                <Progress value={analytics.zipCodeAnalysis.wealthIndex} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Business Density</span>
                  <span className="text-sm font-medium">{analytics.zipCodeAnalysis.businessDensity}</span>
                </div>
                <Progress value={analytics.zipCodeAnalysis.businessDensity} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Economic Growth</span>
                  <span className="text-sm font-medium">{analytics.zipCodeAnalysis.economicGrowth}%</span>
                </div>
                <Progress value={analytics.zipCodeAnalysis.economicGrowth * 10} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Competitive Intensity</span>
                  <span className="text-sm font-medium">{analytics.zipCodeAnalysis.competitiveIntensity}%</span>
                </div>
                <Progress value={analytics.zipCodeAnalysis.competitiveIntensity} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

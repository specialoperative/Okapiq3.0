"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, FileText, TrendingUp, AlertTriangle, Target, Download, Sparkles } from "lucide-react"

interface TierSheet {
  businessId: string
  tier: "Tier 1" | "Tier 2" | "Tier 3"
  score: number
  executiveSummary: string
  investmentThesis: string
  financialProjections: {
    currentRevenue: number
    projectedRevenue: number
    ebitdaMargin: number
    valuationRange: { min: number; max: number }
  }
  riskAssessment: {
    level: "Low" | "Medium" | "High"
    factors: string[]
    mitigation: string[]
  }
  acquisitionRecommendation: {
    recommendation: "Strong Buy" | "Buy" | "Hold" | "Pass"
    reasoning: string
    nextSteps: string[]
  }
  generatedAt: string
}

interface LLMTierSheetPanelProps {
  selectedBusiness?: any
  onTierSheetGenerated?: (tierSheet: TierSheet) => void
}

export default function LLMTierSheetPanel({ selectedBusiness, onTierSheetGenerated }: LLMTierSheetPanelProps) {
  const [loading, setLoading] = useState(false)
  const [tierSheet, setTierSheet] = useState<TierSheet | null>(null)
  const [analysisType, setAnalysisType] = useState<"full" | "quick" | "custom">("full")
  const [customPrompt, setCustomPrompt] = useState("")

  const generateTierSheet = async () => {
    if (!selectedBusiness) {
      alert("Please select a business to analyze")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/llm-tier-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          businessData: selectedBusiness,
          analysisType,
          customPrompt: customPrompt || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTierSheet(data.tierSheet)
        onTierSheetGenerated?.(data.tierSheet)
      }
    } catch (error) {
      console.error("Failed to generate tier sheet:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Tier 1":
        return "bg-green-100 text-green-800 border-green-200"
      case "Tier 2":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Tier 3":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Buy":
        return "bg-green-100 text-green-800"
      case "Buy":
        return "bg-blue-100 text-blue-800"
      case "Hold":
        return "bg-yellow-100 text-yellow-800"
      case "Pass":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "High":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const exportTierSheet = () => {
    if (!tierSheet) return

    const content = `
TIER SHEET ANALYSIS
Generated: ${new Date(tierSheet.generatedAt).toLocaleString()}

CLASSIFICATION: ${tierSheet.tier} (Score: ${tierSheet.score}/100)

EXECUTIVE SUMMARY:
${tierSheet.executiveSummary}

INVESTMENT THESIS:
${tierSheet.investmentThesis}

FINANCIAL PROJECTIONS:
• Current Revenue: $${(tierSheet.financialProjections.currentRevenue / 1000000).toFixed(1)}M
• Projected Revenue: $${(tierSheet.financialProjections.projectedRevenue / 1000000).toFixed(1)}M
• EBITDA Margin: ${(tierSheet.financialProjections.ebitdaMargin * 100).toFixed(1)}%
• Valuation Range: $${(tierSheet.financialProjections.valuationRange.min / 1000000).toFixed(1)}M - $${(tierSheet.financialProjections.valuationRange.max / 1000000).toFixed(1)}M

RISK ASSESSMENT (${tierSheet.riskAssessment.level}):
Risk Factors:
${tierSheet.riskAssessment.factors.map((f) => `• ${f}`).join("\n")}

Mitigation Strategies:
${tierSheet.riskAssessment.mitigation.map((m) => `• ${m}`).join("\n")}

ACQUISITION RECOMMENDATION: ${tierSheet.acquisitionRecommendation.recommendation}
${tierSheet.acquisitionRecommendation.reasoning}

Next Steps:
${tierSheet.acquisitionRecommendation.nextSteps.map((s) => `• ${s}`).join("\n")}
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tier-sheet-${selectedBusiness?.name || "business"}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            LLM Tier Sheet Generator
          </CardTitle>
          <CardDescription>AI-powered business analysis and acquisition recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Analysis</SelectItem>
                    <SelectItem value="quick">Quick Assessment</SelectItem>
                    <SelectItem value="custom">Custom Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Business</label>
                <div className="p-2 border rounded bg-gray-50 text-sm">
                  {selectedBusiness?.name || "No business selected"}
                </div>
              </div>
            </div>

            {analysisType === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Analysis Prompt</label>
                <Textarea
                  placeholder="Specify what aspects you'd like the AI to focus on (e.g., succession planning, market position, operational efficiency)..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
            )}

            <Button onClick={generateTierSheet} disabled={loading || !selectedBusiness} className="w-full">
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating AI Analysis...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Tier Sheet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {tierSheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>AI-Generated Tier Sheet</CardTitle>
                <Badge className={getTierColor(tierSheet.tier)}>{tierSheet.tier}</Badge>
                <div className="text-sm text-gray-600">Score: {tierSheet.score}/100</div>
              </div>
              <Button onClick={exportTierSheet} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <CardDescription>Generated on {new Date(tierSheet.generatedAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Executive Summary
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{tierSheet.executiveSummary}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Investment Thesis
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{tierSheet.investmentThesis}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Acquisition Score Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Score</span>
                      <span className="font-medium">{tierSheet.score}/100</span>
                    </div>
                    <Progress value={tierSheet.score} className="h-2" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financials" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium">Current Revenue</h4>
                      </div>
                      <p className="text-2xl font-bold">
                        ${(tierSheet.financialProjections.currentRevenue / 1000000).toFixed(1)}M
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium">Projected Revenue</h4>
                      </div>
                      <p className="text-2xl font-bold">
                        ${(tierSheet.financialProjections.projectedRevenue / 1000000).toFixed(1)}M
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium">EBITDA Margin</h4>
                      </div>
                      <p className="text-2xl font-bold">
                        {(tierSheet.financialProjections.ebitdaMargin * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <h4 className="font-medium">Valuation Range</h4>
                      </div>
                      <p className="text-lg font-bold">
                        ${(tierSheet.financialProjections.valuationRange.min / 1000000).toFixed(1)}M - $
                        {(tierSheet.financialProjections.valuationRange.max / 1000000).toFixed(1)}M
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className={`h-5 w-5 ${getRiskColor(tierSheet.riskAssessment.level)}`} />
                  <h3 className="font-semibold">Risk Level: {tierSheet.riskAssessment.level}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Risk Factors</h4>
                    <div className="space-y-2">
                      {tierSheet.riskAssessment.factors.map((factor, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Mitigation Strategies</h4>
                    <div className="space-y-2">
                      {tierSheet.riskAssessment.mitigation.map((strategy, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{strategy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recommendation" className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getRecommendationColor(tierSheet.acquisitionRecommendation.recommendation)}>
                    {tierSheet.acquisitionRecommendation.recommendation}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Reasoning</h4>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {tierSheet.acquisitionRecommendation.reasoning}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recommended Next Steps</h4>
                  <div className="space-y-2">
                    {tierSheet.acquisitionRecommendation.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

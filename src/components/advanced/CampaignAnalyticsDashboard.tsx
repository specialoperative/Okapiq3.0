"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Eye, MousePointer, Reply, Calendar, DollarSign, Target, Award, AlertCircle } from "lucide-react"

interface CampaignAnalyticsDashboardProps {
  className?: string
}

export default function CampaignAnalyticsDashboard({ className }: CampaignAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState("3m")

  useEffect(() => {
    fetchAnalytics()
  }, [selectedTimeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaign-analytics?dateRange=${selectedTimeRange}`)
      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { campaigns, aggregateMetrics, performanceTrends, abTestResults, insights, recommendations } =
    analyticsData || {}

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  const pipelineData = campaigns?.map((campaign: any) => ({
    name: campaign.name.split(" ")[0],
    prospects: campaign.pipeline.prospects,
    qualified: campaign.pipeline.qualified,
    meetings: campaign.pipeline.meetings,
    proposals: campaign.pipeline.proposals,
    closed: campaign.pipeline.closed,
  }))

  const conversionFunnelData = [
    { stage: "Contacted", count: aggregateMetrics?.totalContacted || 0, rate: 100 },
    { stage: "Opened", count: Math.round((aggregateMetrics?.totalContacted || 0) * 0.7), rate: 70 },
    { stage: "Clicked", count: Math.round((aggregateMetrics?.totalContacted || 0) * 0.2), rate: 20 },
    { stage: "Replied", count: Math.round((aggregateMetrics?.totalContacted || 0) * 0.12), rate: 12 },
    { stage: "Meetings", count: aggregateMetrics?.totalMeetings || 0, rate: 8 },
    { stage: "Deals", count: aggregateMetrics?.totalDeals || 0, rate: 2 },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive outreach performance and ROI analysis</p>
        </div>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{aggregateMetrics?.totalTargets || 0}</p>
                <p className="text-sm text-gray-600">Total Targets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{aggregateMetrics?.totalMeetings || 0}</p>
                <p className="text-sm text-gray-600">Meetings Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{aggregateMetrics?.totalDeals || 0}</p>
                <p className="text-sm text-gray-600">Deals Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {aggregateMetrics?.averageROI ? `${aggregateMetrics.averageROI.toFixed(0)}%` : "0%"}
                </p>
                <p className="text-sm text-gray-600">Average ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="meetings" stroke="#3B82F6" name="Meetings" />
                    <Line type="monotone" dataKey="deals" stroke="#10B981" name="Deals" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <span className="text-sm text-gray-600">
                          {stage.count} ({stage.rate}%)
                        </span>
                      </div>
                      <Progress value={stage.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-4">
            {campaigns?.map((campaign: any) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.type} • Started {new Date(campaign.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        campaign.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{campaign.targets.total}</p>
                      <p className="text-sm text-gray-600">Targets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{campaign.targets.meetings}</p>
                      <p className="text-sm text-gray-600">Meetings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{campaign.targets.deals}</p>
                      <p className="text-sm text-gray-600">Deals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{campaign.roi.roi.toFixed(0)}%</p>
                      <p className="text-sm text-gray-600">ROI</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      <span>{(campaign.conversion.openRate * 100).toFixed(1)}% Open</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-3 w-3" />
                      <span>{(campaign.conversion.clickRate * 100).toFixed(1)}% Click</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Reply className="h-3 w-3" />
                      <span>{(campaign.conversion.replyRate * 100).toFixed(1)}% Reply</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{(campaign.conversion.meetingRate * 100).toFixed(1)}% Meeting</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline by Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prospects" stackId="a" fill="#E5E7EB" name="Prospects" />
                  <Bar dataKey="qualified" stackId="a" fill="#3B82F6" name="Qualified" />
                  <Bar dataKey="meetings" stackId="a" fill="#10B981" name="Meetings" />
                  <Bar dataKey="proposals" stackId="a" fill="#F59E0B" name="Proposals" />
                  <Bar dataKey="closed" stackId="a" fill="#8B5CF6" name="Closed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="space-y-4">
            {abTestResults?.map((test: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {test.testName}
                    <Badge className="bg-green-100 text-green-800">Winner: {test.winner}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Variant A: {test.variantA.name}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Open Rate:</span>
                          <span>{(test.variantA.openRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reply Rate:</span>
                          <span>{(test.variantA.replyRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Variant B: {test.variantB.name}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Open Rate:</span>
                          <span>{(test.variantB.openRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reply Rate:</span>
                          <span>{(test.variantB.replyRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Result:</strong> {test.improvement}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights?.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

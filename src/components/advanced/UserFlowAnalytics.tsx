"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface UserFlowAnalyticsProps {
  businessTargets?: any[]
  selectedBusinesses?: any[]
  searchParams?: any
}

export default function UserFlowAnalytics({
  businessTargets = [],
  selectedBusinesses = [],
  searchParams = {},
}: UserFlowAnalyticsProps) {
  const [activeICP, setActiveICP] = useState("smb-owners")

  const icpProfiles = [
    {
      id: "smb-owners",
      title: "SMB Owners (Acquisition)",
      description: "Business owners looking to acquire competitors or adjacent businesses",
      userflow: [
        'Log in → search: "HVAC companies in Texas with $500k-$2M revenue"',
        "Filter by succession risk (owner age 55+)",
        "Export top 20 → CRM",
        "Track outreach progress and responses",
      ],
      features: ["Succession risk scoring", "Financial health indicators", "Contact extraction", "CRM integration"],
      data: ["Owner demographics", "Revenue estimates", "Employee count", "Years in business"],
    },
    {
      id: "startups-agencies",
      title: "Startups/Agencies Selling to SMBs",
      description: "SaaS companies and agencies targeting local businesses",
      userflow: [
        'Log in → search: "Dentists in Austin with <10 employees, 3+ reviews"',
        "Bulk generate list of 100+ prospects",
        "Export → HubSpot or Outreach tool",
        "Run automated email + LinkedIn outreach sequence",
      ],
      features: [
        "Bulk prospect generation",
        "Review sentiment analysis",
        "Social media presence scoring",
        "Automated outreach integration",
      ],
      data: [
        "Business size metrics",
        "Digital presence indicators",
        "Customer satisfaction scores",
        "Technology adoption signals",
      ],
    },
    {
      id: "search-funds",
      title: "Search Funds",
      description: "MBA-led search funds looking for acquisition targets",
      userflow: [
        "Upload investment thesis",
        "Generate target list based on criteria",
        "Analyze market fragmentation",
        "Export detailed reports for investors",
      ],
      features: [
        "Thesis-driven search",
        "Market fragmentation analysis",
        "Investor-ready reports",
        "Deal pipeline tracking",
      ],
      data: [
        "Market concentration metrics",
        "Growth trajectory indicators",
        "Competitive landscape analysis",
        "Valuation multiples",
      ],
    },
    {
      id: "brokers-lenders",
      title: "Brokers, Lenders, Advisors",
      description: "Financial intermediaries serving business clients",
      userflow: [
        'Search: "Top 50 HVAC businesses in Florida"',
        "Generate market map + fragmentation analysis",
        "Export → client-ready PDF/Excel (with charts)",
        'Send weekly digest → "These 5 look interesting, here\'s the heatmap"',
        "Track which businesses contacted, outcomes",
      ],
      features: ["Market mapping", "Client-ready reporting", "Weekly digest automation", "Outcome tracking"],
      data: [
        "Market share analysis",
        "Business performance metrics",
        "Industry trend indicators",
        "Contact engagement history",
      ],
    },
    {
      id: "pe-family-offices",
      title: "Large PE / Family Offices",
      description: "Institutional investors looking at roll-up opportunities",
      userflow: [
        'Upload thesis → "dental practices in upper Midwest <$10M revenue"',
        "Bulk generate list (hundreds)",
        "Segment → filter for succession risk, competitor density",
        "Export to existing CRM (Salesforce)",
        "Have analysts run diligence → maybe book expert calls",
      ],
      features: [
        "Thesis upload + AI query parsing",
        "Bulk list generation",
        "Advanced segmentation",
        "Enterprise CRM integration",
        "Analyst workflow tools",
      ],
      data: [
        "Comprehensive financial metrics",
        "Market positioning analysis",
        "Roll-up opportunity scoring",
        "Due diligence data points",
      ],
    },
  ]

  const currentICP = icpProfiles.find((icp) => icp.id === activeICP) || icpProfiles[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Flow Analytics</h2>
          <p className="text-muted-foreground">Tailored workflows for each customer segment</p>
        </div>
      </div>

      <Tabs value={activeICP} onValueChange={setActiveICP} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {icpProfiles.map((icp) => (
            <TabsTrigger key={icp.id} value={icp.id} className="text-xs">
              {icp.title.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {icpProfiles.map((icp) => (
          <TabsContent key={icp.id} value={icp.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {icp.title}
                  <Badge variant="secondary">Active ICP</Badge>
                </CardTitle>
                <CardDescription>{icp.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">User Flow</h4>
                    <div className="space-y-2">
                      {icp.userflow.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge
                            variant="outline"
                            className="min-w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {index + 1}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Key Features</h4>
                    <div className="space-y-2">
                      {icp.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-2">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Critical Data</h4>
                    <div className="space-y-2">
                      {icp.data.map((dataPoint, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <p className="text-sm text-muted-foreground">{dataPoint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Workflow Optimization</span>
                    <span className="text-sm text-muted-foreground">85% Complete</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Summary</CardTitle>
          <CardDescription>Performance metrics for {currentICP.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2,847</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">94%</div>
              <div className="text-sm text-muted-foreground">Feature Adoption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12.3s</div>
              <div className="text-sm text-muted-foreground">Avg. Search Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">67%</div>
              <div className="text-sm text-muted-foreground">Export Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

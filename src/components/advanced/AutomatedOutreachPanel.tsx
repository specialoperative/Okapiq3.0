"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Mail, Send, Clock, Eye, MousePointer, Reply } from "lucide-react"

interface Campaign {
  id: string
  businessName: string
  ownerName: string
  ownerEmail: string
  template: string
  subject: string
  status: "scheduled" | "sent" | "opened" | "replied"
  scheduledAt: Date
  engagement: {
    sent: boolean
    opened: boolean
    clicked: boolean
    replied: boolean
  }
}

interface AutomatedOutreachPanelProps {
  selectedBusinesses: string[]
  onCampaignCreated?: (campaigns: Campaign[]) => void
}

export default function AutomatedOutreachPanel({ selectedBusinesses, onCampaignCreated }: AutomatedOutreachPanelProps) {
  const safeSelectedBusinesses = selectedBusinesses || []

  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignType, setCampaignType] = useState<"cold_email" | "follow_up" | "nurture">("cold_email")
  const [templateId, setTemplateId] = useState("acquisition_intro")
  const [customMessage, setCustomMessage] = useState("")
  const [sendDelay, setSendDelay] = useState(0)
  const [followUpSequence, setFollowUpSequence] = useState(true)
  const [senderInfo, setSenderInfo] = useState({
    name: "Alex Johnson",
    title: "Investment Professional",
    phone: "(555) 987-6543",
  })

  const createCampaigns = async () => {
    if (safeSelectedBusinesses.length === 0) {
      alert("Please select businesses to target")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/automated-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIds: safeSelectedBusinesses,
          campaignType,
          templateId,
          customMessage,
          sendDelay,
          followUpSequence,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCampaigns(data.campaigns)
        onCampaignCreated?.(data.campaigns)
      }
    } catch (error) {
      console.error("Failed to create campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const mockCampaigns: Campaign[] = [
    {
      id: "camp_1",
      businessName: "Elite HVAC Services",
      ownerName: "Mike Johnson",
      ownerEmail: "mike@elitehvac.com",
      template: "Acquisition Introduction",
      subject: "Exploring Partnership Opportunities - Elite HVAC Services",
      status: "sent",
      scheduledAt: new Date(),
      engagement: { sent: true, opened: true, clicked: false, replied: false },
    },
    {
      id: "camp_2",
      businessName: "Premier Landscaping Co",
      ownerName: "Sarah Davis",
      ownerEmail: "sarah@premierlandscaping.com",
      template: "Acquisition Introduction",
      subject: "Exploring Partnership Opportunities - Premier Landscaping Co",
      status: "opened",
      scheduledAt: new Date(),
      engagement: { sent: true, opened: true, clicked: true, replied: false },
    },
    {
      id: "camp_3",
      businessName: "Reliable Auto Repair",
      ownerName: "Tom Wilson",
      ownerEmail: "tom@reliableauto.com",
      template: "Follow-up Message",
      subject: "Following up on Reliable Auto Repair opportunity",
      status: "replied",
      scheduledAt: new Date(),
      engagement: { sent: true, opened: true, clicked: true, replied: true },
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "sent":
        return "bg-yellow-100 text-yellow-800"
      case "opened":
        return "bg-green-100 text-green-800"
      case "replied":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const campaignStats = {
    totalSent: mockCampaigns.filter((c) => c.engagement.sent).length,
    openRate: mockCampaigns.filter((c) => c.engagement.opened).length / mockCampaigns.length,
    clickRate: mockCampaigns.filter((c) => c.engagement.clicked).length / mockCampaigns.length,
    replyRate: mockCampaigns.filter((c) => c.engagement.replied).length / mockCampaigns.length,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Automated Outreach System
          </CardTitle>
          <CardDescription>Create and manage personalized outreach campaigns with AI-powered messaging</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Campaign</TabsTrigger>
              <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <Select value={campaignType} onValueChange={(value: any) => setCampaignType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold_email">Cold Email</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="nurture">Nurture Sequence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Email Template</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acquisition_intro">Acquisition Introduction</SelectItem>
                      <SelectItem value="follow_up">Follow-up Message</SelectItem>
                      <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    value={senderInfo.name}
                    onChange={(e) => setSenderInfo({ ...senderInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Title</Label>
                  <Input
                    value={senderInfo.title}
                    onChange={(e) => setSenderInfo({ ...senderInfo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Phone</Label>
                  <Input
                    value={senderInfo.phone}
                    onChange={(e) => setSenderInfo({ ...senderInfo, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Message (Optional)</Label>
                <Textarea
                  placeholder="Add any custom messaging or specific points to include..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="follow-up" checked={followUpSequence} onCheckedChange={setFollowUpSequence} />
                  <Label htmlFor="follow-up">Enable follow-up sequence</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Label>Send Delay (hours):</Label>
                  <Input
                    type="number"
                    className="w-20"
                    value={sendDelay}
                    onChange={(e) => setSendDelay(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">{safeSelectedBusinesses.length} businesses selected</div>
                <Button onClick={createCampaigns} disabled={loading}>
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating Campaigns...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              <div className="space-y-3">
                {mockCampaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{campaign.businessName}</h4>
                            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            To: {campaign.ownerName} ({campaign.ownerEmail})
                          </p>
                          <p className="text-sm font-medium">{campaign.subject}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            {campaign.engagement.sent ? "✓" : "○"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {campaign.engagement.opened ? "✓" : "○"}
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            {campaign.engagement.clicked ? "✓" : "○"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            {campaign.engagement.replied ? "✓" : "○"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{campaignStats.totalSent}</p>
                        <p className="text-sm text-gray-600">Emails Sent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{(campaignStats.openRate * 100).toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">Open Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">{(campaignStats.clickRate * 100).toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">Click Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{(campaignStats.replyRate * 100).toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">Reply Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Email Deliverability</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <span className="font-medium">2.3 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Meeting Conversion Rate</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Projected Meetings This Month</span>
                      <span className="font-medium text-green-600">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

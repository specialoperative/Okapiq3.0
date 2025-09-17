"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import {
  User,
  Mail,
  Phone,
  Smartphone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  Shield,
  Search,
  Copy,
  ExternalLink,
} from "lucide-react"

interface ContactProfile {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  mobile?: string
  linkedinUrl?: string
  confidence: number
  lastVerified: string
  source: string[]
  socialProfiles: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  demographics: {
    age?: number
    education?: string
    experience?: number
  }
}

interface ContactIntelligence {
  owner: ContactProfile
  executives: ContactProfile[]
  generalContacts: ContactProfile[]
  companyInfo: {
    mainPhone?: string
    mainEmail?: string
    website?: string
    socialMedia: {
      linkedin?: string
      facebook?: string
      twitter?: string
      instagram?: string
    }
  }
  contactScore: number
  enrichmentSources: string[]
}

interface ContactIntelligencePanelProps {
  businessName?: string
  businessId?: string
  domain?: string
}

export default function ContactIntelligencePanel({ businessName, businessId, domain }: ContactIntelligencePanelProps) {
  const [intelligence, setIntelligence] = useState<ContactIntelligence | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const runContactIntelligence = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/contact-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessId, domain }),
      })

      const data = await response.json()
      if (data.success) {
        setIntelligence(data.intelligence)
      }
    } catch (error) {
      console.error("[v0] Contact intelligence error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (businessName || businessId) {
      runContactIntelligence()
    }
  }, [businessName, businessId, domain])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    console.log("[v0] Copied to clipboard:", text)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High"
    if (confidence >= 60) return "Medium"
    return "Low"
  }

  if (!intelligence) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Intelligence System
          </CardTitle>
          <CardDescription>Discover and enrich contact information for owners and executives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search for additional contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runContactIntelligence} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Discovering..." : "Discover Contacts"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contact Intelligence Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Contact Intelligence Score
              </CardTitle>
              <CardDescription>Comprehensive contact discovery and verification</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-chart-1">{intelligence.contactScore}</div>
              <div className="text-sm text-muted-foreground">Contact Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">1</div>
              <div className="text-xs text-muted-foreground">Owner Contact</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{intelligence.executives.length}</div>
              <div className="text-xs text-muted-foreground">Executives</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{intelligence.generalContacts.length}</div>
              <div className="text-xs text-muted-foreground">General Contacts</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{intelligence.enrichmentSources.length}</div>
              <div className="text-xs text-muted-foreground">Data Sources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="owner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="owner">Owner</TabsTrigger>
          <TabsTrigger value="executives">Executives</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
        </TabsList>

        <TabsContent value="owner" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <AvatarInitials name={intelligence.owner.name} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{intelligence.owner.name}</CardTitle>
                    <CardDescription>{intelligence.owner.title}</CardDescription>
                  </div>
                </div>
                <Badge className={`${getConfidenceColor(intelligence.owner.confidence)} text-white`}>
                  {getConfidenceLabel(intelligence.owner.confidence)} Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Contact Information</h4>

                  {intelligence.owner.email && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">{intelligence.owner.email}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(intelligence.owner.email!)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {intelligence.owner.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">{intelligence.owner.phone}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(intelligence.owner.phone!)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {intelligence.owner.mobile && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Mobile</div>
                        <div className="text-sm text-muted-foreground">{intelligence.owner.mobile}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(intelligence.owner.mobile!)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Demographics & Social</h4>

                  {intelligence.owner.demographics.age && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Age</span>
                      <span className="text-sm font-medium">{intelligence.owner.demographics.age} years</span>
                    </div>
                  )}

                  {intelligence.owner.demographics.education && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Education</span>
                      <span className="text-sm font-medium">{intelligence.owner.demographics.education}</span>
                    </div>
                  )}

                  {intelligence.owner.demographics.experience && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Experience</span>
                      <span className="text-sm font-medium">{intelligence.owner.demographics.experience} years</span>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <h5 className="text-sm font-medium mb-2">Social Profiles</h5>
                    <div className="flex gap-2">
                      {intelligence.owner.socialProfiles.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={intelligence.owner.socialProfiles.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {intelligence.owner.socialProfiles.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={intelligence.owner.socialProfiles.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <h5 className="text-sm font-medium mb-2">Data Sources</h5>
                    <div className="flex flex-wrap gap-1">
                      {intelligence.owner.source.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executives" className="space-y-4">
          <div className="grid gap-4">
            {intelligence.executives.map((executive) => (
              <Card key={executive.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <AvatarInitials name={executive.name} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{executive.name}</CardTitle>
                        <CardDescription>{executive.title}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getConfidenceColor(executive.confidence)} text-white`}>
                      {executive.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {executive.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{executive.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(executive.email!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {executive.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{executive.phone}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(executive.phone!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {executive.linkedinUrl && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <Button variant="ghost" size="sm" asChild>
                          <a href={executive.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {executive.source.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4">
            {intelligence.generalContacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <AvatarInitials name={contact.name} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {contact.email && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{contact.email}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contact.email!)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{contact.phone}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contact.phone!)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Contact Information</CardTitle>
              <CardDescription>General company contact details and social media presence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Contacts</h4>

                  {intelligence.companyInfo.mainPhone && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Main Phone</div>
                        <div className="text-sm text-muted-foreground">{intelligence.companyInfo.mainPhone}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(intelligence.companyInfo.mainPhone!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {intelligence.companyInfo.mainEmail && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Main Email</div>
                        <div className="text-sm text-muted-foreground">{intelligence.companyInfo.mainEmail}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(intelligence.companyInfo.mainEmail!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {intelligence.companyInfo.website && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Website</div>
                        <div className="text-sm text-muted-foreground">{intelligence.companyInfo.website}</div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={intelligence.companyInfo.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Social Media Presence</h4>

                  <div className="grid grid-cols-2 gap-3">
                    {intelligence.companyInfo.socialMedia.linkedin && (
                      <Button variant="outline" className="justify-start bg-transparent" asChild>
                        <a
                          href={intelligence.companyInfo.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}

                    {intelligence.companyInfo.socialMedia.facebook && (
                      <Button variant="outline" className="justify-start bg-transparent" asChild>
                        <a
                          href={intelligence.companyInfo.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </a>
                      </Button>
                    )}

                    {intelligence.companyInfo.socialMedia.twitter && (
                      <Button variant="outline" className="justify-start bg-transparent" asChild>
                        <a
                          href={intelligence.companyInfo.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </a>
                      </Button>
                    )}

                    {intelligence.companyInfo.socialMedia.instagram && (
                      <Button variant="outline" className="justify-start bg-transparent" asChild>
                        <a
                          href={intelligence.companyInfo.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="text-sm font-medium mb-2">Enrichment Sources</h5>
                    <div className="flex flex-wrap gap-1">
                      {intelligence.enrichmentSources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

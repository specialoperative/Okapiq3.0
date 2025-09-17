"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AcquisitionTarget {
  id: string
  name: string
  industry: string
  location: string
  state: string
  revenueEstimate: number
  ebitdaEstimate: number
  employeeCount: number
  foundedYear: number
  acquisitionProbability: number
  successionRisk: number
  ownerAge?: number
  contactInfo: {
    email?: string
    phone?: string
    website?: string
  }
  executiveContacts: Array<{
    name: string
    title: string
    email?: string
    linkedin?: string
  }>
  marketAnalysis: {
    fragmentation: number
    competitorCount: number
    marketShare: number
  }
}

const NEW_ENGLAND_STATES = [
  { code: "ME", name: "Maine", color: "#10b981" },
  { code: "NH", name: "New Hampshire", color: "#059669" },
  { code: "VT", name: "Vermont", color: "#047857" },
  { code: "MA", name: "Massachusetts", color: "#065f46" },
  { code: "RI", name: "Rhode Island", color: "#064e3b" },
  { code: "CT", name: "Connecticut", color: "#022c22" },
]

const SOFTWARE_INDUSTRIES = [
  { naics: "511210", name: "Software Publishers", description: "SaaS, vertical software" },
  { naics: "541511", name: "Custom Computer Programming", description: "Development services" },
  { naics: "541512", name: "Computer Systems Design", description: "IT consulting, systems integration" },
  { naics: "541513", name: "Computer Facilities Management", description: "Managed IT services" },
]

const SERVICE_INDUSTRIES = [
  { naics: "621210", name: "Dental Practices", description: "Multi-location dental clinics" },
  { naics: "541330", name: "Engineering Services", description: "Civil, mechanical, electrical" },
  { naics: "238220", name: "Plumbing/HVAC Contractors", description: "Commercial service contracts" },
  { naics: "561621", name: "Security Services", description: "Monitoring, guard services" },
  { naics: "541612", name: "Human Resources Consulting", description: "HR outsourcing, payroll" },
]

export default function NewEnglandAcquisitionDashboard() {
  const [targets, setTargets] = useState<AcquisitionTarget[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState("software")
  const [selectedStates, setSelectedStates] = useState<string[]>(["MA", "CT", "NH"])
  const [ebitdaRange, setEbitdaRange] = useState({ min: 900000, max: 2000000 })

  const runAcquisitionScan = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/new-england-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          states: selectedStates,
          ebitdaRange,
          timeline: "December 2025",
        }),
      })
      const data = await response.json()
      setTargets(data.targets || [])
    } catch (error) {
      console.error("Acquisition scan failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportTierSheets = () => {
    const csvContent = targets.map((target) => ({
      Company: target.name,
      Industry: target.industry,
      Location: `${target.location}, ${target.state}`,
      "Est. Revenue": `$${(target.revenueEstimate / 1000000).toFixed(1)}M`,
      "Est. EBITDA": `$${(target.ebitdaEstimate / 1000000).toFixed(1)}M`,
      Employees: target.employeeCount,
      "Succession Risk": `${target.successionRisk}%`,
      "Acquisition Score": `${target.acquisitionProbability}%`,
      "Primary Contact": target.executiveContacts[0]?.email || target.contactInfo.email || "N/A",
    }))

    const csv = [Object.keys(csvContent[0]).join(","), ...csvContent.map((row) => Object.values(row).join(","))].join(
      "\n",
    )

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `new-england-acquisition-targets-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2">🎯 New England Acquisition Terminal</h1>
          <p className="text-xl text-green-300">
            Product-focused software + service businesses | $900K-$2M EBITDA | Close by Dec 2025
          </p>
        </div>

        {/* Search Parameters */}
        <Card className="bg-gray-900 border-green-500 mb-8">
          <CardHeader>
            <CardTitle className="text-green-400">🔍 Acquisition Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-green-400 font-semibold mb-2">Industry Focus</label>
                <div className="space-y-2">
                  <Button
                    variant={selectedIndustry === "software" ? "default" : "outline"}
                    onClick={() => setSelectedIndustry("software")}
                    className="w-full justify-start"
                  >
                    💻 Software & SaaS
                  </Button>
                  <Button
                    variant={selectedIndustry === "services" ? "default" : "outline"}
                    onClick={() => setSelectedIndustry("services")}
                    className="w-full justify-start"
                  >
                    🏥 Service Businesses
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-green-400 font-semibold mb-2">New England States</label>
                <div className="grid grid-cols-2 gap-2">
                  {NEW_ENGLAND_STATES.map((state) => (
                    <Button
                      key={state.code}
                      variant={selectedStates.includes(state.code) ? "default" : "outline"}
                      onClick={() => {
                        setSelectedStates((prev) =>
                          prev.includes(state.code) ? prev.filter((s) => s !== state.code) : [...prev, state.code],
                        )
                      }}
                      className="text-xs"
                    >
                      {state.code}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-green-400 font-semibold mb-2">EBITDA Range</label>
                <div className="space-y-2">
                  <div className="text-green-300">
                    ${(ebitdaRange.min / 1000000).toFixed(1)}M - ${(ebitdaRange.max / 1000000).toFixed(1)}M
                  </div>
                  <Button
                    onClick={runAcquisitionScan}
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-black"
                  >
                    {loading ? "🔄 Scanning..." : "🎯 Run Acquisition Scan"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New England Map Visualization */}
        <Card className="bg-gray-900 border-green-500 mb-8">
          <CardHeader>
            <CardTitle className="text-green-400">🗺️ New England Target Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-800 rounded-lg p-6 h-64">
              <div className="grid grid-cols-3 gap-4 h-full">
                {NEW_ENGLAND_STATES.map((state) => (
                  <div
                    key={state.code}
                    className={`rounded-lg p-4 border-2 transition-all cursor-pointer ${
                      selectedStates.includes(state.code)
                        ? "border-green-400 bg-green-900/30"
                        : "border-gray-600 bg-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedStates((prev) =>
                        prev.includes(state.code) ? prev.filter((s) => s !== state.code) : [...prev, state.code],
                      )
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{state.code}</div>
                      <div className="text-xs text-green-300">{state.name}</div>
                      <div className="text-xs text-green-400 mt-1">
                        {targets.filter((t) => t.state === state.code).length} targets
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Categories */}
        <Card className="bg-gray-900 border-green-500 mb-8">
          <CardHeader>
            <CardTitle className="text-green-400">🏭 Target Industries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">💻 Software & SaaS</h3>
                <div className="space-y-2">
                  {SOFTWARE_INDUSTRIES.map((industry) => (
                    <div key={industry.naics} className="bg-gray-800 rounded-lg p-3">
                      <div className="font-semibold text-green-300">{industry.name}</div>
                      <div className="text-sm text-green-400">NAICS {industry.naics}</div>
                      <div className="text-xs text-green-300">{industry.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">🏥 Service Businesses</h3>
                <div className="space-y-2">
                  {SERVICE_INDUSTRIES.map((industry) => (
                    <div key={industry.naics} className="bg-gray-800 rounded-lg p-3">
                      <div className="font-semibold text-green-300">{industry.name}</div>
                      <div className="text-sm text-green-400">NAICS {industry.naics}</div>
                      <div className="text-xs text-green-300">{industry.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acquisition Targets */}
        {targets.length > 0 && (
          <Card className="bg-gray-900 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-green-400">🎯 Acquisition Targets ({targets.length})</CardTitle>
              <Button onClick={exportTierSheets} className="bg-green-500 hover:bg-green-600 text-black">
                📤 Export Tier Sheets
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {targets.map((target) => (
                  <div key={target.id} className="bg-gray-800 rounded-lg p-4 border border-green-600">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-green-400 text-lg">{target.name}</h3>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {target.state}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-300">Industry:</span>
                        <span className="text-green-400">{target.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Est. Revenue:</span>
                        <span className="text-green-400">${(target.revenueEstimate / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Est. EBITDA:</span>
                        <span className="text-green-400">${(target.ebitdaEstimate / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Employees:</span>
                        <span className="text-green-400">{target.employeeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Succession Risk:</span>
                        <span className={`${target.successionRisk > 70 ? "text-green-400" : "text-yellow-400"}`}>
                          {target.successionRisk}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Acquisition Score:</span>
                        <span className="text-green-400">{target.acquisitionProbability}%</span>
                      </div>
                    </div>

                    {target.executiveContacts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs text-green-300 mb-1">Key Contact:</div>
                        <div className="text-sm text-green-400">
                          {target.executiveContacts[0].name} - {target.executiveContacts[0].title}
                        </div>
                        {target.executiveContacts[0].email && (
                          <div className="text-xs text-green-300">{target.executiveContacts[0].email}</div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-xs text-green-300 mb-1">Market Analysis:</div>
                      <div className="text-xs text-green-400">
                        Fragmentation: {target.marketAnalysis.fragmentation}% | Competitors:{" "}
                        {target.marketAnalysis.competitorCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

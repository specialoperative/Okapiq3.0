"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { QueryBar } from "./QueryBar"
import { FilterPanel } from "./FilterPanel"

const Map = dynamic(() => import("./Map"), { ssr: false })

export default function DynamicMapComponent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function run(queryOrDsl: any) {
    setLoading(true)
    const res = await fetch("/api/geo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(queryOrDsl),
    })
    const result = await res.json()
    setData(result)
    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <QueryBar onRun={run} loading={loading} />
        <FilterPanel onRun={run} />
      </div>
      <div className="flex-1">{data && <Map data={data} />}</div>
    </div>
  )
}

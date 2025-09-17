"use client"
import { useEffect, useState } from "react"

export default function Map({ data }: { data: any }) {
  const [mapData, setMapData] = useState<any[]>([])

  useEffect(() => {
    if (!data) return
    console.log("[v0] Map data received:", data)
    // Process data for visualization
    setMapData(Array.isArray(data) ? data : [])
  }, [data])

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded-lg relative overflow-hidden">
      <svg viewBox="0 0 1000 600" className="w-full h-full">
        {/* Simplified US map outline */}
        <path
          d="M200 200 L800 200 L800 400 L200 400 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-400"
        />

        {/* Data points visualization */}
        {mapData.map((point, index) => (
          <circle
            key={index}
            cx={300 + ((index * 50) % 400)}
            cy={250 + ((index * 30) % 100)}
            r="4"
            fill="rgb(34, 197, 94)"
            className="opacity-80 hover:opacity-100 cursor-pointer"
          >
            <title>{point.name || `Location ${index + 1}`}</title>
          </circle>
        ))}
      </svg>

      {/* Data overlay */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm">
        {mapData.length} locations found
      </div>
    </div>
  )
}

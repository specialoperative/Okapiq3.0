"use client"

import type React from "react"
import { useState } from "react"
import OpenAI from "openai"

// Function to translate natural language query to SQL
const translateQueryToSQL = async (naturalQuery: string) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a SQL translator. Only output SQL." },
      { role: "user", content: naturalQuery },
    ],
  })

  return completion.choices[0].message.content
}

// Function to execute SQL query and return results
const executeSQLQuery = async (sqlQuery: string) => {
  // Placeholder for actual database execution logic
  // This should be replaced with actual API calls to your database
  const { rows } = await fetch("/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sqlQuery }),
  }).then((res) => res.json())

  return rows
}

export default function NaturalLanguageQuery({ onQuerySubmit }: { onQuerySubmit: (query: string) => void }) {
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsProcessing(true)
    try {
      const sqlQuery = await translateQueryToSQL(query)
      const results = await executeSQLQuery(sqlQuery)
      await onQuerySubmit(JSON.stringify(results))
    } finally {
      setIsProcessing(false)
    }
  }

  const sampleQueries = [
    "Find HVAC companies in Texas with owners over 55",
    "Show me dental practices in New England with $1-2M revenue",
    "Landscaping companies in fragmented markets for rollup",
    "Software companies with succession risk in California",
  ]

  return (
    <div className="bg-black border border-green-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-400 mb-4">Natural Language Query</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're looking for in plain English..."
            className="w-full h-24 bg-gray-900 border border-green-500 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:outline-none focus:border-green-400"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing || !query.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-black font-semibold px-6 py-2 rounded transition-colors"
        >
          {isProcessing ? "Processing..." : "Analyze Query"}
        </button>
      </form>

      <div className="mt-6">
        <h4 className="text-green-400 font-semibold mb-2">Sample Queries:</h4>
        <div className="space-y-2">
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              onClick={() => setQuery(sample)}
              className="block w-full text-left text-green-300 hover:text-green-100 text-sm p-2 rounded hover:bg-gray-800 transition-colors"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-900 rounded border border-green-700">
        <h4 className="text-green-400 font-semibold mb-2">Fragmentation Analysis</h4>
        <p className="text-green-300 text-sm mb-2">
          Our system calculates market fragmentation using advanced algorithms:
        </p>
        <div className="text-green-300 text-sm space-y-2">
          <p>
            <strong>Fragmentation Score (FS):</strong>
          </p>
          <p className="ml-4">FS = (Number of firms in market / Revenue of largest firm) × Concentration Index (HHI)</p>
          <p className="ml-4">• High FS → many small firms → ripe for roll-up</p>
          <p className="ml-4">• Low FS → few large firms → hard to enter</p>

          <p className="mt-3">
            <strong>Market Sizing (MS):</strong>
          </p>
          <p className="ml-4">MS = Number of firms × Average revenue proxy per firm</p>
          <p className="ml-4">Useful for TAM/SAM analysis in specific geographies</p>
        </div>
      </div>
    </div>
  )
}

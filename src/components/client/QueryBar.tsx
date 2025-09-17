"use client"
import { useState } from "react"

export function QueryBar({ onRun, loading }: { onRun: (q: any) => void; loading: boolean }) {
  const [mode, setMode] = useState<"nl" | "dsl">("nl")
  const [nl, setNl] = useState("show hvac companies in texas owners >55 revenue 2–10m for rollups")
  const [dsl, setDsl] = useState(
    JSON.stringify(
      {
        intent: "rollup",
        where: [
          { field: "industry_code", op: "in", value: ["238220"] },
          { field: "state", op: "in", value: ["TX"] },
          { field: "revenue_estimate", op: "between", value: [2000000, 10000000] },
          { field: "owner_age_estimate", op: ">", value: 55 },
        ],
        metrics: ["FS_ms", "HHI_local", "D2", "MROS", "SRI"],
        map: { layers: ["pins", "clusters"] },
      },
      null,
      2,
    ),
  )

  async function run() {
    onRun(mode === "nl" ? nl : JSON.parse(dsl))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("nl")}
          className={`px-3 py-1 rounded ${mode === "nl" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Natural Language
        </button>
        <button
          onClick={() => setMode("dsl")}
          className={`px-3 py-1 rounded ${mode === "dsl" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          DSL
        </button>
      </div>

      {mode === "nl" ? (
        <input
          value={nl}
          onChange={(e) => setNl(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter natural language query..."
        />
      ) : (
        <textarea
          value={dsl}
          onChange={(e) => setDsl(e.target.value)}
          className="w-full p-2 border rounded h-32 font-mono text-sm"
        />
      )}

      <button
        onClick={run}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Query"}
      </button>
    </div>
  )
}

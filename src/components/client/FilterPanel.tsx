"use client"

export function FilterPanel({ onRun }: { onRun: (dsl: any) => void }) {
  const quickFilters = ["Fragmented", "High TAM", "Owners >55", "Employees <20", "Revenue 2–10M"]

  return (
    <div className="mt-3">
      <div className="text-xs uppercase text-slate-500 mb-1">Quick Filters</div>
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-slate-100 rounded cursor-pointer hover:bg-slate-200"
            onClick={() => console.log("[v0] Filter clicked:", tag)}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

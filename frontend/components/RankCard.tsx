import { RankResult } from "@/lib/api"
import { getDomainStyle } from "@/lib/colors"

const MEDAL: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-yellow-100", text: "text-yellow-700", label: "#1" },
  2: { bg: "bg-slate-100",  text: "text-slate-600",  label: "#2" },
  3: { bg: "bg-orange-100", text: "text-orange-700", label: "#3" },
}

export default function RankCard({ result, domain }: { result: RankResult; domain: string }) {
  if (result.status === "error") {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{result.filename}</p>
            <p className="mt-0.5 text-sm text-red-600">{result.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const medal = MEDAL[result.rank] ?? { bg: "bg-slate-50", text: "text-slate-500", label: `#${result.rank}` }
  const style = getDomainStyle(domain)
  const conf = result.confidence ?? 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${medal.bg} ${medal.text}`}
        >
          {medal.label}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="font-semibold text-slate-800 truncate text-sm">{result.filename}</p>
            <span className="text-sm font-mono tabular-nums text-slate-700 shrink-0">{conf.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${style.bar} transition-all duration-700`}
              style={{ width: `${Math.min(conf, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

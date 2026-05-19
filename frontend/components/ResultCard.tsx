import { FileResult } from "@/lib/api"
import { getDomainStyle } from "@/lib/colors"

export default function ResultCard({ result }: { result: FileResult }) {
  if (result.status === "error") {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
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

  const primary = getDomainStyle(result.domain!)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-slate-800 truncate">{result.filename}</p>
        </div>
        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${primary.bg} ${primary.text}`}
        >
          {result.domain}
        </span>
      </div>

      {result.top_predictions && result.top_predictions.length > 0 && (
        <div className="space-y-3">
          {result.top_predictions.map((p, i) => {
            const style = getDomainStyle(p.domain)
            return (
              <div key={p.domain}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm truncate mr-4 ${
                      i === 0 ? "font-semibold text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {p.domain}
                  </span>
                  <span
                    className={`text-sm font-mono shrink-0 tabular-nums ${
                      i === 0 ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {p.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                    style={{ width: `${Math.min(p.confidence, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import DropZone from "@/components/DropZone"
import ResultCard from "@/components/ResultCard"
import RankCard from "@/components/RankCard"
import { classifyResumes, rankResumes, getCategories, FileResult, RankResult } from "@/lib/api"

type Tab = "classify" | "rank"

export default function Home() {
  const [tab, setTab] = useState<Tab>("classify")

  // ── Classify state ──────────────────────────────────────────────
  const [classifyFiles, setClassifyFiles] = useState<File[]>([])
  const [classifyResults, setClassifyResults] = useState<FileResult[]>([])
  const [classifyLoading, setClassifyLoading] = useState(false)
  const [classifyError, setClassifyError] = useState<string | null>(null)

  // ── Rank state ───────────────────────────────────────────────────
  const [rankFiles, setRankFiles] = useState<File[]>([])
  const [rankResults, setRankResults] = useState<RankResult[]>([])
  const [rankDomain, setRankDomain] = useState("")
  const [rankDomainResult, setRankDomainResult] = useState("")
  const [rankLoading, setRankLoading] = useState(false)
  const [rankError, setRankError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // ── Classify handlers ────────────────────────────────────────────
  const handleClassify = async () => {
    if (classifyFiles.length === 0) return
    setClassifyLoading(true)
    setClassifyError(null)
    setClassifyResults([])
    try {
      setClassifyResults(await classifyResumes(classifyFiles))
    } catch (e) {
      setClassifyError(e instanceof Error ? e.message : "Classification failed")
    } finally {
      setClassifyLoading(false)
    }
  }

  const handleExport = () => {
    const successful = classifyResults.filter((r) => r.status === "success")
    if (successful.length === 0) return
    const header = ["Filename", "Domain", "Confidence (%)", "2nd Domain", "2nd Confidence (%)", "3rd Domain", "3rd Confidence (%)"]
    const rows = successful.map((r) => [
      r.filename,
      r.domain ?? "",
      r.confidence?.toFixed(1) ?? "",
      r.top_predictions?.[1]?.domain ?? "",
      r.top_predictions?.[1]?.confidence?.toFixed(1) ?? "",
      r.top_predictions?.[2]?.domain ?? "",
      r.top_predictions?.[2]?.confidence?.toFixed(1) ?? "",
    ])
    const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "classification_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Rank handlers ────────────────────────────────────────────────
  const handleRank = async () => {
    if (rankFiles.length === 0 || !rankDomain) return
    setRankLoading(true)
    setRankError(null)
    setRankResults([])
    setRankDomainResult("")
    try {
      const data = await rankResumes(rankFiles, rankDomain)
      setRankResults(data.results)
      setRankDomainResult(data.domain)
    } catch (e) {
      setRankError(e instanceof Error ? e.message : "Ranking failed")
    } finally {
      setRankLoading(false)
    }
  }

  const handleExportRank = () => {
    const successful = rankResults.filter((r) => r.status === "success")
    if (successful.length === 0) return
    const header = ["Rank", "Filename", `Confidence for ${rankDomainResult} (%)`]
    const rows = successful.map((r) => [String(r.rank), r.filename, r.confidence?.toFixed(1) ?? ""])
    const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ranking_${rankDomainResult}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const classifySuccessCount = classifyResults.filter((r) => r.status === "success").length
  const classifyErrorCount = classifyResults.filter((r) => r.status === "error").length
  const rankSuccessCount = rankResults.filter((r) => r.status === "success").length
  const rankErrorCount = rankResults.filter((r) => r.status === "error").length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="max-w-2xl mx-auto px-4 py-14">

        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-md mb-5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Resume Classifier</h1>
          <p className="mt-2 text-slate-500 text-base">Upload PDF resumes to identify their job domain with AI</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => setTab("classify")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
              tab === "classify"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Classify
          </button>
          <button
            onClick={() => setTab("rank")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
              tab === "rank"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Rank by Domain
          </button>
        </div>

        {/* ── CLASSIFY TAB ── */}
        {tab === "classify" && (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <DropZone files={classifyFiles} onFilesChange={setClassifyFiles} />
              {classifyFiles.length > 0 && (
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={handleClassify}
                    disabled={classifyLoading}
                    className="inline-flex items-center gap-2 px-7 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
                  >
                    {classifyLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Classifying…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Classify {classifyFiles.length} Resume{classifyFiles.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {classifyError && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{classifyError}</p>
              </div>
            )}

            {classifyResults.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-semibold text-slate-800">Results</h2>
                    {classifySuccessCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {classifySuccessCount} classified
                      </span>
                    )}
                    {classifyErrorCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {classifyErrorCount} failed
                      </span>
                    )}
                  </div>
                  {classifySuccessCount > 0 && (
                    <button
                      onClick={handleExport}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {classifyResults.map((r, i) => <ResultCard key={i} result={r} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── RANK TAB ── */}
        {tab === "rank" && (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <DropZone files={rankFiles} onFilesChange={setRankFiles} />

              {/* Domain selector */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select domain to rank against
                </label>
                <select
                  value={rankDomain}
                  onChange={(e) => setRankDomain(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">— choose a domain —</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {rankFiles.length > 0 && rankDomain && (
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={handleRank}
                    disabled={rankLoading}
                    className="inline-flex items-center gap-2 px-7 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
                  >
                    {rankLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Ranking…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Rank {rankFiles.length} Resume{rankFiles.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {rankError && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{rankError}</p>
              </div>
            )}

            {rankResults.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-semibold text-slate-800">
                      Rankings
                    </h2>
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      {rankDomainResult}
                    </span>
                    {rankSuccessCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {rankSuccessCount} ranked
                      </span>
                    )}
                    {rankErrorCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {rankErrorCount} failed
                      </span>
                    )}
                  </div>
                  {rankSuccessCount > 0 && (
                    <button
                      onClick={handleExportRank}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {rankResults.map((r, i) => (
                    <RankCard key={i} result={r} domain={rankDomainResult} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-slate-400">
          Supports 25 job domains · PDF files up to 5 MB
        </footer>
      </div>
    </main>
  )
}

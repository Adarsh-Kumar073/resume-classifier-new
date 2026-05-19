export interface Prediction {
  domain: string
  confidence: number
}

export interface FileResult {
  filename: string
  status: "success" | "error"
  domain?: string
  confidence?: number
  top_predictions?: Prediction[]
  error?: string
}

export interface ClassifyResponse {
  results: FileResult[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function classifyResumes(files: File[]): Promise<FileResult[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  const response = await fetch(`${API_BASE}/classify/`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(err.detail ?? "Classification failed")
  }

  const data: ClassifyResponse = await response.json()
  return data.results
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/categories`)
  if (!response.ok) return []
  const data = await response.json()
  return data.categories as string[]
}

export interface RankResult {
  rank: number
  filename: string
  status: "success" | "error"
  confidence?: number
  error?: string
}

export interface RankResponse {
  domain: string
  results: RankResult[]
}

export async function rankResumes(files: File[], domain: string): Promise<RankResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  formData.append("domain", domain)

  const response = await fetch(`${API_BASE}/rank/`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(err.detail ?? "Ranking failed")
  }

  return response.json() as Promise<RankResponse>
}

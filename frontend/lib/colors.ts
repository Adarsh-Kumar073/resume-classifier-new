interface DomainStyle {
  bg: string
  text: string
  bar: string
}

const DOMAIN_COLORS: Record<string, DomainStyle> = {
  "Data Science":                { bg: "bg-blue-100",    text: "text-blue-800",    bar: "bg-blue-500" },
  "Python Developer":            { bg: "bg-blue-100",    text: "text-blue-800",    bar: "bg-blue-500" },
  "Java Developer":              { bg: "bg-orange-100",  text: "text-orange-800",  bar: "bg-orange-500" },
  "Web Designing":               { bg: "bg-purple-100",  text: "text-purple-800",  bar: "bg-purple-500" },
  "DevOps Engineer":             { bg: "bg-cyan-100",    text: "text-cyan-800",    bar: "bg-cyan-500" },
  "Network Security Engineer":   { bg: "bg-red-100",     text: "text-red-800",     bar: "bg-red-500" },
  "Database":                    { bg: "bg-indigo-100",  text: "text-indigo-800",  bar: "bg-indigo-500" },
  "Hadoop":                      { bg: "bg-lime-100",    text: "text-lime-800",    bar: "bg-lime-500" },
  "ETL Developer":               { bg: "bg-lime-100",    text: "text-lime-800",    bar: "bg-lime-500" },
  "DotNet Developer":            { bg: "bg-violet-100",  text: "text-violet-800",  bar: "bg-violet-500" },
  "SAP Developer":               { bg: "bg-violet-100",  text: "text-violet-800",  bar: "bg-violet-500" },
  "Blockchain":                  { bg: "bg-orange-100",  text: "text-orange-800",  bar: "bg-orange-500" },
  "Automation Testing":          { bg: "bg-teal-100",    text: "text-teal-800",    bar: "bg-teal-500" },
  "Testing":                     { bg: "bg-teal-100",    text: "text-teal-800",    bar: "bg-teal-500" },
  "HR":                          { bg: "bg-pink-100",    text: "text-pink-800",    bar: "bg-pink-500" },
  "Sales":                       { bg: "bg-green-100",   text: "text-green-800",   bar: "bg-green-500" },
  "Business Analyst":            { bg: "bg-emerald-100", text: "text-emerald-800", bar: "bg-emerald-500" },
  "Operations Manager":          { bg: "bg-slate-100",   text: "text-slate-700",   bar: "bg-slate-500" },
  "PMO":                         { bg: "bg-slate-100",   text: "text-slate-700",   bar: "bg-slate-500" },
  "Mechanical Engineer":         { bg: "bg-amber-100",   text: "text-amber-800",   bar: "bg-amber-500" },
  "Civil Engineer":              { bg: "bg-yellow-100",  text: "text-yellow-800",  bar: "bg-yellow-500" },
  "Electrical Engineering":      { bg: "bg-yellow-100",  text: "text-yellow-800",  bar: "bg-yellow-500" },
  "Advocate":                    { bg: "bg-rose-100",    text: "text-rose-800",    bar: "bg-rose-500" },
  "Arts":                        { bg: "bg-fuchsia-100", text: "text-fuchsia-800", bar: "bg-fuchsia-500" },
  "Health & Fitness":            { bg: "bg-green-100",   text: "text-green-800",   bar: "bg-green-500" },
}

const FALLBACK: DomainStyle = { bg: "bg-gray-100", text: "text-gray-700", bar: "bg-gray-400" }

export function getDomainStyle(domain: string): DomainStyle {
  return DOMAIN_COLORS[domain] ?? FALLBACK
}

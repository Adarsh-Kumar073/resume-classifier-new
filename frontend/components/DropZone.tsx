"use client"

import { useCallback, useRef, useState } from "react"

interface Props {
  files: File[]
  onFilesChange: (files: File[]) => void
}

export default function DropZone({ files, onFilesChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (incoming: File[]) => {
      const pdfs = incoming.filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      )
      const existing = new Set(files.map((f) => f.name))
      const unique = pdfs.filter((f) => !existing.has(f.name))
      if (unique.length > 0) onFilesChange([...files, ...unique])
    },
    [files, onFilesChange]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(Array.from(e.dataTransfer.files))
    },
    [addFiles]
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const removeFile = (name: string) =>
    onFilesChange(files.filter((f) => f.name !== name))

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer select-none transition-colors duration-150 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
        }`}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? "bg-blue-100" : "bg-slate-100"
            }`}
          >
            <svg
              className={`w-7 h-7 transition-colors ${isDragging ? "text-blue-600" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-700">
              Drop PDF resumes here
            </p>
            <p className="mt-1 text-sm text-slate-400">
              or{" "}
              <span className="text-blue-600 underline underline-offset-2">
                click to browse
              </span>{" "}
              · Max 5 MB per file
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg
                  className="w-5 h-5 text-red-400 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                </svg>
                <span className="text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400 shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(file.name)
                }}
                className="ml-3 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

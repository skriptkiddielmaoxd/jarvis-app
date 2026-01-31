import React, { useMemo, useState } from 'react'
import { marked } from 'marked'
import Toast from './Toast'

export default function OutputPanel({ response }) {
  const [showRaw, setShowRaw] = useState(false)

  const rendered = useMemo(() => {
    if (!response?.request_markdown) return ''
    return marked.parse(response.request_markdown)
  }, [response])

  const [copiedPath, setCopiedPath] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('render')

  async function safeCopy(text) {
    if (!text) return false
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      return true
    } catch (e) {
      console.warn('Copy failed', e)
      return false
    }
  }

  if (!response) {
    return (
      <div className="p-3 text-sm text-gray-500">No output available.</div>
    )
  }

  async function handleDownload() {
    const blob = new Blob([response.request_markdown || ''], { type: 'text/markdown' })
    const name = `REQUEST-${Date.now()}.md`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast('Downloaded')
    setTimeout(() => setToast(null), 1500)
  }

  return (
    <div className="mt-2 text-sm">
      {toast && <Toast>{toast}</Toast>}

      <div className="mb-3">
        <div className="text-sm font-medium">Request Path</div>
        <div className="text-sm text-gray-700 break-words">{response.request_path}</div>
        <div className="mt-2">
          <button
            onClick={async () => {
              const ok = await safeCopy(response.request_path || '')
              if (ok) {
                setToast('Path copied')
                setTimeout(() => setToast(null), 1500)
              }
            }}
            aria-label="Copy request path"
            className="px-2 py-1 bg-gray-100 rounded text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Copy path
          </button>
          <button onClick={handleDownload} aria-label="Download markdown" className="px-2 py-1 bg-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">Download</button>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setTab('render')} aria-pressed={tab==='render'} className={`px-3 py-1 rounded focus:outline-none focus:ring-2 ${tab==='render' ? 'bg-indigo-600 text-white focus:ring-indigo-300' : 'bg-gray-100 text-gray-700 focus:ring-indigo-200'}`}>Rendered</button>
          <button onClick={() => setTab('raw')} aria-pressed={tab==='raw'} className={`px-3 py-1 rounded focus:outline-none focus:ring-2 ${tab==='raw' ? 'bg-indigo-600 text-white focus:ring-indigo-300' : 'bg-gray-100 text-gray-700 focus:ring-indigo-200'}`}>Raw</button>
        </div>

        <div className="max-h-72 overflow-auto p-3 bg-white border rounded">
          {tab === 'raw' ? (
            <pre className="whitespace-pre-wrap text-sm">{response.request_markdown}</pre>
          ) : (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: rendered }} />
          )}
        </div>
      </div>
    </div>
  )
}

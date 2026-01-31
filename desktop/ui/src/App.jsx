import React, { useEffect, useState, useRef } from 'react'
import API from './api'
import ProjectSelector from './components/ProjectSelector'
import IntentInput from './components/IntentInput'
import OutputPanel from './components/OutputPanel'
import HelpPanel from './components/HelpPanel'

export default function App(){
  const [project, setProject] = useState(localStorage.getItem('jarvis:lastProject') || '')
  const [intent, setIntent] = useState(localStorage.getItem('jarvis:lastIntent') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)
  const [outputs, setOutputs] = useState([])
  const [lastRequest, setLastRequest] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const helpBtnRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('jarvis:lastIntent', intent)
  }, [intent])

  useEffect(() => {
    localStorage.setItem('jarvis:lastProject', project)
  }, [project])

  const handleSubmit = async (text) => {
    const trimmed = (text || intent || '').trim()
    if (!trimmed) return
    const body = { project, intent: trimmed }
    setLastRequest(body)
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await API.post('/intent', body)
      setResponse(res.data)
      setOutputs((s) => {
        const next = [res.data, ...s]
        return next.slice(0, 5)
      })
    } catch (err) {
      const msg = err?.message || 'Request failed'
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    if (!lastRequest) return
    setLoading(true)
    setError(null)
    try {
      const res = await API.post('/intent', lastRequest)
      setResponse(res.data)
      setOutputs((s) => {
        const next = [res.data, ...s]
        return next.slice(0, 5)
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 text-base">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">Jarvis</h1>
            <p className="text-sm text-gray-600 mt-1">Intent → artifact — polished local UI</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Project: <strong className="text-gray-900">{project || '—'}</strong></div>
            <button ref={helpBtnRef} onClick={() => setShowHelp(true)} className="px-3 py-1 bg-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">Help</button>
          </div>
        </header>

        {showHelp ? (
          <div className="mb-6">
            <HelpPanel onClose={() => {
              setShowHelp(false)
              requestAnimationFrame(() => helpBtnRef.current?.focus())
            }} />
          </div>
        ) : null}

        {error && (
          <div className="mb-4 p-3 rounded border bg-red-50 border-red-200 flex items-start justify-between" role="status" aria-live="assertive">
            <div className="text-sm text-red-800">{error.message || String(error)}</div>
            <div className="flex items-center gap-2">
              <button onClick={handleRetry} disabled={loading} className="px-2 py-1 bg-white border rounded text-sm">Retry</button>
              <button onClick={() => setError(null)} className="px-2 py-1 bg-white border rounded text-sm">Dismiss</button>
            </div>
          </div>
        )}

        <div className="h-px bg-gray-100 my-4" />

        <main role="main" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-4 bg-white rounded shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <ProjectSelector value={project} onChange={setProject} />
            </div>

            <div>
              <IntentInput value={intent} onChange={setIntent} onSubmit={handleSubmit} disabled={loading} />
            </div>

            <div className="mt-4 text-sm text-gray-500">
              {loading && <div className="text-indigo-600">Processing…</div>}
              {!loading && !response && <div className="text-gray-400">No output yet — submit an intent to generate an artifact.</div>}
            </div>
          </section>

          <section className="p-4 bg-white rounded shadow">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-medium">Output</div>
              <div className="text-sm text-gray-500">Latest artifact</div>
            </div>
            <div>
              {response ? (
                <OutputPanel response={response} outputs={outputs} onSelect={(r) => setResponse(r)} />
              ) : (
                <div className="text-sm text-gray-500">No artifact to show yet.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

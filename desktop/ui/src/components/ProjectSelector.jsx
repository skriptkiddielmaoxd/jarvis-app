import React, { useEffect, useState } from 'react'
import API from '../api'

export default function ProjectSelector({ value, onChange }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProjects() {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/projects')
      if (res.data && res.data.projects) {
        setProjects(res.data.projects)
        if (!value) {
          const saved = localStorage.getItem('jarvis:lastProject')
          const pick = saved || (res.data.projects[0] && res.data.projects[0].name)
          if (pick) onChange && onChange(pick)
        }
      } else if (Array.isArray(res.data)) {
        setProjects(res.data)
      }
    } catch (err) {
      setError(err?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (value) localStorage.setItem('jarvis:lastProject', value)
  }, [value])

  if (loading) return <div className="text-sm text-gray-500">Loading projects...</div>
  if (error) return <div className="text-sm text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center gap-2">
        <select
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="border rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Project selector"
        >
          {projects.map((p) => (
            <option key={p.name} value={p.name}>
              {p.displayName || p.name}
            </option>
          ))}
        </select>
        <button onClick={fetchProjects} className="px-2 py-1 bg-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">Refresh</button>
      </div>
      {value && (
        <div className="mt-2 text-sm text-gray-600">
          {(() => {
            const p = projects.find((x) => x.name === value)
            return p?.description || p?.help || null
          })()}
        </div>
      )}
    </div>
  )
}

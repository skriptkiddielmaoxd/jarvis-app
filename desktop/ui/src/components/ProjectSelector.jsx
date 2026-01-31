import React, { useEffect, useState } from 'react'
import API from '../api'

export default function ProjectSelector({ value, onChange }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    API.get('/projects')
      .then((res) => {
        if (!mounted) return
        if (res.data && res.data.projects) {
          setProjects(res.data.projects)
          // if no value provided, pick last saved or first
          if (!value) {
            const saved = localStorage.getItem('jarvis:lastProject')
            const pick = saved || (res.data.projects[0] && res.data.projects[0].name)
            if (pick) onChange && onChange(pick)
          }
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load projects')
      })
      .finally(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (value) localStorage.setItem('jarvis:lastProject', value)
  }, [value])

  if (loading) return <div className="text-sm text-gray-500">Loading projects...</div>
  if (error) return <div className="text-sm text-red-500">{error}</div>

  return (
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
  )
}

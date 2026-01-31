import React, { useEffect, useRef, useState } from 'react'

const EXAMPLES = [
  'Create a CI workflow to run tests and linting on push',
  'Add a new endpoint /reports that returns monthly usage',
  'Update README with setup instructions for Windows users',
]

export default function IntentInput({ value, onChange, onSubmit, disabled }) {
  const [text, setText] = useState(value || '')
  const textareaRef = useRef(null)

  useEffect(() => {
    setText(value || '')
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!disabled) onSubmit && onSubmit(text)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [text, disabled, onSubmit])

  const minLen = 8
  const valid = text.trim().length >= minLen
  const maxLen = 2000
  const remaining = Math.max(0, maxLen - text.length)

  function handleChange(v) {
    setText(v)
    onChange && onChange(v)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Intent</label>

      <div className="mb-2 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              handleChange(ex)
              textareaRef.current?.focus()
            }}
            aria-label={`Use example: ${ex}`}
            className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {ex.length > 40 ? ex.slice(0, 37) + '…' : ex}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={EXAMPLES[0]}
        rows={7}
        maxLength={maxLen}
        aria-label="Intent input"
        className="w-full border rounded p-3 bg-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />

      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-600">{text.length} chars</div>
          <div className={remaining <= 50 ? 'text-xs text-orange-500' : 'text-xs text-gray-600'}>{remaining} remaining</div>
          <div role="status" aria-live="polite" className={!valid ? 'text-red-500 text-xs' : 'text-green-600 text-xs'}>{valid ? 'Ready' : `Min ${minLen} chars`}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { if (!valid || disabled) return; onSubmit && onSubmit(text) }}
            disabled={!valid || disabled}
            aria-disabled={!valid || disabled}
            aria-busy={disabled}
            className={`px-3 py-1 rounded inline-flex items-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-2 ${!valid || disabled ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300'}`}
          >
            {disabled ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Sending…
              </>
            ) : (
              <>
                <span>Send</span>
                <span className="text-xs text-gray-200">Ctrl/Cmd+Enter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

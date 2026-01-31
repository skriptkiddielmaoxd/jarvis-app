import React, { useEffect, useRef, useState } from 'react'
import Toast from './Toast'

export default function HelpPanel({ onClose }) {
  const containerRef = useRef(null);
  const headingId = 'jarvis-help-heading';

  useEffect(() => {
    const prevActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // focus the container so keyboard users land inside the dialog
    containerRef.current?.focus();

    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        // call onClose and attempt to restore focus to the opener
        try {
          onClose && onClose();
        } finally {
          requestAnimationFrame(() => {
            if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
          });
        }
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleClose() {
    const prevActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    onClose && onClose();
    requestAnimationFrame(() => {
      if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
    });
  }

  const [toast, setToast] = useState(null)

  async function copyExample(text) {
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
      setToast('Example copied')
      setTimeout(() => setToast(null), 1400)
    } catch (e) {
      setToast('Copy failed')
      setTimeout(() => setToast(null), 1400)
    }
  }

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      tabIndex={-1}
      className="p-4 bg-white rounded shadow max-w-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <h2 id={headingId} className="text-2xl font-semibold leading-tight">Getting started with Jarvis</h2>
        <button onClick={handleClose} aria-label="Close help" className="px-3 py-1 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300">Close</button>
      </div>

      <section className="mb-4">
        <h3 className="text-lg font-medium mb-1">What Jarvis does</h3>
        <p className="text-sm text-gray-600 leading-relaxed">Jarvis converts a human intent into a concrete artifact (code, CI workflow, docs) by generating a request payload and markdown you can review and apply.</p>
      </section>

      <section className="mb-4">
        <h3 className="text-lg font-medium mb-2">Example intents</h3>
        <div className="space-y-2">
          {[
            'Create a CI workflow to run tests and linting on push',
            'Add a new endpoint /reports that returns monthly usage',
            'Update README with Windows setup instructions',
          ].map((ex) => (
            <div key={ex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="text-sm text-gray-800">{ex}</div>
              <div>
                <button onClick={() => copyExample(ex)} aria-label={`Copy example: ${ex}`} className="px-2 py-1 text-sm bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h3 className="text-lg font-medium mb-1">Common errors</h3>
        <ul className="text-sm list-disc pl-5 text-gray-700 space-y-1">
          <li>GitHub auth missing — Jarvis can generate artifacts but pushing requires a token.</li>
          <li>Validation failures — ensure your intent is specific and exceeds the minimum length.</li>
          <li>Network errors — make sure the local Express server is running at <code>http://localhost:3000</code>.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-1">Quick start</h3>
        <ol className="text-sm list-decimal pl-5 text-gray-700 space-y-1">
          <li>Select a project from the selector.</li>
          <li>Pick or type an intent in the input area.</li>
          <li>Press <strong>Ctrl/Cmd+Enter</strong> or click <strong>Send</strong> to generate an artifact.</li>
          <li>Use the output panel to copy or download the generated markdown.</li>
        </ol>
        <p className="text-sm text-gray-600 mt-3">Keyboard: <strong>Esc</strong> closes this panel; focus restores to the opener.</p>
      </section>

      {toast && <Toast>{toast}</Toast>}
    </div>
  )
}

// Preload script: attach UI handlers in Electron renderer to guarantee buttons work
(() => {
  function showTabFallback(name) {
    if (window.showTab) return window.showTab(name);
    // manual toggle
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    ['composer', 'requests', 'settings'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.hidden = id !== name;
    });
  }

  function attach() {
    try {
      document.querySelectorAll('.tab').forEach((btn) => {
        if (btn._attached) return;
        btn.addEventListener('click', () => {
          const n = btn.dataset.tab;
          if (n) showTabFallback(n);
        });
        btn._attached = true;
      });

      const send = document.getElementById('sendBtn');
      if (send && !send._attached) {
        send.addEventListener('click', () => { if (window.sendIntent) window.sendIntent(); });
        send._attached = true;
      }

      const clear = document.getElementById('clearBtn');
      if (clear && !clear._attached) {
        clear.addEventListener('click', () => {
          if (window.clearIntent) window.clearIntent();
          else {
            const intent = document.getElementById('intent'); if (intent) intent.value = '';
            const out = document.getElementById('outputArea'); if (out) out.innerHTML = '';
          }
        });
        clear._attached = true;
      }

      const focus = document.getElementById('focusBtn');
      if (focus && !focus._attached) {
        focus.addEventListener('click', () => { const intent = document.getElementById('intent'); if (intent) intent.focus(); });
        focus._attached = true;
      }

      const copy = document.getElementById('copyBtn');
      if (copy && !copy._attached) {
        copy.addEventListener('click', () => { if (window.copyLatest) window.copyLatest(); });
        copy._attached = true;
      }
    } catch (e) {
      console.error('preload attach error', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
  setTimeout(attach, 500);
})();

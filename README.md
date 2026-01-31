# Jarvis (local-first)

This repository contains a lightweight Express backend (`server`) and a Vite + React + Tailwind frontend (`desktop/ui`) used inside an Electron shell (`desktop`).

Quick start

- Copy the example env and fill secrets locally (do NOT commit `.env`):

```powershell
cd desktop\jarvis-desktop\server
Copy-Item .env.example .env
# edit .env with your API keys locally
```

- Run the server:

```powershell
cd server
npm install
node index.js
```

- Run the UI in dev:

```powershell
cd desktop\ui
npm install
npm run dev
# open http://127.0.0.1:3000/ui
```

Notes

- This repo intentionally keeps large build artifacts out of Git. See `.gitignore`.
- Secrets should be kept in your local `.env` and never pushed to remote.
- For distribution, build artifacts should be stored in release assets or Git LFS (not recommended for private keys).

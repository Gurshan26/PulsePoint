# PulsePoint — CX Insight Dashboard

Customer experience intelligence that actually gets used.

## What it does

PulsePoint turns survey responses, operational data, and free-text feedback into a clear,
actionable dashboard. It tracks NPS, CSAT, CES, sentiment trends, verbatim themes, alert
thresholds, annotations, and AI-generated stakeholder summaries.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173` and the API runs at `http://localhost:3001`.

## Optional AI

Get a free Gemini API key from `https://aistudio.google.com` and set:

```bash
GEMINI_API_KEY=your_key
```

If the key is absent, PulsePoint runs in rich mock-AI mode.

## Demo Dataset

Seeded automatically on first server start:

- Dataset: `Retail Banking CX Study`
- Viewer passcode: `pulse2024`
- Admin passcode: `admin2024`

## Test

```bash
npm test
```

## Deploy

### Vercel

The repository includes `vercel.json` and `api/index.js` so the Vite client and
Express API can deploy together on Vercel. The API uses `/tmp` for SQLite on
Vercel, which is suitable for the seeded demo experience and mock-AI mode.

```bash
vercel --prod
```

For Gemini-backed insights, add `GEMINI_API_KEY` in Vercel project settings.

### Render

For persistent SQLite storage without adding an external database, connect the
repository on Render, add `GEMINI_API_KEY`, and deploy using `render.yaml`.

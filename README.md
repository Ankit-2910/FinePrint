# FinePrint — AI Contract & Fine-Print Risk Analyzer

Paste any contract, NDA, lease, or terms-of-service and get a plain-English
risk report in seconds — what you're agreeing to, every risky clause flagged
with severity and a fix, your obligations and deadlines, the protections that
are missing, and a negotiation checklist.

**Hackathon:** AI Generalist Individual · **Stack:** Vite + React + Gemini (serverless proxy)

## What it does
For a pasted document the AI returns: an overall risk score + blunt verdict, a
plain-English summary, 6–12 flagged clauses (severity + why it's risky + what to
negotiate + the actual snippet), key obligations & deadlines, missing
protections, and concrete negotiation asks. This replaces a slow, expensive
manual/legal first-pass review with real language understanding — not a summary.

## Run it
- **Live:** see your Vercel URL after following `DEPLOY.md`.
- **Local:** `npm install` then `vercel dev` (the AI needs the serverless
  function; plain `npm run dev` serves only the UI).

## How the AI works
One document → one reasoning pass through Gemini, returning strict JSON that the
UI renders as a risk dashboard. The `GEMINI_API_KEY` is held by the
`/api/analyze` serverless function and never reaches the browser. Gemini's
"thinking" is disabled and the output budget is large so the full analysis
returns complete, valid JSON.

## Project structure
```
fineprint/
├── api/analyze.js     # serverless proxy → Gemini (holds the key)
├── src/App.jsx        # the application
├── src/main.jsx       # React entry
├── index.html
├── package.json
├── vite.config.js
├── .env.example       # GEMINI_API_KEY / GEMINI_MODEL
└── DEPLOY.md          # step-by-step free deploy guide
```

## Config
| Env var | Default | Notes |
|---------|---------|-------|
| `GEMINI_API_KEY` | — | required; free at aistudio.google.com/apikey |
| `GEMINI_MODEL` | `gemini-2.5-flash` | alt: `gemini-2.5-flash-lite` |

## Disclaimer
FinePrint provides an automated, informational first-pass review. It is not
legal advice and is not a substitute for a qualified lawyer.

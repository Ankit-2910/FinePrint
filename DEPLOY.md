# Deploy FinePrint — Free, Live, in ~10 Minutes

Same process as your first project. Stack: Vite + React front end, a Vercel
serverless function that calls Google Gemini (free tier). The API key stays on
the server. You can reuse the SAME Gemini API key from your other project.

## Step 1 — Gemini API key
Use your existing key, or get a new free one at https://aistudio.google.com/apikey
(no credit card). Do not paste it into any file.

## Step 2 — Put the code on GitHub
1. Create a **new** repository at https://github.com → name it `fineprint` → Create.
2. Click **uploading an existing file**.
3. Unzip the project and drag the *contents* in — make sure the `src` and `api`
   folders go in intact (you should see `src/main.jsx`, `src/App.jsx`,
   `api/analyze.js` in the file list before committing).
4. Commit.

## Step 3 — Deploy on Vercel
1. https://vercel.com → Add New… → Project → import the `fineprint` repo.
2. Vercel auto-detects Vite — leave build settings default.
3. Add Environment Variable:
   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | *(your key)* |
4. Deploy. You'll get a live `https://fineprint-xxxx.vercel.app` link.

## Step 4 — Test
Open the link (try incognito to confirm it's public) → **Load sample contract**
→ **Analyze contract**. You should see the risk score, flagged clauses, and
the side panels populate.

## Troubleshooting
- **"Server is missing GEMINI_API_KEY"** → add it in Vercel → Settings →
  Environment Variables → then Redeploy.
- **Model / 404 error** → set `GEMINI_MODEL` to `gemini-2.5-flash-lite`, redeploy.
- **429 rate limit** → wait a minute or switch to `gemini-2.5-flash-lite`.

## Optional: deploy from terminal
```bash
npm install -g vercel
cd fineprint
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

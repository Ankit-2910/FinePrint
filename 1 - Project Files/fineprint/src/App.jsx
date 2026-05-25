import React, { useState, useEffect, useMemo } from "react";

/**
 * ============================================================================
 * FINEPRINT — AI Contract & Fine-Print Risk Analyzer
 * ----------------------------------------------------------------------------
 * Paste any contract / NDA / lease / terms-of-service. The engine returns a
 * plain-English risk report:
 *   • Overall risk score + blunt verdict
 *   • What you're actually agreeing to (plain English)
 *   • Every risky/unusual clause flagged: severity + why + what to negotiate
 *   • Key obligations & deadlines
 *   • Protections that are MISSING
 *   • A concrete negotiation checklist
 *
 * AI layer: Google Gemini, via our own /api/analyze serverless function so the
 * API key never reaches the browser. One document = one reasoning pass.
 *
 * NOTE: informational first-pass review only — not legal advice.
 * ========================================================================== */

/* ---- Design tokens: warm "paper / legal review" editorial theme ---------- */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

:root{
  --paper:#f4f1e9; --paper2:#fbf9f3; --card:#ffffff; --ink:#1d1a15;
  --ink2:#4c4740; --muted:#8c867a; --faint:#b6b0a2; --line:#e4ddcd;
  --seal:#7c2d2d; --accent:#21384a;
  --high:#b23b3b; --med:#c0852b; --low:#4f7d52;
  --high-bg:#f7e9e7; --med-bg:#f8f0df; --low-bg:#e9f1ea;
  --sans:'IBM Plex Sans',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
  --disp:'Fraunces',Georgia,serif;
}
*{box-sizing:border-box}
html,body,#root{background:var(--paper);margin:0}
.fp-root{font-family:var(--sans);color:var(--ink);background:var(--paper);
  min-height:100vh;width:100%;padding:30px 24px;line-height:1.55;
  background-image:radial-gradient(900px 480px at 88% -8%, rgba(124,45,45,.05), transparent 60%);}
.fp-wrap{max-width:1140px;margin:0 auto}

/* header */
.fp-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;
  border-bottom:2px solid var(--ink);padding-bottom:18px}
.fp-brand{display:flex;align-items:center;gap:14px}
.fp-seal{width:48px;height:48px;border-radius:50%;flex:none;border:2px solid var(--seal);
  display:grid;place-items:center;color:var(--seal);font-family:var(--disp);font-weight:800;
  font-size:23px;background:var(--paper2);box-shadow:inset 0 0 0 3px var(--paper2),0 0 0 1px var(--seal)}
.fp-title{font-family:var(--disp);font-weight:800;font-size:30px;letter-spacing:-.5px;line-height:.95}
.fp-sub{font-family:var(--mono);font-size:10.5px;color:var(--seal);text-transform:uppercase;letter-spacing:3px;margin-top:7px}
.fp-tag{color:var(--ink2);font-size:13.5px;max-width:330px;text-align:right;font-style:italic;font-family:var(--disp);font-weight:500}

/* panels */
.fp-card{background:var(--paper2);border:1px solid var(--line);border-radius:4px;padding:24px}
.fp-mt{margin-top:22px}
.fp-label{font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:11px}

/* input */
.fp-ta{width:100%;min-height:200px;resize:vertical;background:var(--card);border:1px solid var(--line);
  border-radius:3px;color:var(--ink);font-family:var(--mono);font-size:12.5px;padding:15px;line-height:1.65}
.fp-ta:focus{outline:none;border-color:var(--accent)}
.fp-row{display:flex;gap:11px;flex-wrap:wrap;align-items:center;margin-top:14px}
.fp-btn{font-family:var(--sans);font-weight:600;font-size:14px;border-radius:3px;padding:12px 24px;
  border:1px solid var(--ink);cursor:pointer;transition:.15s;background:var(--paper2);color:var(--ink)}
.fp-btn:hover{background:#efeadd}
.fp-btn.primary{background:var(--ink);color:var(--paper2);border-color:var(--ink)}
.fp-btn.primary:hover{background:#000}
.fp-btn:disabled{opacity:.4;cursor:not-allowed}
.fp-count{font-family:var(--mono);font-size:12px;color:var(--muted);margin-left:auto}

/* scanning */
.fp-scan{margin-top:18px}
.fp-scanbar{height:3px;background:var(--line);border-radius:99px;overflow:hidden;position:relative}
.fp-scanbar:before{content:"";position:absolute;top:0;left:-40%;width:40%;height:100%;
  background:linear-gradient(90deg,transparent,var(--seal),transparent);animation:scan 1.1s ease-in-out infinite}
@keyframes scan{to{left:110%}}
.fp-scantxt{font-family:var(--mono);font-size:12px;color:var(--ink2);margin-top:10px}

.fp-err{background:var(--high-bg);border:1px solid var(--high);color:#8f2a2a;border-radius:3px;padding:12px 14px;font-size:13px;margin-top:14px}

/* verdict banner */
.fp-verdict{display:grid;grid-template-columns:230px 1fr;gap:26px;align-items:center;
  background:var(--ink);color:var(--paper2);border-radius:5px;padding:26px 28px}
.fp-gaugewrap{text-align:center}
.fp-score{font-family:var(--disp);font-weight:800;font-size:62px;line-height:.9}
.fp-scoremax{font-family:var(--mono);font-size:13px;opacity:.6}
.fp-zonelabel{font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:8px;padding:3px 10px;border-radius:99px;display:inline-block}
.fp-track{height:8px;border-radius:99px;margin-top:14px;position:relative;
  background:linear-gradient(90deg,var(--low) 0%,var(--med) 50%,var(--high) 100%)}
.fp-marker{position:absolute;top:-4px;width:3px;height:16px;background:var(--paper2);border-radius:2px;transform:translateX(-50%);box-shadow:0 0 0 2px var(--ink)}
.fp-vmeta .dt{font-family:var(--mono);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--seal);
  background:var(--paper2);display:inline-block;padding:4px 11px;border-radius:99px;margin-bottom:12px}
.fp-vline{font-family:var(--disp);font-weight:600;font-size:21px;line-height:1.25;margin-bottom:11px}
.fp-vsum{font-size:14px;opacity:.9;line-height:1.6}

/* impact strip */
.fp-impact{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.fp-stat{background:var(--paper2);border:1px solid var(--line);border-radius:4px;padding:17px 16px}
.fp-stat .v{font-family:var(--disp);font-weight:800;font-size:30px;letter-spacing:-.5px;line-height:1}
.fp-stat .k{font-family:var(--mono);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-top:8px}
.fp-stat.flag .v{color:var(--high)}

/* layout */
.fp-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:20px;align-items:start}

/* filters */
.fp-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.fp-chip{font-family:var(--mono);font-size:11.5px;padding:6px 13px;border-radius:99px;border:1px solid var(--line);
  background:var(--paper2);color:var(--muted);cursor:pointer;transition:.12s}
.fp-chip:hover{color:var(--ink)}
.fp-chip.on{background:var(--ink);color:var(--paper2);border-color:var(--ink)}

/* clause card */
.fp-clause{background:var(--card);border:1px solid var(--line);border-left-width:4px;border-radius:3px;
  padding:15px 17px;margin-bottom:12px;animation:rise .4s ease backwards}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fp-ctop{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:9px}
.fp-sev{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;
  padding:3px 9px;border-radius:3px;flex:none}
.fp-cat{font-family:var(--disp);font-weight:600;font-size:16px}
.fp-issue{font-size:14px;color:var(--ink2);line-height:1.55}
.fp-action{font-size:13px;margin-top:9px;padding-left:13px;border-left:2px solid var(--accent);color:var(--ink)}
.fp-action b{font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--accent);text-transform:uppercase}
.fp-excerpt{font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-top:9px;font-style:italic}
.fp-excerpt:before{content:'“'}.fp-excerpt:after{content:'”'}

/* side lists */
.fp-side{background:var(--paper2);border:1px solid var(--line);border-radius:4px;padding:20px;margin-bottom:16px}
.fp-li{display:flex;gap:10px;font-size:13.5px;color:var(--ink2);margin-bottom:10px;line-height:1.5;align-items:flex-start}
.fp-li .mk{flex:none;font-family:var(--mono);margin-top:1px}
.fp-li.ob .mk{color:var(--accent)}
.fp-li.mi .mk{color:var(--high)}
.fp-li.ng .mk{color:var(--seal)}

.fp-disc{margin-top:26px;padding-top:14px;border-top:1px solid var(--line);font-size:11.5px;color:var(--muted);
  font-style:italic;text-align:center;line-height:1.6}
.fp-foot{text-align:center;color:var(--faint);font-family:var(--mono);font-size:10px;letter-spacing:1.5px;margin-top:14px;text-transform:uppercase}

@media(max-width:860px){
  .fp-grid{grid-template-columns:1fr}
  .fp-verdict{grid-template-columns:1fr;gap:18px;text-align:center}
  .fp-impact{grid-template-columns:repeat(2,1fr)}
  .fp-tag{display:none}
  .fp-root{padding:18px 14px}
}
`;

/* ---- Realistic MESSY sample contract with planted red flags -------------- */
const SAMPLE_CONTRACT = `FREELANCE WEB DEVELOPMENT SERVICES AGREEMENT

This Agreement is entered into between BrightPeak Media Pvt. Ltd. ("Client") and the undersigned independent contractor ("Contractor").

1. SCOPE. Contractor shall design and develop a website and provide such other services as the Client may require from time to time. Contractor agrees to make unlimited revisions until the Client is fully satisfied, in the Client's sole judgment.

2. FEES & PAYMENT. Total fee is $5,000. Payment shall be made within sixty (60) days of final acceptance. The Client may, at its sole discretion, withhold or reduce payment if it is not satisfied with the work. No interest shall accrue on late or withheld payments.

3. DELIVERY. Time is of the essence. For every day a deliverable is late, Contractor shall pay the Client a penalty of ten percent (10%) of the total fee per day.

4. INTELLECTUAL PROPERTY. All work product, and any pre-existing tools, code libraries, frameworks, or materials used by the Contractor, shall become the exclusive property of the Client upon commencement of work.

5. NON-COMPETE. For a period of two (2) years following termination, Contractor shall not provide services to any business operating in the media, marketing, or technology sectors, anywhere.

6. TERMINATION. The Client may terminate this Agreement at any time, for any reason, without notice and without obligation to pay for work performed but not yet accepted. Contractor must provide ninety (90) days written notice to terminate.

7. LIABILITY & INDEMNITY. Contractor shall be liable for any and all damages, including indirect, incidental, and consequential damages, without limit. Contractor shall indemnify and hold harmless the Client against any claims arising from the engagement.

8. CONFIDENTIALITY. Contractor shall keep all information confidential in perpetuity, including information already in the public domain.

9. RENEWAL. This Agreement shall automatically renew for successive one-year terms unless cancelled in writing at least ninety (90) days before the renewal date.

10. GOVERNING LAW. This Agreement is governed by the laws of the Client's registered jurisdiction. Any disputes shall be resolved solely through arbitration chosen by the Client.`;

/* ---- API helper: calls our serverless proxy, returns parsed JSON ---------- */
async function askAI(prompt) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `API ${res.status}`);
  }
  const { text } = await res.json();
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const m = clean.match(/\{[\s\S]*\}/); // grab the JSON object defensively
  return JSON.parse(m ? m[0] : clean);
}

/* ---- Prompt builder ------------------------------------------------------ */
const analyzePrompt = (text) => `You are a meticulous contracts analyst helping a NON-lawyer (a freelancer or small-business owner) understand a contract before they sign it. Analyze the document below from the perspective of the person being asked to sign. It may be messy or poorly formatted.

Return ONLY this JSON (no markdown, no commentary):
{"doc_type":"<e.g. Freelance Services Agreement, NDA, Lease, SaaS Terms>","risk_score":<integer 0-100, higher = riskier/more one-sided for the signer>,"verdict":"<one blunt headline sentence>","summary":"<2-3 plain-English sentences: what they are actually agreeing to>","flags":[{"severity":"high|medium|low","category":"<short, e.g. Liability, Payment, Termination, IP, Non-compete, Auto-renewal, Confidentiality, Indemnity>","issue":"<plain-English explanation of the risk, NO legalese>","action":"<what to do or negotiate>","excerpt":"<=12 word snippet from the actual clause"}],"obligations":["<a key duty or deadline the signer must meet>"],"missing":["<a protection a fair contract would include but this one lacks>"],"negotiation":["<a concrete change to ask for>"]}

Rules:
- Surface the 6-12 MOST important flags, ordered highest severity first.
- Be specific to THIS contract; quote real terms. Never generic.
- Call out clauses that are unusually one-sided.
- Plain English only — write for someone with no legal training.

CONTRACT:
${text}`;

/* ---- helpers ------------------------------------------------------------- */
const zoneOf = (s) => (s >= 67 ? "high" : s >= 34 ? "med" : "low");
const zoneLabel = { high: "High risk", med: "Moderate risk", low: "Low risk" };
const SEV = {
  high: { c: "var(--high)", bg: "var(--high-bg)" },
  medium: { c: "var(--med)", bg: "var(--med-bg)" },
  low: { c: "var(--low)", bg: "var(--low-bg)" },
};
const sevRank = { high: 0, medium: 1, low: 2 };

/* ========================================================================== */
export default function FinePrint() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [err, setErr] = useState("");

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const wordCount = useMemo(() => raw.trim() ? raw.trim().split(/\s+/).length : 0, [raw]);

  async function analyze() {
    if (!raw.trim()) { setErr("Paste a contract, or load the sample to see it work."); return; }
    setErr(""); setBusy(true); setResult(null); setFilter("ALL");
    const start = Date.now();
    const msgs = ["Reading the document…", "Identifying clauses…", "Assessing risk and one-sided terms…", "Drafting plain-English findings…"];
    let i = 0; setScanMsg(msgs[0]);
    const timer = setInterval(() => { i = (i + 1) % msgs.length; setScanMsg(msgs[i]); }, 1400);
    try {
      const out = await askAI(analyzePrompt(raw));
      setResult(out);
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
    } catch (e) {
      setErr(`Something went wrong while analyzing (${e.message}). Please try again.`);
    } finally {
      clearInterval(timer); setBusy(false);
    }
  }

  const flags = result?.flags || [];
  const metrics = useMemo(() => {
    if (!result) return null;
    const high = flags.filter((f) => f.severity === "high").length;
    const estMin = Math.min(90, Math.max(20, Math.round(wordCount / 100) + 15));
    return { total: flags.length, high, estMin, zone: zoneOf(result.risk_score || 0) };
  }, [result, flags, wordCount]);

  const shownFlags = useMemo(() => {
    const f = filter === "ALL" ? flags : flags.filter((x) => x.severity === filter);
    return [...f].sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
  }, [flags, filter]);

  return (
    <div className="fp-root">
      <div className="fp-wrap">

        <div className="fp-head">
          <div className="fp-brand">
            <div className="fp-seal">§</div>
            <div>
              <div className="fp-title">FinePrint</div>
              <div className="fp-sub">AI Contract Risk Analyzer</div>
            </div>
          </div>
          <div className="fp-tag">Read the fine print before you sign it — in seconds, in plain English.</div>
        </div>

        <div className="fp-card fp-mt">
          <div className="fp-label">Paste a contract · NDA · lease · freelance agreement · terms of service</div>
          <textarea
            className="fp-ta"
            placeholder="Paste the full contract text here… or load the sample contract to see how it works."
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            disabled={busy}
          />
          <div className="fp-row">
            <button className="fp-btn primary" onClick={analyze} disabled={busy}>
              {busy ? "Analyzing…" : "Analyze contract"}
            </button>
            <button className="fp-btn" onClick={() => setRaw(SAMPLE_CONTRACT)} disabled={busy}>Load sample contract</button>
            <button className="fp-btn" onClick={() => { setRaw(""); setResult(null); setErr(""); }} disabled={busy}>Clear</button>
            <span className="fp-count">{wordCount} words</span>
          </div>

          {busy && (
            <div className="fp-scan">
              <div className="fp-scanbar" />
              <div className="fp-scantxt">{scanMsg}</div>
            </div>
          )}
          {err && <div className="fp-err">{err}</div>}
        </div>

        {result && (
          <>
            {/* verdict banner */}
            <div className="fp-verdict fp-mt">
              <div className="fp-gaugewrap">
                <div className="fp-score" style={{ color: `var(--${metrics.zone === "med" ? "med" : metrics.zone})` }}>
                  {result.risk_score}<span className="fp-scoremax"> /100</span>
                </div>
                <div
                  className="fp-zonelabel"
                  style={{ background: `var(--${metrics.zone}-bg)`, color: `var(--${metrics.zone})` }}
                >
                  {zoneLabel[metrics.zone]}
                </div>
                <div className="fp-track">
                  <div className="fp-marker" style={{ left: `${Math.min(100, Math.max(0, result.risk_score))}%` }} />
                </div>
              </div>
              <div className="fp-vmeta">
                {result.doc_type && <div className="dt">{result.doc_type}</div>}
                <div className="fp-vline">{result.verdict}</div>
                <div className="fp-vsum">{result.summary}</div>
              </div>
            </div>

            {/* impact strip */}
            <div className="fp-impact fp-mt">
              <div className="fp-stat"><div className="v">{metrics.total}</div><div className="k">Issues flagged</div></div>
              <div className="fp-stat flag"><div className="v">{metrics.high}</div><div className="k">High-risk clauses</div></div>
              <div className="fp-stat"><div className="v">{elapsed}s</div><div className="k">Review time</div></div>
              <div className="fp-stat"><div className="v">~{metrics.estMin}m</div><div className="k">Manual review saved</div></div>
            </div>

            {/* main grid */}
            <div className="fp-grid fp-mt">
              <div>
                <div className="fp-filters">
                  {["ALL", "high", "medium", "low"].map((f) => (
                    <span key={f} className={`fp-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
                      {f === "ALL" ? `All · ${flags.length}` : `${f} · ${flags.filter((x) => x.severity === f).length}`}
                    </span>
                  ))}
                </div>

                {shownFlags.map((f, i) => (
                  <div key={i} className="fp-clause" style={{ borderLeftColor: SEV[f.severity]?.c, animationDelay: `${i * 45}ms` }}>
                    <div className="fp-ctop">
                      <span className="fp-sev" style={{ background: SEV[f.severity]?.bg, color: SEV[f.severity]?.c }}>{f.severity}</span>
                      <span className="fp-cat">{f.category}</span>
                    </div>
                    <div className="fp-issue">{f.issue}</div>
                    {f.action && <div className="fp-action"><b>Do this</b><br />{f.action}</div>}
                    {f.excerpt && <div className="fp-excerpt">{f.excerpt}</div>}
                  </div>
                ))}
              </div>

              <div>
                {result.obligations?.length > 0 && (
                  <div className="fp-side">
                    <div className="fp-label">Your obligations &amp; deadlines</div>
                    {result.obligations.map((o, i) => (
                      <div className="fp-li ob" key={i}><span className="mk">▸</span><span>{o}</span></div>
                    ))}
                  </div>
                )}
                {result.missing?.length > 0 && (
                  <div className="fp-side">
                    <div className="fp-label">Missing protections</div>
                    {result.missing.map((m, i) => (
                      <div className="fp-li mi" key={i}><span className="mk">✕</span><span>{m}</span></div>
                    ))}
                  </div>
                )}
                {result.negotiation?.length > 0 && (
                  <div className="fp-side">
                    <div className="fp-label">Negotiation checklist</div>
                    {result.negotiation.map((n, i) => (
                      <div className="fp-li ng" key={i}><span className="mk">□</span><span>{n}</span></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="fp-disc">
              FinePrint provides an automated, informational first-pass review to help you spot issues.
              It is not legal advice and is not a substitute for a qualified lawyer.
            </div>
          </>
        )}

        <div className="fp-foot">FinePrint · reads legalese → flags risk → tells you what to negotiate</div>
      </div>
    </div>
  );
}

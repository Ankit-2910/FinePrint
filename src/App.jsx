import { useState, useRef } from 'react';
import './App.css';

const SAMPLE_CONTRACT = `SERVICE AGREEMENT

This Agreement is entered into between Client ("Client") and Service Provider ("Provider").

1. SERVICES: Provider agrees to deliver consulting services as outlined in the attached Statement of Work.

2. PAYMENT: Client shall pay Provider $5,000 per month, due within 15 days of invoice.

3. TERM: This agreement commences on the Effective Date and continues for 12 months, auto-renewing unless cancelled.

4. TERMINATION: Provider may terminate this agreement at any time with 5 days notice. Client must provide 90 days notice to terminate.

5. LIABILITY: Provider's total liability under this agreement shall not exceed one month's fees, regardless of the nature of the claim.

6. INTELLECTUAL PROPERTY: All work product, including pre-existing Provider materials incorporated into deliverables, shall become the exclusive property of Provider.

7. CONFIDENTIALITY: Client agrees to keep all Provider pricing and methodologies confidential for 5 years post-termination.

8. GOVERNING LAW: This agreement is governed by the laws of the jurisdiction specified by Provider.`;

function App() {
  const [contractText, setContractText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const wordCount = contractText.trim() ? contractText.trim().split(/\s+/).length : 0;

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);
    try {
      const prompt = `You are a contract risk analyzer. Analyze the following contract and return ONLY valid JSON (no markdown fences) matching exactly this shape:
{"riskScore": <integer 0-100, higher = riskier>, "risks": [{"clause": "<short clause name/section>", "issue": "<plain-English description of the risk>", "severity": "High"|"Medium"|"Low"}], "recommendations": ["<specific negotiation ask>"]}
Flag only the most consequential clauses (aim for 3-6 risks).

Contract:
${contractText}`;
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(JSON.parse(data.text));
    } catch (e) {
      setError(e.message || 'Something went wrong analyzing this contract.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setContractText(SAMPLE_CONTRACT);
    setFileName('sample-contract.txt');
    setAnalysis(null);
  };

  const handleClear = () => {
    setContractText('');
    setFileName('');
    setAnalysis(null);
  };

  const readFile = (file) => {
    if (!file) return;
    file.text().then(text => {
      setContractText(text);
      setFileName(file.name);
      setAnalysis(null);
    });
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) readFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) readFile(e.dataTransfer.files[0]);
  };

  const severityColor = (s) => {
    if (s === 'High') return '#ef4444';
    if (s === 'Medium') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div className="fp-app">
      <header className="fp-header">
        <div className="fp-header-inner">
          <div className="fp-brand">
            <div className="fp-logo">§</div>
            <div>
              <h1>FinePrint</h1>
              <p className="fp-eyebrow">AI CONTRACT RISK ANALYZER</p>
            </div>
          </div>
          <p className="fp-tagline">
            Read the fine print before you sign it — in seconds,<br />
            in plain English.
          </p>
        </div>
      </header>

      <main className="fp-main">
        <div className="fp-input-label">
          PASTE A CONTRACT · NDA · LEASE · FREELANCE AGREEMENT · TERMS OF SERVICE
        </div>

        <section
          className={`fp-dropzone ${isDragging ? 'fp-dropzone-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            className="fp-textarea"
            value={contractText}
            onChange={(e) => { setContractText(e.target.value); setAnalysis(null); }}
            placeholder="Paste the full contract text here, drag & drop a file, or load the sample contract to see how it works."
          />
          <div className="fp-dropzone-footer">
            <span className="fp-dropzone-hint">⬆ Drag &amp; drop a .txt file anywhere in this box</span>
            {fileName && <span className="fp-filename">📄 {fileName}</span>}
          </div>
        </section>

        <section className="fp-controls">
          <button className="fp-btn fp-btn-primary" onClick={handleAnalyze} disabled={isAnalyzing || !contractText.trim()}>
            {isAnalyzing ? '⏳ Analyzing…' : '🔍 Analyze contract'}
          </button>
          <button className="fp-btn fp-btn-secondary" onClick={handleLoadSample}>
            Load sample contract
          </button>
          <button className="fp-btn fp-btn-secondary" onClick={() => fileInputRef.current?.click()}>
            ＋ Add Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          <button className="fp-btn fp-btn-tertiary" onClick={handleClear}>
            Clear
          </button>
          <div className="fp-count">{wordCount} words</div>
        </section>

        {error && (
          <section className="fp-results">
            <div className="fp-risk-issue" style={{ color: '#ef4444' }}>⚠ {error}</div>
          </section>
        )}

        {analysis && (
          <section className="fp-results">
            <div className="fp-score-row">
              <div className="fp-score-circle" style={{
                background: `conic-gradient(#ef4444 0% ${analysis.riskScore}%, #1c1c1c ${analysis.riskScore}% 100%)`
              }}>
                <div className="fp-score-inner">{analysis.riskScore}</div>
              </div>
              <div>
                <div className="fp-score-label">RISK SCORE</div>
                <div className="fp-score-sub">Moderate-to-high risk — review flagged clauses before signing</div>
              </div>
            </div>

            <div className="fp-risks">
              <div className="fp-section-title">Flagged Clauses</div>
              {analysis.risks.map((r, i) => (
                <div key={i} className="fp-risk-row">
                  <span className="fp-severity" style={{ color: severityColor(r.severity), borderColor: severityColor(r.severity) }}>
                    {r.severity}
                  </span>
                  <div>
                    <div className="fp-risk-clause">{r.clause}</div>
                    <div className="fp-risk-issue">{r.issue}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fp-recommendations">
              <div className="fp-section-title">What To Negotiate</div>
              <ul>
                {analysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <footer className="fp-footer">
          FINEPRINT · reads legalese → flags risk → tells you what to negotiate
        </footer>
      </main>
    </div>
  );
}

export default App;

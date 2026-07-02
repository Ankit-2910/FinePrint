import {useState} from 'react';
import './App.css';
function App(){
  const [contract,setContract]=useState('');
  const [analysis,setAnalysis]=useState(null);
  return <div style={{background:'#0f0f0f',color:'#fff',minHeight:'100vh'}}>
    <header style={{padding:'30px',background:'#1a1a1a'}}>
      <h1 style={{color:'#60a5fa',fontSize:'28px'}}>FinePrint</h1>
      <p style={{fontSize:'12px',color:'#888'}}>AI CONTRACT ANALYZER</p>
    </header>
    <main style={{maxWidth:'1200px',margin:'0 auto',padding:'40px'}}>
      <textarea style={{width:'100%',height:'300px',background:'#1a1a1a',border:'1px solid #333',borderRadius:'6px',padding:'15px',color:'#fff',fontFamily:'monospace',marginBottom:'30px'}} value={contract} onChange={(e)=>setContract(e.target.value)} placeholder="Paste contract..."/>
      <div style={{display:'flex',gap:'12px',marginBottom:'40px'}}>
        <button onClick={()=>setAnalysis({score:72,risks:['Unfavorable terms','Liability limits','IP ambiguity']})} style={{padding:'10px 20px',background:'#60a5fa',color:'#000',border:'none',borderRadius:'6px',fontWeight:'600',cursor:'pointer'}}>🔍 Analyze</button>
        <button onClick={()=>setContract('SERVICE AGREEMENT...')} style={{padding:'10px 20px',background:'#333',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer'}}>Load Sample</button>
      </div>
      {analysis&&<div style={{padding:'30px',background:'#1a1a1a',borderRadius:'6px',border:'1px solid #333'}}>
        <h3 style={{color:'#60a5fa',marginBottom:'20px'}}>Risk Score: {analysis.score}</h3>
        <h4>Risks:</h4><ul>{analysis.risks.map((r,i)=><li key={i} style={{color:'#aaa'}}>⚠️ {r}</li>)}</ul>
      </div>}
    </main>
  </div>;
}
export default App;

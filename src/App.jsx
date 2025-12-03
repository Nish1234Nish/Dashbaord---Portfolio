import React, { useEffect, useMemo, useState } from "react";
import { initialData } from "./data";
import CompanyCard from "./components/CompanyCard";
import DetailPanel from "./components/DetailPanel";

function useLocalData(key, defaultValue) {
  const [state, setState] = useState(()=>{
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : defaultValue; }
    catch(e){ return defaultValue; }
  });
  useEffect(()=> localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
}

export default function App(){
  const [data, setData] = useLocalData("portfolioData.v1", initialData);
  const [activeTab, setActiveTab] = useState("overview");
  const [sectorFilter, setSectorFilter] = useState("");
  const [bucketFilter, setBucketFilter] = useState("");
  const [openItem, setOpenItem] = useState(null);

  useEffect(()=>{},[]);

  const sectors = useMemo(()=>[...new Set(data.map(d=>d.sector))].sort(),[data]);

  const summary = useMemo(()=>{
    const totalInvested = data.reduce((s,d)=>s+d.invested,0);
    const totalCV = data.reduce((s,d)=>s+(d.currentValue||0),0);
    const avgMOIC = (data.reduce((s,d)=>s+(d.moic||0),0)/data.length) || 0;
    const companies = new Set(data.map(d=>d.company)).size;
    return { totalInvested, totalCV, avgMOIC, companies };
  },[data]);

  function filtered(){ return data.filter(d=>
    (sectorFilter ? d.sector === sectorFilter : true) &&
    (bucketFilter ? d.bucket === bucketFilter : true)
  );}

  function groupedBySector(){
    const filt = filtered();
    const map = {};
    filt.forEach(d => { map[d.sector] = map[d.sector] || []; map[d.sector].push(d); });
    return map;
  }

  function onOpen(d){ setOpenItem(d); }
  function onClose(){ setOpenItem(null); }
  function onAction(item, action){ alert(`${action.toUpperCase()} — ${item.company}`); }

  function handleSave(updated){
    const idx = data.findIndex(d=>d.company===updated.company && d.scheme===updated.scheme);
    const newData = [...data];
    if(idx>=0) newData[idx] = updated;
    else newData.push(updated);
    setData(newData);
    setOpenItem(updated);
  }

  function renderOverview(){
    return (
      <div>
        <div className="summary-grid">
          <div className="summary-card"><div className="summary-label">Total Invested</div><div className="summary-value">₹{(summary.totalInvested/10000000).toFixed(2)} Cr</div></div>
          <div className="summary-card"><div className="summary-label">Current Value</div><div className="summary-value">₹{(summary.totalCV/10000000).toFixed(2)} Cr</div></div>
          <div className="summary-card"><div className="summary-label">Avg MOIC</div><div className="summary-value">{summary.avgMOIC.toFixed(2)}x</div></div>
          <div className="summary-card"><div className="summary-label">Companies</div><div className="summary-value">{summary.companies}</div></div>
        </div>
      </div>
    );
  }

  function renderSectorGrid(){
    const grouped = groupedBySector();
    return (
      <div>
        {Object.entries(grouped).map(([sector, items])=>(
          <div key={sector} style={{marginBottom:20}}>
            <h2 style={{color:"var(--primary)",marginBottom:10}}>{sector}</h2>
            <div className="grid-sector">
              {items.map((d, i) => <CompanyCard key={d.scheme+i} d={d} onOpen={onOpen} onAction={onAction} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderBucketGrid(){
    const groups = [
      {name:"Bucket A", main:"A", subs:["A1","A2","A3"]},
      {name:"Bucket B", main:"B", subs:["B1","B2","B3"]},
      {name:"Bucket C", main:"C", subs:["C"]}
    ];
    return (
      <div>
        {groups.map(g=>{
          const items = filtered().filter(d=>d.bucket===g.main);
          if(items.length===0) return null;
          return (
            <div key={g.main} style={{marginBottom:20}}>
              <h2 style={{color:"var(--primary)"}}>{g.name}</h2>
              <div className="grid-bucket">
                {items.map((d,i)=><CompanyCard key={d.scheme+i} d={d} onOpen={onOpen} onAction={onAction} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderProgression(){
    const progressions = data.filter(d => d.bucket !== ( (d.currentBucket||"").charAt(0) ));
    if(progressions.length===0) return <p style={{padding:20,color:"var(--text-secondary)"}}>No bucket progressions</p>;
    return (
      <table className="progression-table">
        <thead><tr><th>Company</th><th>Investment Bucket</th><th>Current Bucket</th><th>2028 Bucket</th><th>Progress</th></tr></thead>
        <tbody>
          {progressions.map((d,i)=>{
            const invBucket = `${d.bucket}${d.subBucket ? d.subBucket.charAt(1):""}`;
            return <tr key={i}><td>{d.company}</td><td>{invBucket}</td><td>{d.currentBucket}</td><td>{d.bucket2028||"NPA"}</td><td>{invBucket} → {d.currentBucket}</td></tr>;
          })}
        </tbody>
      </table>
    );
  }

  function renderFollowOn(){
    const follow = data.filter(d=>(d.moic2028||0)>1.5);
    if(follow.length===0) return <p style={{padding:20,color:"var(--text-secondary)"}}>No follow-on candidates</p>;
    return <div className="grid-sector">{follow.map((d,i)=><CompanyCard key={i} d={d} onOpen={onOpen} onAction={onAction} />)}</div>;
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "portfolio-data.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const r = new FileReader();
    r.onload = ()=> { try{ const parsed = JSON.parse(r.result); setData(parsed); alert("Imported"); }catch(err){ alert("Invalid JSON"); } };
    r.readAsText(file);
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>Portfolio Dashboard</h1>
          <p style={{marginTop:6,color:"var(--text-secondary)"}}>Interactive executive view — editable & saved locally</p>
        </div>
      </header>

      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab==="overview"?"active":""}`} onClick={()=>setActiveTab("overview")}>Overview</button>
        <button className={`tab-btn ${activeTab==="sector"?"active":""}`} onClick={()=>setActiveTab("sector")}>Sector Grid</button>
        <button className={`tab-btn ${activeTab==="bucket"?"active":""}`} onClick={()=>setActiveTab("bucket")}>Bucket Grid</button>
        <button className={`tab-btn ${activeTab==="progress"?"active":""}`} onClick={()=>setActiveTab("progress")}>Bucket Progression</button>
        <button className={`tab-btn ${activeTab==="follow"?"active":""}`} onClick={()=>setActiveTab("follow")}>Follow-On</button>
      </div>

      <div style={{display:"flex",gap:12,marginBottom:14}}>
        <div style={{flex:1}} className="filter-bar">
          <div style={{display:"flex",flexDirection:"column"}}>
            <label style={{fontSize:12,fontWeight:700,color:"var(--text-secondary)"}}>Sector</label>
            <select value={sectorFilter} onChange={(e)=>setSectorFilter(e.target.value)}>
              <option value="">All Sectors</option>
              {sectors.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{display:"flex",flexDirection:"column"}}>
            <label style={{fontSize:12,fontWeight:700,color:"var(--text-secondary)"}}>Bucket</label>
            <select value={bucketFilter} onChange={(e)=>setBucketFilter(e.target.value)}>
              <option value="">All</option>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
        </div>

        <div style={{alignSelf:"center",display:"flex",gap:8}}>
          <button className="tab-btn" onClick={exportJSON}>Export JSON</button>
          <label className="tab-btn" style={{cursor:"pointer"}}>
            Import JSON
            <input type="file" accept=".json" style={{display:"none"}} onChange={importJSON} />
          </label>
          <button className="tab-btn" onClick={()=>{ if(window.confirm("Reset to original sample data?")) { setData(initialData); } }}>Reset</button>
        </div>
      </div>

      <main>
        {activeTab==="overview" && renderOverview()}
        {activeTab==="sector" && renderSectorGrid()}
        {activeTab==="bucket" && renderBucketGrid()}
        {activeTab==="progress" && renderProgression()}
        {activeTab==="follow" && renderFollowOn()}
      </main>

      <DetailPanel openItem={openItem} onClose={onClose} onSave={handleSave} />
    </div>
  );
}

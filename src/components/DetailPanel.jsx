import React, { useState, useEffect } from "react";

export default function DetailPanel({ openItem, onClose, onSave }) {
  const [valCr, setValCr] = useState("");
  const [moic, setMoic] = useState("");
  const [bucket, setBucket] = useState("NPA");

  useEffect(()=>{
    if(!openItem) return;
    setValCr(((openItem.valuation2028||0)/10000000).toFixed(2));
    setMoic((openItem.moic2028||0).toFixed(2));
    setBucket(openItem.bucket2028 || "NPA");
  },[openItem]);

  if(!openItem) return null;

  return (
    <div className={`detail-panel ${openItem ? "open":""}`}>
      <div className="detail-header">
        <button style={{position:"absolute",right:12,top:12,background:"rgba(255,255,255,0.2)",border:0,color:"#fff",fontSize:20,width:36,height:36,borderRadius:6}} onClick={onClose}>×</button>
        <h2 style={{margin:0}}>{openItem.company}</h2>
        <div style={{fontSize:13,opacity:0.9}}>{openItem.sector} • {openItem.scheme}</div>
      </div>
      <div className="detail-body">
        <h3>Investment details</h3>
        <div style={{display:"flex",gap:12,marginBottom:10}}>
          <div style={{flex:1}}>
            <div className="detail-value-label">Amount Invested</div>
            <div className="detail-value-text">₹{(openItem.invested/10000000).toFixed(2)} Cr</div>
          </div>
          <div style={{flex:1}}>
            <div className="detail-value-label">Age</div>
            <div className="detail-value-text">{openItem.age} days</div>
          </div>
        </div>

        <h3>Current status</h3>
        <div style={{display:"flex",gap:12,marginBottom:10}}>
          <div style={{flex:1}}>
            <div className="detail-value-label">Valuation</div>
            <div className="detail-value-text">₹{((openItem.valuation||0)/10000000).toFixed(2)} Cr</div>
          </div>
          <div style={{flex:1}}>
            <div className="detail-value-label">Current MOIC</div>
            <div className="detail-value-text">{(openItem.moic||0).toFixed(2)}x</div>
          </div>
        </div>

        <h3>2028 projections (editable)</h3>
        <div className="edit-container">
          <label>2028 valuation (₹ Crores)</label>
          <input type="number" value={valCr} onChange={e=>setValCr(e.target.value)} />
          <label>2028 MOIC</label>
          <input type="number" value={moic} onChange={e=>setMoic(e.target.value)} step="0.01" />
          <label>2028 Bucket</label>
          <select value={bucket} onChange={e=>setBucket(e.target.value)}>
            <option value="NPA">NPA</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="A3">A3</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
            <option value="C">C</option>
          </select>
          <button className="edit-btn" onClick={()=>{
            const newData = {
              ...openItem,
              valuation2028: isNaN(parseFloat(valCr)) ? 0 : Math.round(parseFloat(valCr)*10000000),
              moic2028: isNaN(parseFloat(moic)) ? 0 : parseFloat(moic),
              bucket2028: bucket || "NPA"
            };
            onSave(newData);
          }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

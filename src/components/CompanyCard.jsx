import React from "react";
import clsx from "clsx";

export default function CompanyCard({ d, onOpen, onAction }) {
  const bucketClass = d.bucket === "A" ? "badge-bucket-a" : d.bucket === "B" ? "badge-bucket-b" : "badge-bucket-c";
  const val = d.valuation || 0;
  const val2028 = d.valuation2028 || 0;
  const valGapPct = val ? Math.round(((val2028 - val) / val) * 100) : 0;

  return (
    <div className="card" onClick={() => onOpen(d)}>
      <div className="card-header">
        <div>
          <div className="card-title">{d.company}</div>
          <div style={{fontSize:12,color:"var(--text-secondary)"}}>{d.scheme}</div>
        </div>
        <div className="card-badge badge-sector">{d.sector}</div>
      </div>

      <div className="metric-row">
        <div className="metric">
          <div className="metric-label">Investment</div>
          <div className="metric-value">₹{(d.invested/10000000).toFixed(2)} Cr</div>
        </div>
        <div className="metric">
          <div className="metric-label">MOIC</div>
          <div className={clsx("metric-value", d.moic >= 1 ? "positive" : "negative")}>{d.moic.toFixed(2)}x</div>
        </div>
      </div>

      <div className="metric-row">
        <div className="metric">
          <div className="metric-label">2028 MOIC</div>
          <div className={clsx("metric-value", (d.moic2028||0) >= 1 ? "positive":"negative")}>{(d.moic2028||0).toFixed(2)}x</div>
        </div>
        <div className="metric">
          <div className="metric-label">Valuation gap</div>
          <div className={clsx("metric-value", valGapPct >= 0 ? "positive":"negative")}>{isFinite(valGapPct) ? valGapPct+"%": "0%"}</div>
        </div>
      </div>

      <div className="metric-row">
        <div style={{flex:1}}>
          <div className="metric-label">Current bucket</div>
          <div className={`card-badge ${bucketClass}`} style={{marginTop:6}}>{d.currentBucket}</div>
        </div>
        <div style={{flex:1}}>
          <div className="metric-label">2028 bucket</div>
          <div className="card-badge" style={{marginTop:6}}>{d.bucket2028 || "NPA"}</div>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-small" onClick={(e)=>{e.stopPropagation(); onAction(d,"exit")}}>🚪 Exit</button>
        <button className="btn-small" onClick={(e)=>{e.stopPropagation(); onAction(d,"followon")}}>💰 Follow-on</button>
        <button className="btn-small" onClick={(e)=>{e.stopPropagation(); onAction(d,"monitor")}}>👁 Monitor</button>
      </div>
    </div>
  );
}

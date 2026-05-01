import { useEffect, useState } from "react";
import { getTransactionLog, clearTransactionLog, downloadLog } from "../utils/txLogger";

const TYPE_LABELS = {
  CANDIDATE_REGISTRATION: { label: "Candidate Registration", icon: "🏛", color: "var(--accent1)" },
  VOTE_CAST: { label: "Vote Cast", icon: "🗳", color: "var(--success)" },
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatBalance(val) {
  if (val === null || val === undefined) return "—";
  const num = parseFloat(val);
  return `${num.toFixed(6)} ETH`;
}

function formatChange(val) {
  if (val === null || val === undefined) return "—";
  const num = parseFloat(val);
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(6)} ETH`;
}

export default function TxLogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(getTransactionLog().slice().reverse());
  }, []);

  const handleClear = () => {
    if (window.confirm("Clear all transaction logs? This cannot be undone.")) {
      clearTransactionLog();
      setLogs([]);
    }
  };

  const handleDownload = () => {
    downloadLog();
  };

  return (
    <main className="page txlog-page">
      <div className="page-header">
        <h1 className="page-title">Transaction <span className="gradient-text">Log</span></h1>
        <p className="page-sub">
          A local record of all on-chain actions performed in this browser session —
          registrations, votes, wallet addresses, and balance changes.
        </p>
      </div>

      <div className="txlog-toolbar">
        <span className="txlog-count">
          {logs.length} transaction{logs.length !== 1 ? "s" : ""} logged
        </span>
        <div className="txlog-actions">
          <button className="btn-secondary" onClick={handleDownload} disabled={logs.length === 0}>
            ⬇ Download JSON
          </button>
          <button className="btn-danger" onClick={handleClear} disabled={logs.length === 0}>
            🗑 Clear Log
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state card">
          <p>No transactions logged yet. Register a candidate or cast a vote to see entries here.</p>
        </div>
      ) : (
        <div className="txlog-list">
          {logs.map((entry) => {
            const meta = TYPE_LABELS[entry.type] || { label: entry.type, icon: "📋", color: "var(--muted)" };
            const change = entry.balanceChange ? parseFloat(entry.balanceChange) : null;
            return (
              <div key={entry.id} className="txlog-entry card">
                <div className="txlog-entry-header">
                  <span className="txlog-type-icon">{meta.icon}</span>
                  <span className="txlog-type-label" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="txlog-timestamp muted">{formatDate(entry.timestamp)}</span>
                </div>

                <div className="txlog-grid">
                  <div className="txlog-field">
                    <span className="txlog-field-label">Wallet</span>
                    <code className="addr txlog-field-value">{entry.wallet}</code>
                  </div>

                  {entry.candidateName && (
                    <div className="txlog-field">
                      <span className="txlog-field-label">Candidate</span>
                      <span className="txlog-field-value">{entry.candidateName}</span>
                    </div>
                  )}

                  {entry.fee && (
                    <div className="txlog-field">
                      <span className="txlog-field-label">Fee Paid</span>
                      <span className="txlog-field-value">{entry.fee} ETH</span>
                    </div>
                  )}

                  <div className="txlog-field">
                    <span className="txlog-field-label">Balance Before</span>
                    <span className="txlog-field-value">{formatBalance(entry.balanceBefore)}</span>
                  </div>

                  <div className="txlog-field">
                    <span className="txlog-field-label">Balance After</span>
                    <span className="txlog-field-value">{formatBalance(entry.balanceAfter)}</span>
                  </div>

                  <div className="txlog-field">
                    <span className="txlog-field-label">Balance Change</span>
                    <span
                      className="txlog-field-value txlog-change"
                      style={{ color: change === null ? "var(--muted)" : change >= 0 ? "var(--success)" : "var(--error)" }}
                    >
                      {formatChange(entry.balanceChange)}
                    </span>
                  </div>

                  {entry.txHash && (
                    <div className="txlog-field txlog-field-full">
                      <span className="txlog-field-label">Tx Hash</span>
                      <code className="txlog-hash">{entry.txHash}</code>
                    </div>
                  )}

                  {entry.blockNumber && (
                    <div className="txlog-field">
                      <span className="txlog-field-label">Block</span>
                      <span className="txlog-field-value">#{entry.blockNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

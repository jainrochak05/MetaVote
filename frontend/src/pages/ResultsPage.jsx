import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, RPC_URL } from "../contract";

export default function ResultsPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadResults = useCallback(async () => {
    try {
      // Prefer injected provider, fall back to JSON-RPC for read-only access
      const provider = window.ethereum
        ? new ethers.BrowserProvider(window.ethereum)
        : new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const fetched = await contract.getAllCandidates();
      const list = fetched.map((c, i) => ({
        id: i,
        name: c.name,
        manifestoHash: c.manifestoHash,
        voteCount: Number(c.voteCount),
        wallet: c.wallet,
      }));
      list.sort((a, b) => b.voteCount - a.voteCount);
      setCandidates(list);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 10000);
    return () => clearInterval(interval);
  }, [loadResults]);

  const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);
  const leader = candidates[0];

  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <main className="page results-page">
      <div className="page-header">
        <h1 className="page-title">Live <span className="gradient-text">Results</span></h1>
        <p className="page-sub">
          Results update every 10 seconds. Total votes cast: <strong>{totalVotes}</strong>.
          {lastUpdated && (
            <span className="last-updated"> Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </p>
      </div>

      {leader && leader.voteCount > 0 && (
        <div className="leader-banner card">
          <div className="leader-crown">👑</div>
          <div className="leader-info">
            <p className="leader-label">Current Leader</p>
            <h2 className="leader-name">{leader.name}</h2>
            <p className="leader-stats">
              {leader.voteCount} vote{leader.voteCount !== 1 ? "s" : ""} ·{" "}
              {totalVotes > 0 ? Math.round((leader.voteCount / totalVotes) * 100) : 0}% of total
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading results…</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state card">
          <p>No candidates have registered yet.</p>
        </div>
      ) : (
        <div className="results-list">
          {candidates.map((candidate, rank) => {
            const percentage = totalVotes > 0
              ? Math.round((candidate.voteCount / totalVotes) * 100)
              : 0;

            return (
              <div
                key={candidate.wallet}
                className={`result-row card${rank === 0 && candidate.voteCount > 0 ? " result-leader" : ""}`}
              >
                <div className="result-rank">{rankEmoji[rank] || `#${rank + 1}`}</div>
                <div className="result-info">
                  <h3 className="result-name">{candidate.name}</h3>
                  <p className="result-wallet muted">
                    {candidate.wallet.slice(0, 10)}…{candidate.wallet.slice(-8)}
                  </p>
                </div>
                <div className="result-bar-wrap">
                  <div className="result-bar">
                    <div
                      className="result-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="result-pct">{percentage}%</span>
                </div>
                <div className="result-votes">
                  <span className="vote-big">{candidate.voteCount}</span>
                  <span className="vote-small">votes</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

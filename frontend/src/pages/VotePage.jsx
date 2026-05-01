import { useCallback, useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function VotePage() {
  const { account, contract, connectWallet, isConnected, connecting, chainError } = useWallet();

  const [candidates, setCandidates] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [isCandidateSelf, setIsCandidateSelf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [status, setStatus] = useState(null);

  const loadData = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const fetched = await contract.getAllCandidates();
      const list = fetched.map((c, i) => ({
        id: i,
        name: c.name,
        manifestoHash: c.manifestoHash,
        voteCount: Number(c.voteCount),
        wallet: c.wallet,
      }));
      setCandidates(list);

      // Check if the connected wallet is a registered candidate
      const selfCandidate = list.some(
        (c) => c.wallet.toLowerCase() === account.toLowerCase()
      );
      setIsCandidateSelf(selfCandidate);

      // Check if user has already voted
      const [voted, candidateId] = await contract.getMyVote();
      setMyVote(voted ? { voted: true, candidateId: Number(candidateId) } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    if (isConnected) {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, loadData]);

  const handleConnect = async () => {
    const err = await connectWallet();
    if (err) setStatus({ type: "error", text: err });
  };

  const handleVote = async (candidateId) => {
    if (isCandidateSelf) {
      setStatus({ type: "error", text: "Candidates cannot vote in the election." });
      return;
    }
    if (myVote?.voted) {
      setStatus({ type: "error", text: "You have already cast your vote." });
      return;
    }

    setVotingId(candidateId);
    setStatus({ type: "info", text: "Awaiting MetaMask confirmation…" });

    try {
      const tx = await contract.vote(candidateId);
      setStatus({ type: "info", text: "Transaction submitted. Waiting for confirmation…" });
      await tx.wait();
      setStatus({ type: "success", text: "🎉 Vote cast successfully!" });
      await loadData();
    } catch (err) {
      console.error(err);
      const msg = err?.reason || err?.message || "Voting failed.";
      setStatus({ type: "error", text: msg });
    } finally {
      setVotingId(null);
    }
  };

  const maxVotes = candidates.reduce((m, c) => Math.max(m, c.voteCount), 0);

  return (
    <main className="page vote-page">
      <div className="page-header">
        <h1 className="page-title">Cast Your <span className="gradient-text">Vote</span></h1>
        <p className="page-sub">
          Select a candidate to vote for. Each wallet address gets exactly one vote.
          Registered candidates cannot vote.
        </p>
      </div>

      {chainError && <div className="alert alert-error">{chainError}</div>}

      {!isConnected ? (
        <div className="connect-prompt card">
          <div className="connect-icon">🗳</div>
          <h2>Connect Your Wallet to Vote</h2>
          <p>
            Connect your MetaMask wallet to view candidates and cast your vote.
            Make sure to use a <strong>voter wallet</strong> (not a candidate wallet).
          </p>
          <button className="btn-primary" onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect MetaMask"}
          </button>
        </div>
      ) : (
        <>
          <div className="voter-info-bar card">
            <div className="voter-info-left">
              <span className="wallet-dot" />
              <span>Voting as: <code className="addr">{account}</code></span>
            </div>
            <div className="voter-badges">
              {isCandidateSelf && (
                <span className="badge badge-warning">⚠ Registered Candidate — Cannot Vote</span>
              )}
              {myVote?.voted && (
                <span className="badge badge-success">
                  ✅ Voted for {candidates[myVote.candidateId]?.name || "a candidate"}
                </span>
              )}
              {!isCandidateSelf && !myVote?.voted && (
                <span className="badge badge-info">🟢 Eligible to Vote</span>
              )}
            </div>
          </div>

          {status && (
            <div className={`alert alert-${status.type}`}>{status.text}</div>
          )}

          {isCandidateSelf && (
            <div className="alert alert-warning">
              <strong>Voting not allowed:</strong> Your wallet is registered as a candidate.
              Election integrity rules prevent candidates from voting.
              Please connect a different wallet to vote.
            </div>
          )}

          {loading && candidates.length === 0 ? (
            <div className="loading-state">Loading candidates…</div>
          ) : candidates.length === 0 ? (
            <div className="empty-state card">
              <p>No candidates have registered yet. Check back soon!</p>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((candidate) => {
                const isWinner = candidate.voteCount === maxVotes && maxVotes > 0;
                const progress = maxVotes > 0 ? (candidate.voteCount / maxVotes) * 100 : 0;
                const votedForThis = myVote?.voted && myVote.candidateId === candidate.id;
                const canVote = !isCandidateSelf && !myVote?.voted;

                return (
                  <div
                    key={candidate.wallet}
                    className={`candidate-card card${isWinner ? " card-leading" : ""}${votedForThis ? " card-voted" : ""}`}
                  >
                    {isWinner && <div className="leading-badge">🏆 Leading</div>}
                    {votedForThis && <div className="voted-badge">Your Vote</div>}

                    <h3 className="candidate-name">{candidate.name}</h3>
                    <p className="candidate-wallet muted">
                      {candidate.wallet.slice(0, 8)}…{candidate.wallet.slice(-6)}
                    </p>

                    <div className="vote-stats">
                      <span className="vote-count">{candidate.voteCount}</span>
                      <span className="vote-label">votes</span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <button
                      className={`btn-vote${votedForThis ? " btn-voted" : ""}`}
                      onClick={() => handleVote(candidate.id)}
                      disabled={!canVote || votingId !== null}
                    >
                      {votingId === candidate.id
                        ? "Processing…"
                        : votedForThis
                        ? "✅ Voted"
                        : myVote?.voted
                        ? "Voted"
                        : isCandidateSelf
                        ? "Not Eligible"
                        : "Vote"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}

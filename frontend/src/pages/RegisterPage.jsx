import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";

export default function RegisterPage() {
  const { account, contract, connectWallet, isConnected, connecting, chainError } = useWallet();

  const [candidateName, setCandidateName] = useState("");
  const [manifestoText, setManifestoText] = useState("");
  const [registrationFee, setRegistrationFee] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [status, setStatus] = useState(null); // { type: "info"|"success"|"error", text }
  const [submitting, setSubmitting] = useState(false);

  const manifestoHash = useMemo(() => {
    if (!manifestoText.trim()) return "";
    return ethers.keccak256(ethers.toUtf8Bytes(manifestoText.trim()));
  }, [manifestoText]);

  const loadFeeAndCheck = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const fee = await contract.REGISTRATION_FEE();
      setRegistrationFee(fee);

      const candidates = await contract.getAllCandidates();
      const isCandidate = candidates.some(
        (c) => c.wallet.toLowerCase() === account.toLowerCase()
      );
      setAlreadyRegistered(isCandidate);
    } catch (err) {
      console.error(err);
    }
  }, [contract, account]);

  useEffect(() => {
    loadFeeAndCheck();
  }, [loadFeeAndCheck]);

  const handleConnect = async () => {
    const err = await connectWallet();
    if (err) setStatus({ type: "error", text: err });
  };

  const handleRegister = async () => {
    if (!candidateName.trim()) {
      setStatus({ type: "error", text: "Please enter a candidate name." });
      return;
    }
    if (!manifestoText.trim()) {
      setStatus({ type: "error", text: "Please enter manifesto text." });
      return;
    }
    if (alreadyRegistered) {
      setStatus({ type: "error", text: "This wallet is already registered as a candidate." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "info", text: "Awaiting MetaMask confirmation…" });

    try {
      const feeToPay = registrationFee ?? ethers.parseEther("0.1");
      const tx = await contract.registerCandidate(candidateName.trim(), manifestoHash, {
        value: feeToPay,
      });
      setStatus({ type: "info", text: "Transaction submitted. Waiting for confirmation…" });
      await tx.wait();
      setCandidateName("");
      setManifestoText("");
      setStatus({ type: "success", text: "🎉 Candidate registered successfully!" });
      await loadFeeAndCheck();
    } catch (err) {
      console.error(err);
      const msg = err?.reason || err?.message || "Registration failed.";
      setStatus({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page register-page">
      <div className="page-header">
        <h1 className="page-title">Candidate <span className="gradient-text">Registration</span></h1>
        <p className="page-sub">
          Register yourself as a candidate to participate in the election.
          A registration fee is required and will be held by the contract.
        </p>
      </div>

      {chainError && <div className="alert alert-error">{chainError}</div>}

      {!isConnected ? (
        <div className="connect-prompt card">
          <div className="connect-icon">🔗</div>
          <h2>Connect Your Wallet</h2>
          <p>
            You need a MetaMask wallet connected to register as a candidate.
            Use a <strong>different wallet</strong> than the one you plan to vote with.
          </p>
          <button className="btn-primary" onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect MetaMask"}
          </button>
        </div>
      ) : alreadyRegistered ? (
        <div className="card already-registered">
          <div className="already-icon">✅</div>
          <h2>Already Registered</h2>
          <p>
            Wallet <code className="addr">{account}</code> is already registered as a candidate.
            Each wallet can only register once.
          </p>
          <p className="hint">To register a new candidate, connect a different wallet.</p>
        </div>
      ) : (
        <div className="card form-card">
          <div className="wallet-info-bar">
            <span className="wallet-dot" />
            <span className="wallet-label">Registering as:</span>
            <code className="addr">{account}</code>
          </div>

          <div className="form-group">
            <label htmlFor="cand-name">Candidate Name</label>
            <input
              id="cand-name"
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Jane Doe"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manifesto">Manifesto</label>
            <textarea
              id="manifesto"
              value={manifestoText}
              onChange={(e) => setManifestoText(e.target.value)}
              placeholder="Describe your vision, goals, and platform…"
              disabled={submitting}
            />
            <p className="field-hint">Your manifesto will be hashed and stored on-chain for integrity.</p>
          </div>

          {manifestoHash && (
            <div className="hash-display">
              <span className="hash-label">Manifesto Hash</span>
              <code className="hash-value">{manifestoHash}</code>
            </div>
          )}

          <div className="fee-banner">
            <span className="fee-icon">💰</span>
            <span>
              Registration fee:{" "}
              <strong>{registrationFee ? ethers.formatEther(registrationFee) : "0.1"} ETH</strong>
            </span>
          </div>

          {status && (
            <div className={`alert alert-${status.type}`}>{status.text}</div>
          )}

          <button
            className="btn-primary btn-full"
            onClick={handleRegister}
            disabled={submitting || !candidateName.trim() || !manifestoText.trim()}
          >
            {submitting ? "Processing…" : "Register as Candidate"}
          </button>
        </div>
      )}
    </main>
  );
}

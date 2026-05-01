import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <div className="hero">
        <div className="hero-badge">Blockchain-Powered Elections</div>
        <h1 className="hero-title">
          Decentralised Voting,<br />
          <span className="gradient-text">Reimagined.</span>
        </h1>
        <p className="hero-sub">
          MetaVote brings transparent, tamper-proof elections to the blockchain.
          Every vote is verifiable. Every candidate is accountable.
        </p>
        <div className="hero-actions">
          <button className="btn-primary btn-lg" onClick={() => navigate("/register")}>
            🏛 Register as Candidate
          </button>
          <button className="btn-secondary btn-lg" onClick={() => navigate("/vote")}>
            🗳 Cast Your Vote
          </button>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Trustless &amp; Secure</h3>
          <p>Smart contract logic enforces every rule — no central authority can alter results.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>Fully On-Chain</h3>
          <p>Candidate data, votes, and results are stored permanently on the blockchain.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Results</h3>
          <p>Live vote tallies update in real time. See who's leading at any moment.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡</div>
          <h3>Anti-Fraud Rules</h3>
          <p>Candidates cannot vote for themselves. Each wallet gets exactly one vote.</p>
        </div>
      </div>

      <div className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Connect Wallet</h4>
            <p>Use MetaMask to connect your wallet on the correct network.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>Register or Vote</h4>
            <p>Candidates register with a name &amp; manifesto. Voters pick their candidate.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Track Results</h4>
            <p>Watch live results update as votes come in on the Results page.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

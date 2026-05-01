import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnected, connecting } = useWallet();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/register", label: "Register" },
    { to: "/vote", label: "Vote" },
    { to: "/results", label: "Results" },
    { to: "/txlog", label: "Tx Log" },
  ];

  const shortAddress = account
    ? `${account.slice(0, 6)}…${account.slice(-4)}`
    : "";

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-icon">🗳</span>
        <span className="logo-text">Meta<span className="logo-accent">Vote</span></span>
      </Link>

      <ul className="nav-links">
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={`nav-link${location.pathname === to ? " active" : ""}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-wallet">
        {isConnected ? (
          <div className="wallet-connected">
            <span className="wallet-dot" />
            <span className="wallet-addr">{shortAddress}</span>
            <button className="btn-disconnect" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        ) : (
          <button
            className="btn-connect"
            onClick={connectWallet}
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from "./contract";

const isAddressPlaceholder = CONTRACT_ADDRESS === "PASTE_DEPLOYED_CONTRACT_ADDRESS";

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [manifestoText, setManifestoText] = useState("");
  const [registrationFee, setRegistrationFee] = useState(null);
  const [status, setStatus] = useState("");
  const [myVote, setMyVote] = useState(null);

  const manifestoHash = useMemo(() => {
    if (!manifestoText.trim()) return "";
    return ethers.keccak256(ethers.toUtf8Bytes(manifestoText.trim()));
  }, [manifestoText]);

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    }
  }, []);

  const ensureSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!provider) return;
    try {
      await ensureSepolia();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      const signer = await provider.getSigner();
      const metaVote = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(metaVote);
    } catch (error) {
      console.error(error);
      setStatus("Wallet connection failed.");
    }
  }, [provider, ensureSepolia]);

  const loadData = useCallback(async () => {
    if (!contract) return;
    try {
      const fetchedCandidates = await contract.getAllCandidates();
      setCandidates(
        fetchedCandidates.map((candidate) => ({
          name: candidate.name,
          manifestoHash: candidate.manifestoHash,
          voteCount: Number(candidate.voteCount),
          wallet: candidate.wallet,
        }))
      );

      const fee = await contract.REGISTRATION_FEE();
      setRegistrationFee(fee);

      const [voted, candidateId] = await contract.getMyVote();
      if (voted) {
        setMyVote({ voted: true, candidateId: Number(candidateId) });
      } else {
        setMyVote(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [contract]);

  useEffect(() => {
    if (!contract) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [contract, loadData]);

  const registerCandidate = async () => {
    if (!contract) return;
    if (!candidateName.trim() || !manifestoHash) {
      setStatus("Enter a candidate name and manifesto text.");
      return;
    }
    try {
      setStatus("Submitting candidate registration...");
      const feeToPay = registrationFee ?? ethers.parseEther("0.1");
      const tx = await contract.registerCandidate(candidateName.trim(), manifestoHash, {
        value: feeToPay,
      });
      await tx.wait();
      setCandidateName("");
      setManifestoText("");
      setStatus("Candidate registered!");
      await loadData();
    } catch (error) {
      console.error(error);
      setStatus("Registration failed.");
    }
  };

  const voteForCandidate = async (index) => {
    if (!contract) return;
    try {
      setStatus("Submitting vote...");
      const tx = await contract.vote(index);
      await tx.wait();
      setStatus("Vote submitted!");
      await loadData();
    } catch (error) {
      console.error(error);
      setStatus("Voting failed.");
    }
  };

  const leadingCandidate = useMemo(() => {
    if (!candidates.length) return null;
    return candidates.reduce((leader, candidate, index) => {
      if (!leader || candidate.voteCount > leader.voteCount) {
        return { ...candidate, index };
      }
      return leader;
    }, null);
  }, [candidates]);

  return (
    <div className="app">
      <header>
        <h1>MetaVote</h1>
        <p>MetaMask-only blockchain voting on Sepolia.</p>
        {!account ? (
          <button onClick={connectWallet} className="primary">
            Connect MetaMask
          </button>
        ) : (
          <div className="account">Connected: {account}</div>
        )}
        {isAddressPlaceholder && (
          <div className="warning">
            Update <code>frontend/src/contract.js</code> with your deployed contract address.
          </div>
        )}
      </header>

      <section className="card">
        <h2>Candidate Registration</h2>
        <label>
          Candidate name
          <input
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            placeholder="Jane Doe"
          />
        </label>
        <label>
          Manifesto text (hashed on the client)
          <textarea
            value={manifestoText}
            onChange={(event) => setManifestoText(event.target.value)}
            placeholder="Your manifesto text..."
          />
        </label>
        <div className="hash-row">
          <span>Manifesto hash:</span>
          <code>{manifestoHash || "Enter manifesto text to generate hash"}</code>
        </div>
        <button onClick={registerCandidate} className="primary">
          Register (Fee: {registrationFee ? ethers.formatEther(registrationFee) : "0.1"} ETH)
        </button>
      </section>

      <section className="card">
        <h2>Candidates</h2>
        {candidates.length === 0 && <p>No candidates yet.</p>}
        <div className="grid">
          {candidates.map((candidate, index) => (
            <div key={candidate.wallet} className="candidate">
              <h3>{candidate.name}</h3>
              <p className="muted">Wallet: {candidate.wallet}</p>
              <p className="muted">Manifesto hash:</p>
              <code>{candidate.manifestoHash}</code>
              <div className="votes">Votes: {candidate.voteCount}</div>
              <button
                onClick={() => voteForCandidate(index)}
                className="secondary"
                disabled={!!myVote}
              >
                Vote
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>My Vote</h2>
        {myVote ? (
          <p>
            You voted for <strong>{candidates[myVote.candidateId]?.name || ""}</strong>.
          </p>
        ) : (
          <p>You have not voted yet.</p>
        )}
      </section>

      <section className="card">
        <h2>Live Results</h2>
        {leadingCandidate ? (
          <p>
            Leading: <strong>{leadingCandidate.name}</strong> with {leadingCandidate.voteCount} votes.
          </p>
        ) : (
          <p>No votes yet.</p>
        )}
      </section>

      {status && <div className="status">{status}</div>}
    </div>
  );
}

export default App;

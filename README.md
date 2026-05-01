# MetaVote 🗳

**A blockchain-powered voting platform where every vote is transparent, tamper-proof, and permanent.**

---

## What is MetaVote?

MetaVote is a digital election system built on blockchain technology. Think of it like a voting booth — but instead of paper ballots locked in a box, every vote and candidate manifesto is recorded on a public ledger that no one can change or delete.

Here's what makes it special:

- 🔒 **Tamper-proof** — Once a vote is cast or a manifesto is submitted, it cannot be altered by anyone, including the app developers.
- 🌐 **Transparent** — Anyone can verify results in real time.
- 📜 **Manifesto as a Public Contract** — When a candidate registers, their manifesto is permanently written to the blockchain — a binding digital statement between the candidate and every voter.
- 🛡 **Fair by design** — Candidates cannot vote for themselves. Each wallet address gets exactly one vote.

---

## Blockchain Principles at Work

MetaVote demonstrates the three core pillars of blockchain technology:

### 🔗 Immutability
Once data is written to the blockchain, it cannot be changed or deleted. Every candidate registration and every vote is a permanent entry in the chain — no admin, developer, or government can alter it.

### 👁 Transparency
All transactions (registrations, votes) are publicly visible on the blockchain. Anyone can independently verify the results without trusting a central authority.

### 🤝 Consensus
Transactions are validated by the network before being accepted. A vote or registration is only considered final once it has been confirmed in a block by the network's consensus mechanism.

---

## ⚠️ About Hardhat (Local Development Chain)

> **Important:** This project uses **Hardhat**, which is a **local, private development blockchain** running only on your computer. It is **not decentralized** — it runs as a single node on `localhost:8545` and has no connection to the public Ethereum network.

Hardhat is used for development and demos because:
- It starts instantly with 20 pre-funded test accounts (10,000 ETH each — fake/test ETH, not real).
- It resets on every restart, making it easy to test from a clean state.
- It does not require real ETH or Internet access.

For a real decentralized deployment, the contract would be deployed to a public network such as Ethereum Mainnet or the Sepolia testnet, where many independent nodes validate every transaction.

---

## How the Election Works (Step by Step)

### For Candidates 🏛
1. Open the app and go to the **Register** page.
2. Connect your MetaMask wallet (this will be your candidate identity).
3. Enter your **name** and write your **manifesto** — your promises and vision.
4. Pay the **500 ETH registration fee** (this is deducted automatically when you confirm the transaction).
5. Your name and manifesto are now permanently on the blockchain. Every voter can read them.

> ⚠️ **Important:** The wallet you register with **cannot vote**. Use a separate wallet to vote.

### For Voters 🗳
1. Open the app and go to the **Vote** page.
2. Connect your MetaMask wallet (must be different from any candidate's wallet).
3. You will see all registered candidates listed.
4. Click on a candidate's **name** to expand and read their full manifesto.
5. Click **Vote** next to your chosen candidate and confirm the transaction.
6. You can only vote once — your choice is final and permanent.

### Viewing Results 📊
- Go to the **Results** page at any time.
- Results update every 10 seconds.
- You can see how many votes each candidate has received.
- No wallet connection required to view results.

### Transaction Log 📋
- Go to the **Tx Log** page to see a local record of all transactions performed in your browser.
- Shows wallet addresses, ETH balance before/after, and transaction hashes.
- Useful for demos and auditing.

---

## How to Run It Locally

### What You Need
- [Node.js](https://nodejs.org/) (version 18 or newer)
- [MetaMask](https://metamask.io/) browser extension
- A terminal / command prompt

---

### Step 1 — Start the Local Blockchain

Open a terminal and run:

```bash
cd contracts
npm install
npx hardhat node
```

This starts a local blockchain on your computer at `http://127.0.0.1:8545`.
It will print **20 test accounts**, each loaded with **10,000 ETH** (fake, for testing).

**Copy the private keys** of the accounts you want to use — you will import them into MetaMask.

---

### Step 2 — Deploy the Smart Contract

Open a **second terminal** and run:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

You should see a message like:
```
MetaVote deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

The address shown (`0x5FbDB2...`) is already pre-configured in the frontend, so you don't need to change anything.

---

### Step 3 — Start the Frontend

Open a **third terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

Then open your browser and go to: **http://localhost:5173**

---

### Step 4 — Set Up MetaMask

1. Open MetaMask and add a custom network:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** ETH

2. Import test accounts using their private keys (printed by `npx hardhat node` in Step 1).

> 💡 **Tip:** Import at least **2 accounts** — one to act as a candidate, one to vote.

---

### Step 5 — Run the Election

1. **Register a candidate:** Switch MetaMask to Account 1, go to `/register`, fill in name + manifesto, and confirm the 500 ETH transaction.
2. **Vote:** Switch MetaMask to Account 2, go to `/vote`, click the candidate's name to read the manifesto, then click Vote.
3. **View results:** Go to `/results` — no wallet needed.
4. **View transaction log:** Go to `/txlog` to see balance changes and transaction hashes.

---

## Project Structure

```
MetaVote/
├── contracts/          Smart contract (Solidity) + Hardhat config
│   ├── contracts/MetaVote.sol    The election smart contract
│   └── scripts/deploy.js        Deployment script
└── frontend/           React web application
    └── src/
        ├── pages/      Register, Vote, Results, TxLog pages
        ├── context/    Wallet connection (MetaMask)
        └── utils/      Transaction logger
```

---

## Key Rules (Enforced by the Smart Contract)

| Rule | How it's enforced |
|------|-------------------|
| Registration costs 500 ETH | Contract rejects any transaction that doesn't include exactly 500 ETH |
| Each wallet registers once | Contract checks if the wallet is already a candidate |
| Candidates cannot vote | The voting page blocks candidate wallets; the contract also enforces this at the smart-contract level |
| Each wallet votes once | Contract tracks which wallets have voted |
| Manifesto is immutable | Once stored on-chain, it cannot be modified |

---

## Gas Fees

Gas fees depend on the network configuration. On the local Hardhat development chain, gas prices are minimal (essentially zero). On public networks (e.g., Sepolia, Mainnet), gas fees are determined by current network demand. The registration fee of 500 ETH is intentionally large so the balance change is clearly visible during local demos.

---

## Technology

- **Solidity** — Smart contract language (the "rules engine" of the election)
- **Hardhat** — Local blockchain for development and testing (private, single-node — not decentralized)
- **React + Vite** — Fast, modern web frontend
- **Ethers.js** — Library that connects the frontend to the blockchain
- **MetaMask** — Browser wallet used to sign and submit transactions

---

## Notes

- This project uses a **local Hardhat blockchain** for testing. The ETH used is not real.
- For a real deployment, point the contract to a public testnet (e.g., Sepolia) and update `CONTRACT_ADDRESS` in `frontend/src/contract.js`.
- The registration fee is set to **500 ETH** so the balance change is clearly visible during demos.

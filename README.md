# MetaVote

MetaMask-only blockchain voting platform on EVM with candidate registration fees, manifesto hashing, one-vote-per-wallet, and live results.

## Features
- Candidate registration with fixed on-chain fee (0.1 ETH)
- Manifesto hash stored on-chain for immutability
- One vote per wallet
- Live results + “my vote” lookup
- Sepolia testnet (free faucet ETH)

## Tech Stack
- Smart contracts: Solidity + Hardhat
- Frontend: React + Vite + Ethers.js
- Wallet: MetaMask only

## Quickstart

### 1) Deploy the smart contract (Sepolia)
```bash
cd contracts
npm install
cp .env.example .env
# Fill SEPOLIA_RPC_URL and PRIVATE_KEY in .env
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```
Copy the deployed contract address from the console.

### 2) Configure the frontend
Update `frontend/src/contract.js`:
- `CONTRACT_ADDRESS` = your deployed address

### 3) Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Open the app, connect MetaMask to Sepolia, and start registering candidates / voting.

## Notes
- Registration fee is enforced on-chain (`0.1 ETH`).
- Use a Sepolia faucet to fund accounts for testing.

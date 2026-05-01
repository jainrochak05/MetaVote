export const SEPOLIA_CHAIN_ID = "0xaa36a7";

export const CONTRACT_ADDRESS = "PASTE_DEPLOYED_CONTRACT_ADDRESS";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "REGISTRATION_FEE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "manifestoHash", "type": "string" }
    ],
    "name": "registerCandidate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "candidateId", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCandidates",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "manifestoHash", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" },
          { "internalType": "address", "name": "wallet", "type": "address" }
        ],
        "internalType": "struct MetaVote.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyVote",
    "outputs": [
      { "internalType": "bool", "name": "voted", "type": "bool" },
      { "internalType": "uint256", "name": "candidateId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getResults",
    "outputs": [
      { "internalType": "string[]", "name": "names", "type": "string[]" },
      { "internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]" },
      { "internalType": "address[]", "name": "wallets", "type": "address[]" },
      { "internalType": "string[]", "name": "manifestoHashes", "type": "string[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

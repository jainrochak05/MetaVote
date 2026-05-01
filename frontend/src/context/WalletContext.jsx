import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from "../contract";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [chainError, setChainError] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setAccount("");
          setContract(null);
        } else {
          setAccount(accounts[0]);
          p.getSigner().then((signer) => {
            setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
          });
        }
      });

      // Listen for chain changes — update provider and clear contract state gracefully
      window.ethereum.on("chainChanged", (newChainId) => {
        const p2 = new ethers.BrowserProvider(window.ethereum);
        setProvider(p2);
        setContract(null);
        setAccount("");
        if (newChainId.toLowerCase() !== SEPOLIA_CHAIN_ID.toLowerCase()) {
          setChainError(`Wrong network detected. Please switch to Chain ID ${parseInt(SEPOLIA_CHAIN_ID, 16)}.`);
        } else {
          setChainError("");
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const ensureChain = useCallback(async () => {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID.toLowerCase()) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch {
        setChainError(`Wrong network. Please switch to the correct network (Chain ID ${parseInt(SEPOLIA_CHAIN_ID, 16)}) in MetaMask.`);
        throw new Error("Wrong chain");
      }
    }
    setChainError("");
  }, []);

  const connectWallet = useCallback(async () => {
    if (!provider) {
      return "MetaMask is not installed. Please install it to use MetaVote.";
    }
    setConnecting(true);
    try {
      await ensureChain();
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      setAccount(addr);
      const signer = await provider.getSigner();
      setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
      return null; // no error
    } catch (err) {
      console.error(err);
      return err.message || "Wallet connection failed.";
    } finally {
      setConnecting(false);
    }
  }, [provider, ensureChain]);

  const disconnectWallet = useCallback(() => {
    setAccount("");
    setContract(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        contract,
        provider,
        chainError,
        connecting,
        connectWallet,
        disconnectWallet,
        isConnected: !!account,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

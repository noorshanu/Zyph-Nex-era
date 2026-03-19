import { useState } from "react";
import { useSendTransaction, useSwitchChain, useChainId } from "wagmi";
import { parseEther } from "viem";
import { base } from "wagmi/chains";

/**
 * Fetch the current ETH price in USD from CoinGecko.
 * Falls back to a sensible default if the fetch fails.
 */
const fetchEthPrice = async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    );
    const data = await res.json();
    return data.ethereum.usd;
  } catch {
    console.warn("Could not fetch ETH price, using fallback of $2000");
    return 2000; // safe fallback
  }
};

/**
 * useMatchPayment
 *
 * Handles the on-chain ETH payment for paid matches.
 * - Fetches live ETH/USD price and converts the USD entry_fee to ETH
 * - Checks wallet is on the right chain (switches automatically)
 * - Sends the correct ETH amount to VITE_TREASURY_ADDRESS
 * - Returns { pay, isPaying, txHash, error }
 */
export const useMatchPayment = (match) => {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState("");

  const targetChainId = base.id;
  const targetChain = base;

  const pay = async () => {
    setError("");
    setTxHash(null);
    setIsPaying(true);

    try {
      const treasury = import.meta.env.VITE_TREASURY_ADDRESS;
      if (!treasury) {
        throw new Error(
          "Treasury address not configured. Add VITE_TREASURY_ADDRESS to .env",
        );
      }

      // Switch chain if needed
      if (chainId !== targetChainId) {
        await switchChainAsync({ chainId: targetChainId });
      }

      // Convert USD entry_fee → ETH using live price
      const entryFeeUsd = Number(match.entry_fee || 0);
      const ethPrice = await fetchEthPrice();
      const entryFeeEth = (entryFeeUsd / ethPrice).toFixed(18);
      const value = parseEther(entryFeeEth);

      // Send the transaction
      const hash = await sendTransactionAsync({
        to: treasury,
        value,
        chainId: targetChainId,
      });

      setTxHash(hash);
      return hash;
    } catch (err) {
      const msg = err?.shortMessage || err?.message || "Transaction failed";
      setError(msg);
      throw err;
    } finally {
      setIsPaying(false);
    }
  };

  return { pay, isPaying, txHash, error, targetChain };
};

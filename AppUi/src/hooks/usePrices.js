import { useState, useEffect } from "react";
import { matchesApi } from "../services/api";

// Fallback when API fails (no real data, just so UI doesn't break)
const FALLBACK_TOKENS = [
  { symbol: "BTC", name: "Bitcoin", price: 0, change: 0 },
  { symbol: "ETH", name: "Ethereum", price: 0, change: 0 },
  { symbol: "SOL", name: "Solana", price: 0, change: 0 },
  { symbol: "BNB", name: "BNB", price: 0, change: 0 },
  { symbol: "XRP", name: "XRP", price: 0, change: 0 },
  { symbol: "ADA", name: "Cardano", price: 0, change: 0 },
  { symbol: "DOT", name: "Polkadot", price: 0, change: 0 },
  { symbol: "LINK", name: "Chainlink", price: 0, change: 0 },
  { symbol: "AVAX", name: "Avalanche", price: 0, change: 0 },
  { symbol: "MATIC", name: "Polygon", price: 0, change: 0 },
  { symbol: "UNI", name: "Uniswap", price: 0, change: 0 },
  { symbol: "LTC", name: "Litecoin", price: 0, change: 0 },
  { symbol: "ATOM", name: "Cosmos", price: 0, change: 0 },
  { symbol: "DOGE", name: "Dogecoin", price: 0, change: 0 },
];

/**
 * Fetches real coin prices and 24h change from backend (CoinGecko).
 * Returns { tokens, loading, error, isRealData }.
 * tokens: [{ symbol, name, icon?, price, change }]
 */
export function usePrices() {
  const [tokens, setTokens] = useState(FALLBACK_TOKENS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      setLoading(true);
      setError(null);
      try {
        const res = await matchesApi.getPrices();
        if (cancelled) return;
        const data = res.data || [];
        setTokens(
          data.map((a) => ({
            symbol: a.symbol,
            name: a.name,
            icon: a.icon,
            price: a.price ?? 0,
            change: a.change24h ?? 0,
          }))
        );
        setIsRealData(true);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load prices");
        setTokens(FALLBACK_TOKENS);
        setIsRealData(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrices();
    return () => { cancelled = true; };
  }, []);

  return { tokens, loading, error, isRealData };
}

export default usePrices;

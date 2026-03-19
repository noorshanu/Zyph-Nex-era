// Simple pricing service using CoinGecko free API (rate-limited on free tier)
const COINGECKO_API = "https://api.coingecko.com/api/v3";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Map our symbols to CoinGecko IDs
const SYMBOL_TO_ID = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  APT: "aptos",
  NEAR: "near",
  FTM: "fantom",
  ICP: "internet-computer",
  FIL: "filecoin",
  ALGO: "algorand",
  SAND: "the-sandbox",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get current prices for multiple assets (with retries for rate limits/transient errors)
 * @param {string[]} symbols - Array of asset symbols
 * @returns {Object} - Object with symbol as key and price as value
 */
export const getPrices = async (symbols) => {
  const ids = symbols.map((s) => SYMBOL_TO_ID[s]).filter(Boolean);
  if (ids.length === 0) return {};
  const idsString = ids.join(",");
  const url = `${COINGECKO_API}/simple/price?ids=${idsString}&vs_currencies=usd`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const prices = {};
        for (const symbol of symbols) {
          const id = SYMBOL_TO_ID[symbol];
          if (id && data[id]) {
            prices[symbol] = data[id].usd;
          }
        }
        return prices;
      }

      const body = await response.text();
      const isRetryable =
        response.status === 429 ||
        (response.status >= 500 && response.status < 600);
      const errMsg = `CoinGecko ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 200)}` : ""}`;

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(
          `Pricing service attempt ${attempt}/${MAX_RETRIES} failed (${errMsg}). Retrying in ${RETRY_DELAY_MS}ms...`,
        );
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      throw new Error(errMsg);
    } catch (error) {
      lastError = error;
      const isNetworkError =
        error.name === "TypeError" && error.message.includes("fetch");
      if (
        (isNetworkError || (error.message && error.message.includes("429"))) &&
        attempt < MAX_RETRIES
      ) {
        console.warn(
          `Pricing service attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}. Retrying in ${RETRY_DELAY_MS}ms...`,
        );
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      console.error("Pricing service error:", error);
      throw error;
    }
  }

  throw lastError || new Error("Failed to fetch prices");
};

/**
 * Get current prices and 24h change % for multiple assets (for frontend display)
 * @param {string[]} symbols - Array of asset symbols
 * @returns {Object} - { [symbol]: { price, change24h } }
 */
export const getPricesWithChange = async (symbols) => {
  const ids = symbols.map((s) => SYMBOL_TO_ID[s]).filter(Boolean);
  if (ids.length === 0) return {};
  const idsString = ids.join(",");
  const url = `${COINGECKO_API}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const result = {};
        for (const symbol of symbols) {
          const id = SYMBOL_TO_ID[symbol];
          if (id && data[id]) {
            const usd = data[id].usd;
            const change = data[id].usd_24h_change;
            result[symbol] = {
              price: usd,
              change24h: change != null ? change : 0,
            };
          }
        }
        return result;
      }
      const body = await response.text();
      const isRetryable =
        response.status === 429 ||
        (response.status >= 500 && response.status < 600);
      const errMsg = `CoinGecko ${response.status} ${response.statusText}`;
      if (isRetryable && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw new Error(errMsg);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      console.error("Pricing service getPricesWithChange error:", error);
      throw error;
    }
  }
  throw lastError || new Error("Failed to fetch prices");
};

/**
 * Get single asset price
 * @param {string} symbol - Asset symbol
 * @returns {number} - Current price in USD
 */
export const getPrice = async (symbol) => {
  const prices = await getPrices([symbol]);
  return prices[symbol] || null;
};

/**
 * Calculate PnL percentage
 * @param {number} startPrice - Starting price
 * @param {number} currentPrice - Current price
 * @returns {number} - PnL percentage
 */
export const calculatePnLPercentage = (startPrice, currentPrice) => {
  if (startPrice === 0) return 0;
  return ((currentPrice - startPrice) / startPrice) * 100;
};

export default {
  getPrices,
  getPricesWithChange,
  getPrice,
  calculatePnLPercentage,
};

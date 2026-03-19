// Supported crypto assets for matches
export const SUPPORTED_ASSETS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "BNB", name: "BNB", icon: "BNB" },
  { symbol: "XRP", name: "XRP", icon: "XRP" },
  { symbol: "ADA", name: "Cardano", icon: "₳" },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { symbol: "AVAX", name: "Avalanche", icon: "AVAX" },
  { symbol: "DOT", name: "Polkadot", icon: "●" },
  { symbol: "MATIC", name: "Polygon", icon: "MATIC" },
  { symbol: "LINK", name: "Chainlink", icon: "LINK" },
  { symbol: "UNI", name: "Uniswap", icon: "UNI" },
  { symbol: "ATOM", name: "Cosmos", icon: "ATOM" },
  { symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { symbol: "NEAR", name: "NEAR Protocol", icon: "NEAR" },
  { symbol: "FTM", name: "Fantom", icon: "FTM" },
  { symbol: "ICP", name: "Internet Computer", icon: "ICP" },
  { symbol: "FIL", name: "Filecoin", icon: "FIL" },
  { symbol: "ALGO", name: "Algorand", icon: "ALGO" },
  { symbol: "SAND", name: "The Sandbox", icon: "SAND" },
];

// Match statuses
export const MATCH_STATUS = {
  UPCOMING: "upcoming",
  OPEN: "open", // join window active — users can join
  LOCKED: "locked", // join window closed, about to go live
  LIVE: "live", // match trading in progress — no new joins
  COMPLETED: "completed",
  SETTLED: "settled",
};

// Match types
export const MATCH_TYPE = {
  PRACTICE: "practice",
  PAID: "paid",
};

// Portfolio constraints — select 5–10 tokens, allocate 1000 total virtual balance
export const PORTFOLIO_CONSTRAINTS = {
  MAX_ASSETS: 10,
  MIN_ASSETS: 5,
  TOTAL_CAPITAL: 1000,
  MIN_ALLOCATION: 50, // min 50 per token (5% of 1000)
  MAX_ALLOCATION: 500, // max 500 per token (50% of 1000)
};

// Reward distribution (percentage of distributable pool by rank)
export const REWARD_DISTRIBUTION = {
  1: 30, // 1st place: 30%
  2: 20, // 2nd place: 20%
  3: 15, // 3rd place: 15%
  4: 10, // 4th place: 10%
  5: 8, // 5th place: 8%
  6: 5, // 6th place: 5%
  7: 4, // 7th place: 4%
  8: 3, // 8th place: 3%
  9: 3, // 9th place: 3%
  10: 2, // 10th place: 2%
};

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 10;

// Skill rating adjustments
export const SKILL_RATING = {
  WIN_BONUS: 25,
  LOSS_PENALTY: 15,
  TOP_3_BONUS: 10,
};

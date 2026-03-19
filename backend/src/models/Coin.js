import mongoose from "mongoose";

const coinSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    coingecko_id: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

coinSchema.index({ is_active: 1 });

const Coin = mongoose.model("Coin", coinSchema);

// Seed default coins from SUPPORTED_ASSETS if collection is empty
export const seedCoins = async () => {
  const COIN_GECKO_IDS = {
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
    NEAR: "near",
    FTM: "fantom",
    ICP: "internet-computer",
    FIL: "filecoin",
    ALGO: "algorand",
    SAND: "the-sandbox",
    APT: "aptos",
  };

  const DEFAULT_COINS = [
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

  const count = await Coin.countDocuments();
  if (count === 0) {
    const toInsert = DEFAULT_COINS.map((c) => ({
      ...c,
      coingecko_id: COIN_GECKO_IDS[c.symbol] || c.symbol.toLowerCase(),
      is_active: true,
    }));
    await Coin.insertMany(toInsert);
    console.log(`✅ Seeded ${toInsert.length} default coins`);
  }
};

export default Coin;

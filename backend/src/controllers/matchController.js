import Match from "../models/Match.js";
import Portfolio from "../models/Portfolio.js";
import User from "../models/User.js";
import Leaderboard from "../models/Leaderboard.js";
import {
  startMatch,
  updateRankings,
  endMatch,
} from "../services/matchEngine.js";
import { getPricesWithChange } from "../services/pricingService.js";
import {
  MATCH_STATUS,
  PORTFOLIO_CONSTRAINTS,
  SUPPORTED_ASSETS,
} from "../utils/constants.js";

/**
 * Get all available matches
 */
export const getMatches = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const matches = await Match.find(filter)
      .sort({ start_time: 1 })
      .select("-participants");

    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single match details
 */
export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    res.json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Join a match
 */
export const joinMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const match = await Match.findById(id);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    if (
      match.status !== MATCH_STATUS.OPEN &&
      match.status !== MATCH_STATUS.UPCOMING
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Match is not open for joining" });
    }

    if (match.participants.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Already joined this match" });
    }

    if (match.current_participants >= match.max_participants) {
      return res.status(400).json({ success: false, message: "Match is full" });
    }

    // Check balance for paid matches
    if (match.type === "paid") {
      const user = await User.findById(userId);
      if (user.balance < match.entry_fee) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient balance" });
      }

      // Deduct entry fee
      user.balance -= match.entry_fee;
      await user.save();
    }

    // Add to match
    match.participants.push(userId);
    match.current_participants += 1;
    await match.save();

    // Create empty portfolio
    const portfolio = new Portfolio({
      user_id: userId,
      match_id: id,
      assets: [],
      allocations: [],
    });
    await portfolio.save();

    res.json({
      success: true,
      message: "Successfully joined match",
      data: { match_id: id, portfolio_id: portfolio._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit portfolio for a match
 */
export const submitPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { assets, allocations } = req.body;
    const userId = req.user._id;

    const portfolio = await Portfolio.findOne({
      match_id: id,
      user_id: userId,
    });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found. Join match first.",
      });
    }

    if (portfolio.is_locked) {
      return res
        .status(400)
        .json({ success: false, message: "Portfolio is locked" });
    }

    // Validate assets
    if (
      !assets ||
      assets.length < PORTFOLIO_CONSTRAINTS.MIN_ASSETS ||
      assets.length > PORTFOLIO_CONSTRAINTS.MAX_ASSETS
    ) {
      return res.status(400).json({
        success: false,
        message: `Select between ${PORTFOLIO_CONSTRAINTS.MIN_ASSETS} and ${PORTFOLIO_CONSTRAINTS.MAX_ASSETS} assets`,
      });
    }

    // Validate allocations
    if (!allocations || allocations.length !== assets.length) {
      return res.status(400).json({
        success: false,
        message: "Allocations must match selected assets",
      });
    }

    const totalAllocation = allocations.reduce((sum, a) => sum + a.amount, 0);
    if (totalAllocation !== PORTFOLIO_CONSTRAINTS.TOTAL_CAPITAL) {
      return res.status(400).json({
        success: false,
        message: `Total allocation must equal ${PORTFOLIO_CONSTRAINTS.TOTAL_CAPITAL}`,
      });
    }

    // Validate min/max per asset
    for (const allocation of allocations) {
      if (allocation.amount < PORTFOLIO_CONSTRAINTS.MIN_ALLOCATION) {
        return res.status(400).json({
          success: false,
          message: `Minimum allocation per asset is ${PORTFOLIO_CONSTRAINTS.MIN_ALLOCATION}`,
        });
      }
      if (allocation.amount > PORTFOLIO_CONSTRAINTS.MAX_ALLOCATION) {
        return res.status(400).json({
          success: false,
          message: `Maximum allocation per asset is ${PORTFOLIO_CONSTRAINTS.MAX_ALLOCATION}`,
        });
      }
    }

    // Update portfolio
    portfolio.assets = assets;
    portfolio.allocations = allocations.map((a) => ({
      ...a,
      percentage: (a.amount / PORTFOLIO_CONSTRAINTS.TOTAL_CAPITAL) * 100,
    }));
    await portfolio.save();

    res.json({
      success: true,
      message: "Portfolio submitted",
      data: portfolio,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lock portfolio for a match (user confirms allocation)
 */
export const lockPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const portfolio = await Portfolio.findOne({
      match_id: id,
      user_id: userId,
    });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found. Join match first.",
      });
    }

    if (portfolio.is_locked) {
      return res
        .status(400)
        .json({ success: false, message: "Portfolio is already locked" });
    }

    if (!portfolio.assets || portfolio.assets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Submit portfolio before locking",
      });
    }

    portfolio.is_locked = true;
    portfolio.locked_at = new Date();
    await portfolio.save();

    res.json({
      success: true,
      message: "Portfolio locked successfully",
      data: portfolio,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get match leaderboard
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const leaderboard = await Leaderboard.findOne({ match_id: id });
    if (!leaderboard) {
      // Return empty array when match hasn't started
      return res.json({ success: true, data: [] });
    }

    // Always return rankings as a flat array so clients can .map() safely
    res.json({ success: true, data: leaderboard.rankings || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user's portfolio for a match
 */
export const getUserPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const portfolio = await Portfolio.findOne({
      match_id: id,
      user_id: userId,
    });
    if (!portfolio) {
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });
    }

    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current prices and 24h change for supported assets (real data from CoinGecko)
 */
export const getPrices = async (req, res) => {
  try {
    const symbols = SUPPORTED_ASSETS.map((a) => a.symbol);
    const pricesWithChange = await getPricesWithChange(symbols);
    const data = symbols
      .filter((s) => pricesWithChange[s])
      .map((s) => {
        const meta = SUPPORTED_ASSETS.find((a) => a.symbol === s) || {
          symbol: s,
          name: s,
          icon: s.charAt(0),
        };
        return {
          symbol: s,
          name: meta.name,
          icon: meta.icon,
          price: pricesWithChange[s].price,
          change24h: pricesWithChange[s].change24h ?? 0,
        };
      });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get available assets (from DB, admin-controlled)
 */
export const getAssets = async (req, res) => {
  try {
    const Coin = (await import("../models/Coin.js")).default;
    const coins = await Coin.find({ is_active: true }).sort({ symbol: 1 });
    if (coins.length > 0) {
      return res.json({
        success: true,
        data: coins.map((c) => ({
          symbol: c.symbol,
          name: c.name,
          icon: c.icon,
          coingecko_id: c.coingecko_id,
        })),
      });
    }
    // Fallback to constants if DB has no coins yet
    res.json({ success: true, data: SUPPORTED_ASSETS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getMatches,
  getMatch,
  getPrices,
  joinMatch,
  submitPortfolio,
  lockPortfolio,
  getLeaderboard,
  getUserPortfolio,
  getAssets,
};

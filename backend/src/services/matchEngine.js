import Match from "../models/Match.js";
import Portfolio from "../models/Portfolio.js";
import AssetSnapshot from "../models/AssetSnapshot.js";
import Leaderboard from "../models/Leaderboard.js";
import { getPrices, calculatePnLPercentage } from "./pricingService.js";
import { MATCH_STATUS, SUPPORTED_ASSETS } from "../utils/constants.js";

/**
 * Create a new match
 */
export const createMatch = async (matchData) => {
  const match = new Match({
    ...matchData,
    allowed_assets:
      matchData.allowed_assets || SUPPORTED_ASSETS.map((a) => a.symbol),
  });
  await match.save();
  return match;
};

/**
 * Start a match - snapshot opening prices and lock portfolios
 */
export const startMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");

  // Update match status
  match.status = MATCH_STATUS.LIVE;
  match.lock_time = new Date();
  await match.save();

  // Snapshot opening prices
  const prices = await getPrices(match.allowed_assets);
  const snapshots = [];

  for (const asset of match.allowed_assets) {
    if (prices[asset]) {
      snapshots.push({
        match_id: matchId,
        asset,
        start_price: prices[asset],
        current_price: prices[asset],
      });
    }
  }

  await AssetSnapshot.insertMany(snapshots);

  // Lock all portfolios
  await Portfolio.updateMany(
    { match_id: matchId },
    { is_locked: true, locked_at: new Date() },
  );

  return match;
};

/**
 * Update match rankings during live match
 * @param {string} matchId
 * @param {Object} [pricesOverride] - If provided, use these prices instead of fetching (reduces API calls when ending match)
 */
export const updateRankings = async (matchId, pricesOverride = null) => {
  const match = await Match.findById(matchId);
  if (!match || match.status !== MATCH_STATUS.LIVE) return;

  const prices =
    pricesOverride ?? (await getPrices(match.allowed_assets));

  // Get all asset snapshots for this match
  const snapshots = await AssetSnapshot.find({ match_id: matchId });
  const snapshotMap = {};
  snapshots.forEach((s) => {
    snapshotMap[s.asset] = s;
  });

  // Get all portfolios for this match
  const portfolios = await Portfolio.find({ match_id: matchId }).populate(
    "user_id",
    "firstName lastName wallet_address",
  );

  // Calculate PnL for each portfolio
  for (const portfolio of portfolios) {
    let totalPnL = 0;

    for (const allocation of portfolio.allocations) {
      const snapshot = snapshotMap[allocation.asset];
      const currentPrice = prices[allocation.asset];

      if (snapshot && currentPrice) {
        const assetPnLPercent = calculatePnLPercentage(
          snapshot.start_price,
          currentPrice,
        );
        const allocationValue = allocation.amount * (1 + assetPnLPercent / 100);
        totalPnL += allocationValue - allocation.amount;
      }
    }

    portfolio.current_value = portfolio.start_value + totalPnL;
    portfolio.pnl = totalPnL;
    portfolio.pnl_percentage = (totalPnL / portfolio.start_value) * 100;
    await portfolio.save();
  }

  // Sort and assign ranks
  const sortedPortfolios = portfolios.sort(
    (a, b) => b.pnl_percentage - a.pnl_percentage,
  );
  for (let i = 0; i < sortedPortfolios.length; i++) {
    sortedPortfolios[i].rank = i + 1;
    await sortedPortfolios[i].save();
  }

  // Update leaderboard
  await updateLeaderboard(matchId, sortedPortfolios);

  return sortedPortfolios;
};

/**
 * Update leaderboard for a match
 */
const updateLeaderboard = async (matchId, rankedPortfolios) => {
  const top10 = rankedPortfolios.slice(0, 10);
  const rankings = top10.map((p) => ({
    user_id: p.user_id._id || p.user_id,
    username: p.user_id.firstName
      ? `${p.user_id.firstName} ${p.user_id.lastName}`
      : "User",
    wallet_address: p.user_id.wallet_address || "",
    pnl: p.pnl,
    pnl_percentage: p.pnl_percentage,
    rank: p.rank,
    reward: 0, // populated later by rewardEngine on match settlement
  }));

  await Leaderboard.findOneAndUpdate(
    { match_id: matchId },
    { rankings, is_final: false },
    { upsert: true, new: true },
  );
};

/**
 * End a match - finalize rankings
 */
export const endMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");

  // Fetch prices once and reuse for final rankings + closing snapshot (avoids double CoinGecko call)
  const prices = await getPrices(match.allowed_assets);
  await updateRankings(matchId, prices);

  // Snapshot closing prices (reuse same prices)
  for (const asset of match.allowed_assets) {
    if (prices[asset]) {
      await AssetSnapshot.findOneAndUpdate(
        { match_id: matchId, asset },
        { end_price: prices[asset], price_change_percentage: 0 },
      );
    }
  }

  // Update snapshots with price change
  const snapshots = await AssetSnapshot.find({ match_id: matchId });
  for (const snapshot of snapshots) {
    if (snapshot.end_price && snapshot.start_price) {
      snapshot.price_change_percentage = calculatePnLPercentage(
        snapshot.start_price,
        snapshot.end_price,
      );
      await snapshot.save();
    }
  }

  // Finalize leaderboard
  await Leaderboard.findOneAndUpdate(
    { match_id: matchId },
    { is_final: true, finalized_at: new Date() },
  );

  // Update match status
  match.status = MATCH_STATUS.COMPLETED;
  match.end_time = new Date();
  await match.save();

  return match;
};

export default {
  createMatch,
  startMatch,
  updateRankings,
  endMatch,
};

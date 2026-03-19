import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import Match from "../models/Match.js";

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    if (username) {
      // Check if username is taken
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }
      updates.username = username;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update onboarding status
 */
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { has_completed_onboarding: true },
      { new: true },
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Complete practice match
 */
export const completePractice = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { has_completed_practice: true },
      { new: true },
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user match history
 */
export const getMatchHistory = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user_id: req.user._id })
      .populate(
        "match_id",
        "title type status start_time end_time prize_pool entry_fee max_participants current_participants",
      )
      .sort({ createdAt: -1 })
      .limit(50);

    // Get leaderboard rewards for settled matches
    const Leaderboard = (await import("../models/Leaderboard.js")).default;

    const history = await Promise.all(
      portfolios
        .filter((p) => p.match_id) // skip orphaned portfolios
        .map(async (p) => {
          const match = p.match_id;

          // Try to find reward from leaderboard for settled matches
          let reward = 0;
          let is_winner = false;
          try {
            const lb = await Leaderboard.findOne({ match_id: match._id });
            if (lb) {
              const entry = lb.rankings.find(
                (r) => r.user_id?.toString() === req.user._id.toString(),
              );
              if (entry) {
                reward = entry.reward || 0;
                is_winner = entry.is_winner || entry.rank <= 10;
              }
            }
          } catch {
            // no leaderboard yet — match still live
          }

          return {
            _id: p._id,
            match_id: match._id,
            match_title: match.title || "Unnamed Match",
            match_type: match.type,
            status: match.status,
            date: match.end_time || match.start_time,
            entry_fee: match.entry_fee || 0,
            prize_pool: match.prize_pool || 0,
            total_participants: match.current_participants || 0,
            max_participants: match.max_participants || 0,
            rank: p.rank,
            pnl: p.pnl || 0,
            pnl_percentage: p.pnl_percentage || 0,
            reward,
            is_winner,
            selected_tokens: p.assets || [],
          };
        }),
    );

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user stats
 */
export const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "skill_rating stats balance",
    );

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getProfile,
  updateProfile,
  completeOnboarding,
  completePractice,
  getMatchHistory,
  getStats,
};

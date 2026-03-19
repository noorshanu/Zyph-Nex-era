import User from "../models/User.js";
import Match from "../models/Match.js";
import Leaderboard from "../models/Leaderboard.js";
import Portfolio from "../models/Portfolio.js";
import Coin from "../models/Coin.js";

// ============ USER MANAGEMENT ============

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      skill_rating,
      balance,
      role,
    } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      skill_rating: skill_rating || 1000,
      balance: balance || 0,
      role: role || "user",
    });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.password;
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// ============ MATCH MANAGEMENT ============

export const createMatch = async (req, res) => {
  try {
    const {
      title,
      type,
      entry_fee,
      prize_pool,
      join_window_minutes,
      match_duration_minutes,
      max_participants,
      start_time,
      description,
      virtual_balance,
    } = req.body;

    // Backward compat: if old `duration` field sent, use it as join_window
    const joinWindow = join_window_minutes || req.body.duration || 30;
    const matchDuration = match_duration_minutes || 4;

    const match = await Match.create({
      title,
      type: type || "paid",
      entry_fee: entry_fee || 0,
      prize_pool: prize_pool || 0,
      virtual_balance: virtual_balance || 1000,
      join_window_minutes: joinWindow,
      match_duration_minutes: matchDuration,
      duration: joinWindow, // backward compat
      max_participants: max_participants || 50,
      start_time: new Date(start_time),
      description: description || "",
      status: "scheduled",
      created_by: req.user._id,
    });

    res.status(201).json({ success: true, data: match });
  } catch (error) {
    console.error("Create match error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create match",
    });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Match.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    console.error("Update match error:", error);
    res.status(500).json({ success: false, message: "Failed to update match" });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Match.findByIdAndDelete(id);
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    res
      .status(200)
      .json({ success: true, message: "Match deleted successfully" });
  } catch (error) {
    console.error("Delete match error:", error);
    res.status(500).json({ success: false, message: "Failed to delete match" });
  }
};

// @desc    Get match participants (joined users) — for admin view
// @route   GET /api/admin/matches/:id/participants
export const getMatchParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id).populate({
      path: "participants",
      select: "firstName lastName wallet_address email createdAt skill_rating",
    });

    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        match_title: match.title,
        match_status: match.status,
        total_joined: match.current_participants,
        max_participants: match.max_participants,
        participants: match.participants,
      },
    });
  } catch (error) {
    console.error("Get participants error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch participants" });
  }
};

// @desc    Get final leaderboard for a match — for admin view
// @route   GET /api/admin/matches/:id/leaderboard
export const getMatchLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Try finalized Leaderboard first
    const leaderboard = await Leaderboard.findOne({ match_id: id });
    if (leaderboard && leaderboard.rankings.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          rankings: leaderboard.rankings.slice(0, 10),
          is_final: leaderboard.is_final,
        },
      });
    }

    // Fallback: build live leaderboard from Portfolio data
    // (used when match is live but no Leaderboard doc created yet)
    const portfolios = await Portfolio.find({ match_id: id })
      .sort({ pnl_percentage: -1 })
      .limit(10)
      .populate("user_id", "firstName lastName wallet_address");

    if (portfolios.length === 0) {
      return res.status(200).json({
        success: true,
        data: { rankings: [], is_final: false },
      });
    }

    const rankings = portfolios.map((p, i) => ({
      rank: i + 1,
      user_id: p.user_id?._id,
      username: p.user_id?.firstName
        ? `${p.user_id.firstName} ${p.user_id.lastName}`
        : "User",
      wallet_address: p.user_id?.wallet_address || "",
      pnl: p.pnl,
      pnl_percentage: p.pnl_percentage,
      reward: 0, // not yet settled
      is_winner: i === 0,
      selected_tokens: p.assets || [],
    }));

    return res.status(200).json({
      success: true,
      data: { rankings, is_final: false },
    });
  } catch (error) {
    console.error("Get match leaderboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch leaderboard" });
  }
};

// ============ MATCH HISTORY (Admin) ============

// @desc    Get all completed/settled matches for admin history view
// @route   GET /api/admin/match-history
export const getAdminMatchHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [matches, total] = await Promise.all([
      Match.find({ status: { $in: ["completed", "settled"] } })
        .sort({ end_time: -1 })
        .skip(skip)
        .limit(limit),
      Match.countDocuments({ status: { $in: ["completed", "settled"] } }),
    ]);

    // Enrich each match with leaderboard winner
    const enriched = await Promise.all(
      matches.map(async (m) => {
        let winner = null;
        let totalPrizeDistributed = 0;
        try {
          const lb = await Leaderboard.findOne({ match_id: m._id });
          if (lb && lb.rankings.length > 0) {
            const top = lb.rankings.find((r) => r.rank === 1);
            winner = top
              ? {
                  username: top.username,
                  wallet_address: top.wallet_address,
                  pnl_percentage: top.pnl_percentage,
                  reward: top.reward,
                }
              : null;
            totalPrizeDistributed = lb.rankings.reduce(
              (s, r) => s + (r.reward || 0),
              0,
            );
          }
        } catch {
          /* no leaderboard */
        }

        return {
          _id: m._id,
          title: m.title,
          type: m.type,
          status: m.status,
          entry_fee: m.entry_fee,
          prize_pool: m.prize_pool,
          total_participants: m.current_participants,
          max_participants: m.max_participants,
          start_time: m.start_time,
          end_time: m.end_time,
          match_duration_minutes: m.match_duration_minutes,
          winner,
          total_prize_distributed: totalPrizeDistributed,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get admin match history error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch match history" });
  }
};

// ============ COIN MANAGEMENT ============

// @desc    Get all coins
// @route   GET /api/admin/coins
export const getCoins = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ symbol: 1 });
    res.status(200).json({ success: true, data: coins });
  } catch (error) {
    console.error("Get coins error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coins" });
  }
};

// @desc    Add a new coin
// @route   POST /api/admin/coins
export const addCoin = async (req, res) => {
  try {
    const { symbol, name, icon, coingecko_id } = req.body;
    if (!symbol || !name || !coingecko_id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "symbol, name, and coingecko_id are required",
        });
    }
    const existing = await Coin.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Coin with this symbol already exists",
        });
    }
    const coin = await Coin.create({
      symbol: symbol.toUpperCase(),
      name,
      icon: icon || symbol.toUpperCase(),
      coingecko_id,
      is_active: true,
    });
    res.status(201).json({ success: true, data: coin });
  } catch (error) {
    console.error("Add coin error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Failed to add coin" });
  }
};

// @desc    Update coin (toggle active, rename, etc)
// @route   PUT /api/admin/coins/:id
export const updateCoin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Prevent symbol change (it's used as key in price service)
    delete updates.symbol;
    const coin = await Coin.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!coin)
      return res
        .status(404)
        .json({ success: false, message: "Coin not found" });
    res.status(200).json({ success: true, data: coin });
  } catch (error) {
    console.error("Update coin error:", error);
    res.status(500).json({ success: false, message: "Failed to update coin" });
  }
};

// @desc    Delete a coin
// @route   DELETE /api/admin/coins/:id
export const removeCoin = async (req, res) => {
  try {
    const { id } = req.params;
    const coin = await Coin.findByIdAndDelete(id);
    if (!coin)
      return res
        .status(404)
        .json({ success: false, message: "Coin not found" });
    res
      .status(200)
      .json({ success: true, message: `${coin.symbol} removed successfully` });
  } catch (error) {
    console.error("Remove coin error:", error);
    res.status(500).json({ success: false, message: "Failed to remove coin" });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalMatches = await Match.countDocuments();
    const liveMatches = await Match.countDocuments({ status: "live" });
    const scheduledMatches = await Match.countDocuments({
      status: { $in: ["scheduled", "upcoming", "open"] },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalMatches,
        liveMatches,
        scheduledMatches,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

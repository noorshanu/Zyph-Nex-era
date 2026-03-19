import User from "../models/User.js";
import RewardLog from "../models/RewardLog.js";
import Leaderboard from "../models/Leaderboard.js";
import Match from "../models/Match.js";
import {
  REWARD_DISTRIBUTION,
  PLATFORM_FEE_PERCENTAGE,
  SKILL_RATING,
} from "../utils/constants.js";

/**
 * Settle a completed match and distribute rewards
 */
export const settleMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match || match.status !== "completed") {
    throw new Error("Match not found or not completed");
  }

  const leaderboard = await Leaderboard.findOne({
    match_id: matchId,
    is_final: true,
  });
  if (!leaderboard) {
    throw new Error("Final leaderboard not found");
  }

  // Calculate total prize pool
  const totalPool =
    match.prize_pool || match.entry_fee * match.current_participants;
  const platformFee = (totalPool * PLATFORM_FEE_PERCENTAGE) / 100;
  const distributablePool = totalPool - platformFee;

  // Create reward log
  const rewardLog = new RewardLog({
    match_id: matchId,
    total_pool: totalPool,
    platform_fee: platformFee,
    platform_fee_percentage: PLATFORM_FEE_PERCENTAGE,
    distributable_pool: distributablePool,
    distributions: [],
    status: "processing",
  });

  // Distribute rewards based on rank
  for (const ranking of leaderboard.rankings) {
    const percentage = REWARD_DISTRIBUTION[ranking.rank];
    if (percentage) {
      const reward = (distributablePool * percentage) / 100;

      // Credit user balance
      await User.findByIdAndUpdate(ranking.user_id, {
        $inc: { balance: reward },
      });

      rewardLog.distributions.push({
        user_id: ranking.user_id,
        rank: ranking.rank,
        amount: reward,
        credited_at: new Date(),
      });

      // Update ranking with reward
      ranking.reward = reward;
    }

    // Update user stats and skill rating
    await updateUserStats(
      ranking.user_id,
      ranking.rank,
      leaderboard.rankings.length,
    );
  }

  // Save leaderboard with rewards
  await leaderboard.save();

  // Complete reward log
  rewardLog.status = "completed";
  rewardLog.settled_at = new Date();
  await rewardLog.save();

  // Update match status
  match.status = "settled";
  await match.save();

  return rewardLog;
};

/**
 * Update user stats after match completion
 */
const updateUserStats = async (userId, rank, totalParticipants) => {
  const update = {
    $inc: {
      "stats.matches_played": 1,
    },
  };

  // Winner gets bonus
  if (rank === 1) {
    update.$inc["stats.matches_won"] = 1;
    update.$inc.skill_rating = SKILL_RATING.WIN_BONUS;
  } else if (rank <= 3) {
    update.$inc.skill_rating = SKILL_RATING.TOP_3_BONUS;
  } else if (rank > totalParticipants / 2) {
    update.$inc.skill_rating = -SKILL_RATING.LOSS_PENALTY;
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true });

  // Update best rank if applicable
  if (!user.stats.best_rank || rank < user.stats.best_rank) {
    user.stats.best_rank = rank;
    await user.save();
  }

  // Update win rate
  if (user.stats.matches_played > 0) {
    user.stats.win_rate =
      (user.stats.matches_won / user.stats.matches_played) * 100;
    await user.save();
  }

  return user;
};

export default {
  settleMatch,
};

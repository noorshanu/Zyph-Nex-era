import Match from "../models/Match.js";
import { startMatch, updateRankings, endMatch } from "./matchEngine.js";
import { settleMatch } from "./rewardEngine.js";
import { MATCH_STATUS } from "../utils/constants.js";

/**
 * Match Lifecycle Scheduler — Two-Phase Timing
 *
 * Phase 1: Join Window
 *   upcoming → open  (at start_time)
 *   open → live      (at start_time + join_window_minutes)
 *
 * Phase 2: Match Trading
 *   live → completed (at live_start_time + match_duration_minutes)
 *   completed → settled (distribute rewards)
 *
 * Rankings update every 30 seconds while live.
 */

let schedulerInterval = null;
let rankingInterval = null;

const processMatchLifecycle = async () => {
  const now = new Date();

  try {
    // 1. Open matches that have reached their start_time
    const matchesToOpen = await Match.find({
      status: { $in: [MATCH_STATUS.UPCOMING, "scheduled"] },
      start_time: { $lte: now },
    });

    for (const match of matchesToOpen) {
      match.status = MATCH_STATUS.OPEN;
      await match.save();
      console.log(
        `📢 Match "${match.title}" is now OPEN — join window started`,
      );
    }

    // 2. Close join window and go LIVE (start_time + join_window_minutes elapsed)
    const openMatches = await Match.find({ status: MATCH_STATUS.OPEN });

    for (const match of openMatches) {
      const joinWindowCloses = new Date(
        match.start_time.getTime() +
          (match.join_window_minutes ?? 30) * 60 * 1000,
      );

      if (now >= joinWindowCloses) {
        try {
          // Record when the live match started
          match.live_start_time = now;
          match.lock_time = now;
          await match.save();
          await startMatch(match._id);
          console.log(
            `🚀 Match "${match.title}" join window closed — now LIVE`,
          );
        } catch (err) {
          console.error(`Failed to start match ${match._id}:`, err.message);
        }
      }
    }

    // 3. End matches whose match_duration has expired after going live
    const liveMatches = await Match.find({ status: MATCH_STATUS.LIVE });

    for (const match of liveMatches) {
      const liveStart = match.live_start_time || match.start_time;
      const matchDurationMs = (match.match_duration_minutes ?? 4) * 60 * 1000;
      const endTime = new Date(liveStart.getTime() + matchDurationMs);

      if (now >= endTime) {
        try {
          await endMatch(match._id);
          console.log(`🏁 Match "${match.title}" has COMPLETED`);
        } catch (err) {
          console.error(`Failed to end match ${match._id}:`, err.message);
        }
      }
    }

    // 4. Settle completed matches (distribute rewards, save leaderboard)
    const matchesToSettle = await Match.find({
      status: MATCH_STATUS.COMPLETED,
    });

    for (const match of matchesToSettle) {
      try {
        await settleMatch(match._id);
        console.log(`💰 Match "${match.title}" has been SETTLED`);
      } catch (err) {
        console.error(`Failed to settle match ${match._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Match lifecycle error:", error.message);
  }
};

const processRankingUpdates = async () => {
  try {
    const liveMatches = await Match.find({ status: MATCH_STATUS.LIVE });

    for (const match of liveMatches) {
      try {
        await updateRankings(match._id);
      } catch (err) {
        console.error(
          `Failed to update rankings for match ${match._id}:`,
          err.message,
        );
      }
    }
  } catch (error) {
    console.error("Ranking update error:", error.message);
  }
};

export const startScheduler = () => {
  console.log("⏱️  Match scheduler started (two-phase timing)");

  // Check lifecycle transitions every 15 seconds
  schedulerInterval = setInterval(processMatchLifecycle, 15 * 1000);

  // Update live match rankings every 30 seconds
  rankingInterval = setInterval(processRankingUpdates, 30 * 1000);

  // Run immediately on startup
  processMatchLifecycle();
};

export const stopScheduler = () => {
  if (schedulerInterval) clearInterval(schedulerInterval);
  if (rankingInterval) clearInterval(rankingInterval);
  console.log("⏱️  Match scheduler stopped");
};

export default { startScheduler, stopScheduler };

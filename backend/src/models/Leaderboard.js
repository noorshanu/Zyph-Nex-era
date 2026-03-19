import mongoose from "mongoose";

const rankingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: String,
  wallet_address: String, // wallet address for admin view
  pnl: Number,
  pnl_percentage: Number,
  rank: Number,
  reward: {
    type: Number,
    default: 0,
  },
  is_winner: {
    type: Boolean,
    default: false,
  },
});

const leaderboardSchema = new mongoose.Schema(
  {
    match_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },
    rankings: [rankingSchema],
    is_final: {
      type: Boolean,
      default: false,
    },
    finalized_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;

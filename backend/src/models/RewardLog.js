import mongoose from "mongoose";

const distributionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rank: Number,
  amount: Number,
  credited_at: Date,
});

const rewardLogSchema = new mongoose.Schema(
  {
    match_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },
    total_pool: {
      type: Number,
      required: true,
    },
    platform_fee: {
      type: Number,
      default: 0,
    },
    platform_fee_percentage: {
      type: Number,
      default: 10, // 10% default fee
    },
    distributable_pool: {
      type: Number,
    },
    distributions: [distributionSchema],
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    settled_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const RewardLog = mongoose.model("RewardLog", rewardLogSchema);

export default RewardLog;

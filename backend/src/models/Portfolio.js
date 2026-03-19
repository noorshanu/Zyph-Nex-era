import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema({
  asset: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    max: 1000,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
});

const portfolioSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    match_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    assets: [
      {
        type: String, // Selected asset symbols
      },
    ],
    allocations: [allocationSchema],
    total_capital: {
      type: Number,
      default: 1000,
    },
    locked_at: {
      type: Date,
      default: null,
    },
    is_locked: {
      type: Boolean,
      default: false,
    },
    // Performance tracking
    start_value: {
      type: Number,
      default: 1000,
    },
    current_value: {
      type: Number,
      default: 1000,
    },
    pnl: {
      type: Number,
      default: 0,
    },
    pnl_percentage: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user + match lookup
portfolioSchema.index({ user_id: 1, match_id: 1 }, { unique: true });
portfolioSchema.index({ match_id: 1, pnl_percentage: -1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;

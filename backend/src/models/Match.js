import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["practice", "paid", "free"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    entry_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    prize_pool: {
      type: Number,
      default: 0,
      min: 0,
    },
    virtual_balance: {
      type: Number,
      default: 1000,
    },
    // How long users can join before the match goes live (minutes)
    join_window_minutes: {
      type: Number,
      default: 30,
      min: 1,
    },
    // How long the actual match trading runs (minutes)
    match_duration_minutes: {
      type: Number,
      default: 4,
      min: 1,
    },
    // Kept for backward compatibility — same as join_window_minutes
    duration: {
      type: Number,
      default: 30,
      min: 1,
    },
    max_participants: {
      type: Number,
      default: 100,
      min: 2,
    },
    current_participants: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "upcoming",
        "open", // join window active
        "locked", // join window closed, going live
        "live", // match trading in progress
        "completed",
        "settled",
        "scheduled",
      ],
      default: "upcoming",
    },
    // When the join window opens (users can start joining)
    start_time: {
      type: Date,
      required: true,
    },
    // When the match went live (set automatically by scheduler)
    live_start_time: {
      type: Date,
    },
    // When the match ended
    end_time: {
      type: Date,
    },
    lock_time: {
      type: Date, // when portfolios are locked (= start_time + join_window_minutes)
    },
    allowed_assets: [
      {
        type: String,
      },
    ],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Virtual: when the join window closes and match goes live
matchSchema.virtual("join_closes_at").get(function () {
  if (!this.start_time) return null;
  return new Date(
    this.start_time.getTime() + this.join_window_minutes * 60 * 1000,
  );
});

// Virtual: when the live match ends
matchSchema.virtual("match_ends_at").get(function () {
  if (!this.live_start_time) return null;
  return new Date(
    this.live_start_time.getTime() + this.match_duration_minutes * 60 * 1000,
  );
});

matchSchema.set("toJSON", { virtuals: true });
matchSchema.set("toObject", { virtuals: true });

// Index for efficient queries
matchSchema.index({ status: 1, start_time: 1 });
matchSchema.index({ type: 1 });

const Match = mongoose.model("Match", matchSchema);

export default Match;

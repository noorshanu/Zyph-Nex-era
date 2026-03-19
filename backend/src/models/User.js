import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,20})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Competition Platform Fields
    skill_rating: {
      type: Number,
      default: 1000,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    region: {
      type: String,
      default: "global",
    },
    stats: {
      matches_played: { type: Number, default: 0 },
      matches_won: { type: Number, default: 0 },
      total_pnl: { type: Number, default: 0 },
      best_rank: { type: Number, default: null },
      win_rate: { type: Number, default: 0 },
    },
    has_completed_onboarding: {
      type: Boolean,
      default: false,
    },
    has_completed_practice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

const User = mongoose.model("User", userSchema);

// Sync indexes to ensure sparse indexes are applied correctly
// This drops stale indexes that don't match the schema definition
User.syncIndexes().catch((err) =>
  console.error("Error syncing User indexes:", err),
);

export default User;

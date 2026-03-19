import mongoose from "mongoose";

const assetSnapshotSchema = new mongoose.Schema(
  {
    match_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    asset: {
      type: String,
      required: true,
    },
    start_price: {
      type: Number,
      required: true,
    },
    end_price: {
      type: Number,
      default: null,
    },
    current_price: {
      type: Number,
    },
    price_change_percentage: {
      type: Number,
      default: 0,
    },
    snapshot_time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for match + asset queries
assetSnapshotSchema.index({ match_id: 1, asset: 1 });

const AssetSnapshot = mongoose.model("AssetSnapshot", assetSnapshotSchema);

export default AssetSnapshot;

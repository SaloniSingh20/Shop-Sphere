const mongoose = require("mongoose");

const searchCacheSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    results: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

searchCacheSchema.index({ timestamp: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("SearchCache", searchCacheSchema);

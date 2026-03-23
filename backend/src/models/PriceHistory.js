const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: String,
    platform: String,
    product_url: String,
    price: Number,
    rating: Number,
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

priceHistorySchema.index({ query: 1, product_url: 1, capturedAt: -1 });

module.exports = mongoose.model("PriceHistory", priceHistorySchema);

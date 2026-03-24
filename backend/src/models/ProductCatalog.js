const mongoose = require("mongoose");

const productCatalogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sourceKeyword: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      index: true,
    },
    image: {
      type: String,
      default: null,
    },
    platform: {
      type: String,
      required: true,
      index: true,
    },
    product_url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

productCatalogSchema.index({ category: 1, updatedAt: -1 });
productCatalogSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("ProductCatalog", productCatalogSchema);

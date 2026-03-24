const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    rating: Number,
    image: String,
    platform: String,
    product_url: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const recentSearchSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const recentlyViewedSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    rating: Number,
    image: String,
    platform: String,
    product_url: {
      type: String,
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    wishlist: {
      type: [wishlistSchema],
      default: [],
    },
    recentSearches: {
      type: [recentSearchSchema],
      default: [],
    },
    recentlyViewed: {
      type: [recentlyViewedSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema);

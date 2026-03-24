const User = require("../models/User");

function keepLatestUniqueByUrl(items = [], max = 20) {
  const seen = new Set();
  const next = [];

  for (const item of items) {
    if (!item?.product_url) continue;
    if (seen.has(item.product_url)) continue;
    seen.add(item.product_url);
    next.push(item);
    if (next.length >= max) break;
  }

  return next;
}

async function getUserActivity(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select("name email wishlist recentSearches recentlyViewed createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        joinDate: user.createdAt,
      },
      wishlist: user.wishlist || [],
      recentSearches: user.recentSearches || [],
      recentlyViewed: user.recentlyViewed || [],
    });
  } catch (error) {
    return next(error);
  }
}

async function addRecentlyViewed(req, res, next) {
  try {
    const { title, description, price, rating, image, platform, product_url } = req.body;
    if (!title || !platform || !product_url || !price) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextItems = [
      {
        title,
        description,
        price,
        rating,
        image,
        platform,
        product_url,
        viewedAt: new Date(),
      },
      ...(user.recentlyViewed || []),
    ];

    user.recentlyViewed = keepLatestUniqueByUrl(nextItems, 25);
    await user.save();

    return res.status(201).json({ recentlyViewed: user.recentlyViewed });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUserActivity,
  addRecentlyViewed,
};

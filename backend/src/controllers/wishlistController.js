const User = require("../models/User");

async function getWishlist(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select("wishlist");
    return res.json({ wishlist: user?.wishlist || [] });
  } catch (error) {
    return next(error);
  }
}

async function addWishlistItem(req, res, next) {
  try {
    const { title, description, price, rating, image, platform, product_url } = req.body;
    if (!product_url || !title || !price || !platform) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.wishlist.some((item) => item.product_url === product_url);
    if (!exists) {
      user.wishlist.push({ title, description, price, rating, image, platform, product_url });
      await user.save();
    }

    return res.status(201).json({ wishlist: user.wishlist });
  } catch (error) {
    return next(error);
  }
}

async function removeWishlistItem(req, res, next) {
  try {
    const { encodedUrl } = req.params;
    const productUrl = decodeURIComponent(encodedUrl);

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((item) => item.product_url !== productUrl);
    await user.save();

    return res.json({ wishlist: user.wishlist });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
};

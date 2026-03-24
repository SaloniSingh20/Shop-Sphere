const express = require("express");
const {
	searchProducts,
	getRecommendations,
	getPriceDrops,
} = require("../controllers/searchController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/search", optionalAuth, searchProducts);
router.get("/recommendations", optionalAuth, getRecommendations);
router.get("/price-drops", optionalAuth, getPriceDrops);

module.exports = router;

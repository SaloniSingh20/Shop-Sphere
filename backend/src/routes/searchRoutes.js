const express = require("express");
const {
	searchProducts,
	getRecommendations,
	getPriceDrops,
} = require("../controllers/searchController");

const router = express.Router();

router.get("/search", searchProducts);
router.get("/recommendations", getRecommendations);
router.get("/price-drops", getPriceDrops);

module.exports = router;

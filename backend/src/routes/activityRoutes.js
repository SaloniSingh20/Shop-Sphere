const express = require("express");
const { getUserActivity, addRecentlyViewed } = require("../controllers/activityController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", getUserActivity);
router.post("/viewed", addRecentlyViewed);

module.exports = router;

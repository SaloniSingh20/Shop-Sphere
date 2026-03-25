const express = require("express");
const { login, signup, getMe, socialLogin } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/social", socialLogin);
router.get("/me", requireAuth, getMe);

module.exports = router;

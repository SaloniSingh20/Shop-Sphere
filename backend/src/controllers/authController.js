const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const env = require("../config/env");

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
}

async function socialLogin(req, res, next) {
  try {
    const provider = String(req.body.provider || "").trim().toLowerCase();
    if (!["google", "apple"].includes(provider)) {
      return res.status(400).json({ message: "provider must be google or apple" });
    }

    const emailInput = String(req.body.email || "").trim().toLowerCase();
    const nameInput = String(req.body.name || "").trim();

    const generatedId = crypto.randomBytes(5).toString("hex");
    const email = emailInput || `${provider}_${generatedId}@shopsphere.social`;
    const name = nameInput || `${provider[0].toUpperCase()}${provider.slice(1)} User`;

    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);
      user = await User.create({
        name,
        email,
        passwordHash,
        authProvider: provider,
      });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
  getMe,
  socialLogin,
};

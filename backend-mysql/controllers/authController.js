const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../models");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: "cashier",
      isActive: true
    });

    res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // short-lived access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // long-lived refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // save refresh token in DB
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // 🔥 VERY IMPORTANT: set refresh token in COOKIE
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,   // JS cannot access
      secure: false,    // true only in HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // send ONLY access token to frontend
    res.json({
      message: "Login successful",
      accessToken,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  try {
    // 🔑 read refresh token from COOKIE
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Session expired" });
    }

    // verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // check DB
    const stored = await RefreshToken.findOne({
      where: { token: refreshToken }
    });
    if (!stored) {
      return res.status(401).json({ message: "Session expired" });
    }

    // find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // remove old refresh token
    await RefreshToken.destroy({ where: { token: refreshToken } });

    // create new refresh token
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // update cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // new access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Session expired" });
  }
};
/* ================= GET PROFILE ================= */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

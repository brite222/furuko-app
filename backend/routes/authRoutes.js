const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../utils/emailService");

router.get("/", (req, res) => res.send("Auth route working 🔐"));

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      return res.status(400).json({ message: `${field} already exists ❌` });
    }

    const hashed = await bcrypt.hash(password, 10);

    // FIND REFERRER
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    }

    // GENERATE REFERRAL CODE
    const newReferralCode = username.toUpperCase().slice(0, 5) +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    const user = await User.create({
      username,
      email,
      password: hashed,
      referralCode: newReferralCode,
      referredBy: referrer ? referrer._id : null,
      points: referrer ? 20 : 0,
    });

    // REWARD REFERRER
    if (referrer) {
      referrer.points += 100;
      referrer.referralCount += 1;
      referrer.tasks.referFriend = true;
      await addPointsHistory(referrer, 100);
      await referrer.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    sendWelcomeEmail(email, username).catch(console.error);

    res.json({
      message: "User registered successfully ✅",
      token,
      user: { id: user._id, username: user.username, email: user.email },
      bonusPoints: referrer ? 20 : 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password ❌" });

    const now = new Date();
    const last = user.lastLogin ? new Date(user.lastLogin) : null;
    const isNewDay = !last || now.toDateString() !== last.toDateString();

    if (isNewDay) {
      const isConsecutive = last && (now - last) < 48 * 60 * 60 * 1000;
      user.streak = isConsecutive ? user.streak + 1 : 1;
      user.points += 10;

      await addPointsHistory(user, 10);

      user.tasks.loginToday    = true;
      user.tasks.connectWallet = !!user.wallet;
      user.tasks.earn500Points = user.points >= 500;
      user.lastLogin = now;

      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

async function addPointsHistory(user, pts) {
  const today = new Date().toISOString().split("T")[0];
  const entry = user.pointsHistory?.find(p => p.date === today);
  if (entry) {
    entry.points += pts;
  } else {
    user.pointsHistory.push({ date: today, points: pts });
  }
}

module.exports = router;
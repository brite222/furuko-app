const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { sendRankChangeEmail } = require("../utils/emailService");

// GET profile + stats
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;
    res.json({ user: { ...user.toObject(), rank } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET leaderboard
router.get("/leaderboard", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ "settings.hideLeaderboard": { $ne: true } })
      .select("username points")
      .sort({ points: -1 })
      .limit(10);
    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST complete a task
router.post("/task", verifyToken, async (req, res) => {
  try {
    const { taskKey } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pointsMap = {
      loginToday:      10,
      connectWallet:   50,
      completeProfile: 30,
      referFriend:     100,
      earn500Points:   20
    };

    if (!pointsMap[taskKey])
      return res.status(400).json({ message: "Invalid task" });

    if (user.tasks[taskKey])
      return res.status(400).json({ message: "Task already completed" });

    user.tasks[taskKey] = true;
    user.points += pointsMap[taskKey];
    await addPointsHistory(user, pointsMap[taskKey]);

    if (user.points >= 500) user.tasks.earn500Points = true;

    await user.save();

    // Check rank change
    const oldRank = await User.countDocuments({ points: { $gt: user.points - pointsMap[taskKey] } }) + 1;
    const newRank = await User.countDocuments({ points: { $gt: user.points } }) + 1;
    if (oldRank !== newRank && user?.settings?.notifications?.rank !== false) {
      sendRankChangeEmail(user.email, user.username, oldRank, newRank).catch(console.error);
    }

    res.json({ message: "Task completed ✅", points: user.points, tasks: user.tasks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST save wallet
router.post("/wallet", verifyToken, async (req, res) => {
  try {
    const { wallet } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyConnected = !!user.wallet;
    user.wallet = wallet;

    if (!alreadyConnected) {
      user.tasks.connectWallet = true;
      user.points += 50;
      await addPointsHistory(user, 50);
    }

    await user.save();
    res.json({
      message: "Wallet saved ✅",
      wallet: user.wallet,
      points: user.points,
      tasks: user.tasks
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: user._id }
    });
    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      return res.status(400).json({ message: `${field} already taken ❌` });
    }

    user.username = username || user.username;
    user.email    = email    || user.email;
    await user.save();
    res.json({ message: "Profile updated ✅", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT change password
router.put("/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect ❌" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET weekly activity
router.get("/weekly", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = user.pointsHistory.find(p => p.date === dateStr);
      days.push({ date: dateStr, points: entry ? entry.points : 0 });
    }
    res.json({ weekly: days });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET referral info
router.get("/referral", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.referralCode) {
      user.referralCode = user.username.toUpperCase().slice(0, 5) +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      await user.save();
    }

    const referralLink = `http://127.0.0.1:5500/frontend/index.html?ref=${user.referralCode}`;
    res.json({
      referralCode:  user.referralCode,
      referralLink,
      referralCount: user.referralCount || 0,
      pointsEarned:  (user.referralCount || 0) * 100
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET settings
router.get("/settings", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("settings");
    res.json({ settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update settings
router.put("/settings", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();
    res.json({ message: "Settings saved ✅", settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE account
router.delete("/account", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

async function addPointsHistory(user, pts) {
  const today = new Date().toISOString().split("T")[0];
  const entry = user.pointsHistory.find(p => p.date === today);
  if (entry) {
    entry.points += pts;
  } else {
    user.pointsHistory.push({ date: today, points: pts });
  }
}

module.exports = router;
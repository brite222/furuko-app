require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); 
const connectDB = require("./db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));  // ← ADD THIS

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.get("/", (req, res) => res.send("Backend is working 🚀"));

app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

const cron = require("node-cron");
const User = require("./models/User");
const { sendStreakReminder } = require("./utils/emailService");

// Run every day at 8PM
cron.schedule("0 20 * * *", async () => {
  console.log("Running streak reminder job...");
  try {
    const now = new Date();
    const users = await User.find({ streak: { $gt: 0 } });

    for (const user of users) {
      if (!user.lastLogin) continue;
      const hoursSince = (now - new Date(user.lastLogin)) / (1000 * 60 * 60);

      // If 20+ hours since last login and notifications enabled
      if (hoursSince >= 20 && user?.settings?.notifications?.streak !== false) {
        sendStreakReminder(user.email, user.username, user.streak).catch(console.error);
      }
    }
  } catch (err) {
    console.error("Streak cron error:", err);
  }
});


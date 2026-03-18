const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true },
  email:         { type: String, required: true, unique: true },
  password:      { type: String, required: true },
  points:        { type: Number, default: 0 },
  streak:        { type: Number, default: 0 },
  lastLogin:     { type: Date, default: null },
  wallet:        { type: String, default: null },
  avatar:        { type: String, default: null },

  tasks: {
    loginToday:      { type: Boolean, default: false },
    connectWallet:   { type: Boolean, default: false },
    completeProfile: { type: Boolean, default: false },
    referFriend:     { type: Boolean, default: false },
    earn500Points:   { type: Boolean, default: false },
  },

  settings: {
    theme:           { type: String, default: "dark" },
    hideLeaderboard: { type: Boolean, default: false },
    notifications: {
      email:  { type: Boolean, default: true },
      streak: { type: Boolean, default: true },
      rank:   { type: Boolean, default: true },
    },
    language: { type: String, default: "en" }
  },

  referralCode:  { type: String, default: null },
  referredBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referralCount: { type: Number, default: 0 },

  pointsHistory: [
    {
      date:   { type: String },
      points: { type: Number, default: 0 }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendWelcomeEmail(to, username) {
  await transporter.sendMail({
    from: `"FUKURO APP" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to FUKURO 🎉",
    html: `
      <div style="background:#060608;color:#f0f0f8;font-family:'Outfit',sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="font-size:48px;letter-spacing:8px;color:#c8f542;margin:0;">FUKURO</h1>
        <p style="color:#8888aa;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Ecosystem Dashboard</p>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <h2 style="color:#f0f0f8;">Welcome, ${username}! 🚀</h2>
        <p style="color:#8888aa;line-height:1.6;">Your account has been created successfully. Start earning points, climbing the leaderboard, and building your streak!</p>
        <div style="background:#13131c;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:24px;margin:24px 0;">
          <p style="color:#c8f542;font-size:14px;margin:0 0 8px;">🎯 Get started:</p>
          <p style="color:#8888aa;margin:4px 0;">✅ Login daily for streak points</p>
          <p style="color:#8888aa;margin:4px 0;">💼 Connect your wallet for +50 pts</p>
          <p style="color:#8888aa;margin:4px 0;">🏆 Climb the leaderboard</p>
        </div>
        <a href="https://fukuuroo.com/dashboard.html" 
           style="display:inline-block;background:#c8f542;color:#000;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
          Open Dashboard →
        </a>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <p style="color:#5a5a72;font-size:12px;">FUKURO APP — You're receiving this because you registered an account.</p>
      </div>
    `
  });
}

async function sendStreakReminder(to, username, streak) {
  await transporter.sendMail({
    from: `"FUKURO APP" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚠️ Don't break your ${streak}-day streak, ${username}!`,
    html: `
      <div style="background:#060608;color:#f0f0f8;font-family:'Outfit',sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="font-size:48px;letter-spacing:8px;color:#c8f542;margin:0;">FUKURO</h1>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <h2 style="color:#f5a442;">🔥 Your streak is at risk!</h2>
        <p style="color:#8888aa;line-height:1.6;">Hey <strong style="color:#f0f0f8;">${username}</strong>, you haven't logged in today. Your <strong style="color:#f5a442;">${streak}-day streak</strong> is about to reset!</p>
        <div style="background:#13131c;border:1px solid rgba(245,164,66,0.2);border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
          <p style="font-size:48px;margin:0;">🔥</p>
          <p style="font-family:monospace;font-size:36px;color:#f5a442;margin:8px 0;">${streak} DAYS</p>
          <p style="color:#8888aa;font-size:14px;">Don't let it go to waste!</p>
        </div>
        <a href="https://fukuuroo.com/login.html"
           style="display:inline-block;background:#f5a442;color:#000;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
          Login Now →
        </a>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <p style="color:#5a5a72;font-size:12px;">FUKURO APP — Streak reminder notification.</p>
      </div>
    `
  });
}

async function sendReferralEmail(to, referrerUsername, newUsername) {
  await transporter.sendMail({
    from: `"FUKURO APP" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 ${newUsername} joined using your referral!`,
    html: `
      <div style="background:#060608;color:#f0f0f8;font-family:'Outfit',sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="font-size:48px;letter-spacing:8px;color:#c8f542;margin:0;">FUKURO</h1>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <h2 style="color:#c8f542;">🎉 Referral Bonus!</h2>
        <p style="color:#8888aa;line-height:1.6;">Hey <strong style="color:#f0f0f8;">${referrerUsername}</strong>, <strong style="color:#c8f542;">${newUsername}</strong> just signed up using your referral code!</p>
        <div style="background:#13131c;border:1px solid rgba(200,245,66,0.2);border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
          <p style="font-size:48px;margin:0;">🏆</p>
          <p style="font-family:monospace;font-size:36px;color:#c8f542;margin:8px 0;">+100 PTS</p>
          <p style="color:#8888aa;font-size:14px;">Added to your account!</p>
        </div>
        <a href="https://fukuuroo.com/dashboard.html"
           style="display:inline-block;background:#c8f542;color:#000;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
          View Dashboard →
        </a>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <p style="color:#5a5a72;font-size:12px;">FUKURO APP — Referral notification.</p>
      </div>
    `
  });
}

async function sendRankChangeEmail(to, username, oldRank, newRank) {
  const improved = newRank < oldRank;
  await transporter.sendMail({
    from: `"FUKURO APP" <${process.env.EMAIL_USER}>`,
    to,
    subject: improved ? `🏆 You climbed to #${newRank} on the leaderboard!` : `📉 Your rank dropped to #${newRank}`,
    html: `
      <div style="background:#060608;color:#f0f0f8;font-family:'Outfit',sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="font-size:48px;letter-spacing:8px;color:#c8f542;margin:0;">FUKURO</h1>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <h2 style="color:${improved ? "#c8f542" : "#f542a4"};">${improved ? "🏆 Rank Up!" : "📉 Rank Drop"}</h2>
        <p style="color:#8888aa;line-height:1.6;">Hey <strong style="color:#f0f0f8;">${username}</strong>, your leaderboard rank just changed!</p>
        <div style="background:#13131c;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:24px;">
            <div>
              <p style="color:#8888aa;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Before</p>
              <p style="font-family:monospace;font-size:36px;color:#8888aa;">#${oldRank}</p>
            </div>
            <p style="font-size:24px;">→</p>
            <div>
              <p style="color:#8888aa;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Now</p>
              <p style="font-family:monospace;font-size:36px;color:${improved ? "#c8f542" : "#f542a4"};">#${newRank}</p>
            </div>
          </div>
        </div>
        <a href="https://fukuuroo.com/leaderboard.html"
           style="display:inline-block;background:#c8f542;color:#000;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
          View Leaderboard →
        </a>
        <hr style="border:1px solid rgba(255,255,255,0.07);margin:24px 0;">
        <p style="color:#5a5a72;font-size:12px;">FUKURO APP — Rank change notification.</p>
      </div>
    `
  });
}

// ✅ Single export at the bottom
module.exports = { sendWelcomeEmail, sendStreakReminder, sendRankChangeEmail, sendReferralEmail };
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided ❌" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // ✅ use .env
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token ❌" });
  }
};

module.exports = verifyToken;
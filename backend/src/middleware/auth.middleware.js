const jwt = require("jsonwebtoken");

/* ─────────────────────────────────────────
   verifyToken
   Reads JWT from httpOnly cookie OR
   Authorization: Bearer <token> header.
   Attaches decoded payload to req.user.
───────────────────────────────────────── */
const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "No token — please log in" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Session expired — please log in again" });
    }
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};

/* ─────────────────────────────────────────
   requireRole(...roles)
   Usage:
     requireRole("admin")
     requireRole("admin", "officer")
   Must come AFTER verifyToken in the chain.
───────────────────────────────────────── */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error:   `Access denied. Allowed roles: ${roles.join(", ")}`,
      yourRole: req.user.role,
    });
  }

  next();
};

module.exports = { verifyToken, requireRole };
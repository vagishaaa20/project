const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../db/db");
const crypto   = require("crypto");
const { sendPasswordResetEmail } = require("../utils/mailer");


/* ─────────────────────────────────────────
   Helper — sign a JWT and set httpOnly cookie
───────────────────────────────────────── */
const signAndSend = (res, user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // allows cross-site cookies for frontend-backend in different domains
    maxAge:   8 * 60 * 60 * 1000,   // 8 h in ms
  });

  return token;
};

/* ─────────────────────────────────────────
   POST /auth/register
   Body: { name, email, password, role }
   Roles allowed: admin | officer | viewer
   ⚠  Lock this route behind requireRole("admin")
      in production so only admins create accounts.
───────────────────────────────────────── */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  const VALID_ROLES = ["admin", "officer", "viewer"];
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, error: `Role must be one of: ${VALID_ROLES.join(", ")}` });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
  }

  try {
    // Check duplicate email
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    const hash   = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), hash, role]
    );

    const user = result.rows[0];
    signAndSend(res, user);

    return res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[register]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ─────────────────────────────────────────
   POST /auth/login
   Body: { email, password }
───────────────────────────────────────── */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    // Same error message for wrong email AND wrong password — prevents user enumeration
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Record last login (non-blocking)
    pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]).catch(console.error);

    signAndSend(res, user);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[login]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ─────────────────────────────────────────
   POST /auth/logout
───────────────────────────────────────── */
const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
  return res.json({ success: true, message: "Logged out" });
};

/* ─────────────────────────────────────────
   GET /auth/me
   Returns current user from verified JWT.
   Requires verifyToken middleware on the route.
───────────────────────────────────────── */
const me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, last_login, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("[me]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ─────────────────────────────────────────
   GET /auth/users          (admin only)
   List all users — mount with requireRole("admin")
───────────────────────────────────────── */
const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, last_login, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error("[listUsers]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ─────────────────────────────────────────
   PATCH /auth/users/:id/role   (admin only)
   Body: { role }
───────────────────────────────────────── */
const updateUserRole = async (req, res) => {
  const { id }   = req.params;
  const { role } = req.body;

  const VALID_ROLES = ["admin", "officer", "viewer"];
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role" });
  }

  // Prevent admin from demoting themselves
  if (id === req.user.id) {
    return res.status(400).json({ success: false, error: "Cannot change your own role" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("[updateUserRole]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ─────────────────────────────────────────
   DELETE /auth/users/:id   (admin only)
───────────────────────────────────────── */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ success: false, error: "Cannot delete your own account" });
  }

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("[deleteUser]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ─────────────────────────────────────────
   GET /auth/logs
   Returns recent audit log entries
───────────────────────────────────────── */
const getLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        al.action,
        al.created_at AS timestamp,
        al.detail,
        al.ip_address,
        u.name AS user_name
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
      LIMIT 50
    `);

    const logs = result.rows.map(row => ({
      action: row.detail ? `${row.action} - ${row.detail}` : row.action,
      status: 200,
      timestamp: row.timestamp,
      user: row.user_name,
      ip:row.ip_address || "127.0.0.1"
    }));

    res.json(logs);
  } catch (err) {
    console.error("[getLogs]", err.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

/* ── POST /auth/forgot-password ── */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    // Always return success to prevent user enumeration
    if (result.rows.length === 0) {
      return res.json({ success: true, message: "If that email exists, a reset link was sent." });
    }

    const user  = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Invalidate old tokens
    await pool.query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE",
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expires]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return res.json({ success: true, message: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error("[forgotPassword]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── POST /auth/reset-password ── */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, error: "Token and password required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
  }

  try {
    const result = await pool.query(
      `SELECT prt.*, u.email FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset link" });
    }

    const { user_id, id: tokenId } = result.rows[0];
    const hash = await bcrypt.hash(password, 12);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, user_id]);
    await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE id = $1", [tokenId]);

    return res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("[resetPassword]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── GET /auth/notifications ── */
const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    const unread = result.rows.filter(n => !n.read).length;
    return res.json({ success: true, notifications: result.rows, unread });
  } catch (err) {
    console.error("[getNotifications]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── PATCH /auth/notifications/:id/read ── */
const markNotificationRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── PATCH /auth/notifications/read-all ── */
const markAllRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET read = TRUE WHERE user_id = $1",
      [req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── DELETE /auth/notifications/:id ── */
const deleteNotification = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, error: "No credential provided" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    let user;
    if (result.rows.length === 0) {
      // Auto create as viewer
      const insert = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'viewer')
         RETURNING id, name, email, role`,
        [name, email.toLowerCase(), `GOOGLE_${googleId}`]
      );
      user = insert.rows[0];
    } else {
      user = result.rows[0];
    }

    signAndSend(res, user);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error("[googleLogin]", err.message);
    return res.status(401).json({ success: false, error: "Invalid Google token" });
  }
};

module.exports = {
  register, login, logout, me,
  listUsers, updateUserRole, deleteUser,
  getLogs, forgotPassword, resetPassword,
  googleLogin,
  getNotifications, markNotificationRead, markAllRead, deleteNotification,
};

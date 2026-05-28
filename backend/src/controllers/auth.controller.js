const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../db/db");

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
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
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
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
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
      user: row.user_name
    }));

    res.json(logs);
  } catch (err) {
    console.error("[getLogs]", err.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

module.exports = { register, login, logout, me, listUsers, updateUserRole, deleteUser, getLogs };

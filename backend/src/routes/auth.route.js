const express = require("express");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const {
  register,
  login,
  logout,
  me,
  listUsers,
  updateUserRole,
  deleteUser,
  getLogs,
  getNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  googleLogin,
  forgotPassword,
  resetPassword
} = require("../controllers/auth.controller");

const router = express.Router();

// auth.route.js — add this temporarily at the top
console.log("✓ auth.route.js loaded");

/* ── Public routes ─────────────────────── */
router.post("/login",    login);
console.log("✓ /auth/login hit");
router.post("/logout",   logout);

/* ── Any authenticated user ────────────── */
router.get("/me",        verifyToken, me);
router.get("/logs",     verifyToken, getLogs);

/* ── Admin only ─────────────────────────
   Register is admin-only so random users
   cannot sign up. Seed your first admin
   via: node src/scripts/seed.js
────────────────────────────────────────── */
router.post(  "/register",         verifyToken, requireRole("admin"), register);
router.get(   "/users",            verifyToken, requireRole("admin"), listUsers);
router.patch( "/users/:id/role",   verifyToken, requireRole("admin"), updateUserRole);
router.delete("/users/:id",        verifyToken, requireRole("admin"), deleteUser);


router.get(   "/notifications",           verifyToken, getNotifications);
router.patch( "/notifications/:id/read",  verifyToken, markNotificationRead);
router.patch( "/notifications/read-all",  verifyToken, markAllRead);
router.delete("/notifications/:id",       verifyToken, deleteNotification);

router.post("/google", googleLogin); 
// Public routes — no auth needed
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

module.exports = router;
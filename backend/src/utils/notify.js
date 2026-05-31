const pool = require("../db/db");

/**
 * Create a notification for a specific user
 */
const notify = async (userId, title, message, type = "info", entity = null, entityId = null) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, entity, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, title, message, type, entity, entityId]
    );
  } catch (err) {
    console.error("[notify]", err.message);
  }
};

/**
 * Notify all admins
 */
const notifyAdmins = async (title, message, type = "info", entity = null, entityId = null) => {
  try {
    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins.rows) {
      await notify(admin.id, title, message, type, entity, entityId);
    }
  } catch (err) {
    console.error("[notifyAdmins]", err.message);
  }
};

/**
 * Notify all officers and admins
 */
const notifyAll = async (title, message, type = "info", entity = null, entityId = null) => {
  try {
    const users = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'officer')");
    for (const user of users.rows) {
      await notify(user.id, title, message, type, entity, entityId);
    }
  } catch (err) {
    console.error("[notifyAll]", err.message);
  }
};

module.exports = { notify, notifyAdmins, notifyAll };
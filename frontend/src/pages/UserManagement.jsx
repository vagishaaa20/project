import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, Trash2, Shield, Eye, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLE_COLORS = {
  admin:   { bg: "rgba(239,68,68,0.15)",   text: "#f87171", border: "rgba(239,68,68,0.3)"   },
  officer: { bg: "rgba(99,102,241,0.15)",  text: "#818cf8", border: "rgba(99,102,241,0.3)"  },
  viewer:  { bg: "rgba(16,185,129,0.15)",  text: "#34d399", border: "rgba(16,185,129,0.3)"  },
};

const ROLE_ICONS = { admin: Shield, officer: UserCheck, viewer: Eye };

const UserManagement = () => {
  const navigate              = useNavigate();
  const [users,    setUsers]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error,    setError]   = useState("");
  const [success,  setSuccess] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]    = useState({
    name: "", email: "", password: "", role: "viewer"
  });
  const [submitting, setSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("auth") || "{}");

  const isAdmin = currentUser?.user?.role === "admin";

useEffect(() => {
  if (!isAdmin) {
    navigate("/home");
    return;
  }
  fetchUsers();
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/auth/users", { withCredentials: true });
      setUsers(res.data.users);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post("http://localhost:5001/auth/register", form, { withCredentials: true });
      setSuccess(`User ${form.name} created successfully.`);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "viewer" });
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(
        `http://localhost:5001/auth/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccess("Role updated.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update role.");
    }
  };

  const handleDelete = async (userId) => {
    setDeleting(userId);
    try {
      await axios.delete(`http://localhost:5001/auth/users/${userId}`, { withCredentials: true });
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccess("User deleted.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="um-root">
      <div className="um-ambient um-ambient-1" />
      <div className="um-ambient um-ambient-2" />

      <motion.div
        className="um-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.div
          className="um-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="um-title-row">
            <div className="um-icon-wrap"><Users size={28} /></div>
            <div>
              <h1>User Management</h1>
              <p>{users.length} registered users</p>
            </div>
          </div>
          <motion.button
            className="um-btn-new"
            onClick={() => { setShowForm(true); setError(""); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} /> New User
          </motion.button>
        </motion.div>

        {/* Success/Error banners */}
        <AnimatePresence>
          {success && (
            <motion.div className="um-success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              ✓ {success}
            </motion.div>
          )}
          {error && (
            <motion.div className="um-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {error}
              <button onClick={() => setError("")}><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          className="um-stats"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {["admin", "officer", "viewer"].map(role => {
            const count  = users.filter(u => u.role === role).length;
            const colors = ROLE_COLORS[role];
            const Icon   = ROLE_ICONS[role];
            return (
              <div key={role} className="um-stat" style={{ borderColor: colors.border, background: colors.bg }}>
                <Icon size={20} style={{ color: colors.text }} />
                <span className="um-stat-value" style={{ color: colors.text }}>{count}</span>
                <span className="um-stat-label">{role}s</span>
              </div>
            );
          })}
        </motion.div>

        {/* Users table */}
        {loading ? (
          <div className="um-loading">Loading users...</div>
        ) : (
          <motion.div
            className="um-table-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <table className="um-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const colors = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;
                  const isMe   = user.id === currentUser?.user?.id;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="um-row"
                    >
                      <td className="um-name">
                        <div className="um-avatar" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name} {isMe && <span className="um-you">you</span>}</span>
                      </td>
                      <td className="um-email">{user.email}</td>
                      <td>
                        <select
                          className="um-role-select"
                          value={user.role}
                          disabled={isMe}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          style={{ color: colors.text, borderColor: colors.border }}
                        >
                          <option value="admin">admin</option>
                          <option value="officer">officer</option>
                          <option value="viewer">viewer</option>
                        </select>
                      </td>
                      <td className="um-date">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : <span style={{ color: "#475569" }}>Never</span>
                        }
                      </td>
                      <td className="um-date">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {!isMe && (
                          <motion.button
                            className="um-btn-delete"
                            onClick={() => handleDelete(user.id)}
                            disabled={deleting === user.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={15} />
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>

      {/* Create user modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="um-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="um-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="um-modal-header">
                <h2>Create New User</h2>
                <button className="um-modal-close" onClick={() => setShowForm(false)}>
                  <X size={20} />
                </button>
              </div>

              {error && <div className="um-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="um-form">
                <div className="um-form-group">
                  <label>Full Name *</label>
                  <input className="um-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="um-form-group">
                  <label>Email *</label>
                  <input className="um-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="um-form-group">
                  <label>Password *</label>
                  <input className="um-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="um-form-group">
                  <label>Role *</label>
                  <select className="um-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="viewer">Viewer — read only</option>
                    <option value="officer">Officer — upload & verify</option>
                    <option value="admin">Admin — full access</option>
                  </select>
                </div>
                <motion.button
                  className="um-btn-submit"
                  onClick={handleCreate}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? "Creating..." : "Create User"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
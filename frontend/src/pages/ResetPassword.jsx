import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import API_URL from "../config";

const ResetPassword = () => {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const token             = searchParams.get("token");
  const [password,   setPassword]  = useState("");
  const [confirm,    setConfirm]   = useState("");
  const [loading,    setLoading]   = useState(false);
  const [success,    setSuccess]   = useState(false);
  const [error,      setError]     = useState("");

  const handleReset = async () => {
    if (!password || !confirm) { setError("All fields required"); return; }
    if (password !== confirm)  { setError("Passwords do not match"); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired link.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="auth-page">
      <div className="auth-card">
        <p style={{ color: "#ef4444" }}>Invalid reset link.</p>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-icon-wrap"><Lock size={28} /></div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your new password below.</p>

        {success ? (
          <div className="auth-success">
            ✓ Password reset successfully! Redirecting to login...
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-form-group">
              <label>New Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-form-group">
              <label>Confirm Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Repeat password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReset()}
              />
            </div>
            <motion.button
              className="auth-btn"
              onClick={handleReset}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
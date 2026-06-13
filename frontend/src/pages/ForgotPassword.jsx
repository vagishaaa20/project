import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import API_URL from "../config";

const ForgotPassword = () => {
  const navigate      = useNavigate();
  const [email,       setEmail]     = useState("");
  const [loading,     setLoading]   = useState(false);
  const [sent,        setSent]      = useState(false);
  const [error,       setError]     = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="auth-back" onClick={() => navigate("/login")}>
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="auth-icon-wrap">
          <Mail size={28} />
        </div>

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="auth-success">
            ✓ Reset link sent. Check your inbox and spam folder.
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-form-group">
              <label>Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <motion.button
              className="auth-btn"
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
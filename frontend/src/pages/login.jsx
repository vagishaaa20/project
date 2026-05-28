import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("viewer"); // viewer | admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔧 DEV MODE FLAG
  const DEV_MODE = false; // Set to true to bypass backend login (for faster testing)

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // ===============================
    // 🚧 DEV MODE (NO BACKEND)
    // ===============================
    if (DEV_MODE) {
      setLoading(true);

      setTimeout(() => {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            role,
            email: email || "dev@trustvault.local",
            token: "DEV_TOKEN",
          })
        );

        navigate("/home");
        setLoading(false);

      }, 800);

      return;
    }

    // ===============================
    // 🔐 REAL BACKEND LOGIN
    // ===============================
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5001/auth/login",
        {
          email,
          password,
          role,
          deviceId: navigator.userAgent,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Login response:", res.data);

      // Save auth data locally
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: res.data.user,
          token: res.data.token,
        })
      );

      navigate("/home");

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Server unavailable. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${role === "admin" ? "admin-mode" : ""}`}>
      <div className="auth-card">

        <h2 className="auth-title">
          {role === "admin" ? "ADMIN LOGIN" : "LOGIN"}
        </h2>

        <p className="auth-subtitle">
          {role === "admin"
            ? "Restricted Administrative Access"
            : "Tamper-Proof Digital Evidence Access"}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {/* ROLE SELECTOR */}
        <div className="role-selector">
          <button
            type="button"
            className={role === "viewer" ? "active" : ""}
            onClick={() => setRole("viewer")}
          >
            Viewer
          </button>

          <button
            type="button"
            className={role === "admin" ? "active admin" : "admin"}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>

          <div className="input-group">
            <span className="input-icon">📧</span>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="input-group">
            <span className="input-icon">🔒</span>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-links">
            <span
              className="forgot-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : role === "admin"
              ? "ADMIN LOGIN"
              : "LOGIN"}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <button className="google-btn" disabled>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
          />
        </button>

        {role === "viewer" && (
          <p className="auth-footer">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
        )}

        <p className="legal-note">
          All access attempts are logged and legally auditable
        </p>
      </div>
    </div>
  );
};

export default Login;
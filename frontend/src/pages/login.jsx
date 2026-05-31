import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();

  const [role,     setRole]     = useState("viewer");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const DEV_MODE = false;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (DEV_MODE) {
      setLoading(true);
      setTimeout(() => {
        localStorage.setItem("auth", JSON.stringify({
          role,
          email: email || "dev@trustvault.local",
          token: "DEV_TOKEN",
        }));
        navigate("/home");
        setLoading(false);
      }, 800);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5001/auth/login",
        { email, password, role, deviceId: navigator.userAgent },
        { withCredentials: true }
      );

      localStorage.setItem("auth", JSON.stringify({
        user:  res.data.user,
        token: res.data.token,
      }));

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

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        "http://localhost:5001/auth/google",
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );

      localStorage.setItem("auth", JSON.stringify({
        user:  res.data.user,
        token: res.data.token,
      }));

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${role === "admin" ? "admin-mode" : ""}`}>
      <div className="auth-card">

        <h2 className="auth-title">
          {role === "admin"   ? "ADMIN LOGIN"   :
           role === "officer" ? "OFFICER LOGIN" : "LOGIN"}
        </h2>

        <p className="auth-subtitle">
          {role === "admin"
            ? "Restricted Administrative Access"
            : role === "officer"
            ? "Law Enforcement Evidence Access"
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
            className={role === "officer" ? "active officer" : "officer"}
            onClick={() => setRole("officer")}
          >
            Officer
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
            <span className="forgot-link" onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </span>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading
              ? "Authenticating..."
              : role === "admin"   ? "ADMIN LOGIN"
              : role === "officer" ? "OFFICER LOGIN"
              : "LOGIN"}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        {/* Google Sign In */}
        <div className="google-signin-wrap">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google login failed.")}
            theme="filled_black"
            shape="rectangular"
            width="350"
            text="signin_with_google"
          />
        </div>

        {role === "viewer" && (
          <p className="auth-footer">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>Register</span>
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
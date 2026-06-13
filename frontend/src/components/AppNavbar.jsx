import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Users, LogOut, FileText, ChevronDown, Home, Briefcase } from "lucide-react";
import NotificationBell from "./NotificationBell";
import API_URL from "../config";

const AppNavbar = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef         = useRef();

  const auth    = JSON.parse(localStorage.getItem("auth") || "{}");
  const user    = auth?.user;
  const isAdmin = user?.role === "admin";

  const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const isPublic    = publicPages.includes(location.pathname);

  // ── hooks must always be called — no early return before this ──
  useEffect(() => {
    if (isPublic) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isPublic]);

  // ── early return AFTER all hooks ──
  if (isPublic || !user) return null;

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const ROLE_COLORS = {
    admin:   "#f87171",
    officer: "#818cf8",
    viewer:  "#34d399",
  };
  const roleColor = ROLE_COLORS[user?.role] || "#64748b";

  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={() => navigate("/home")}>
        <div className="ashoka-seal" style={{ width: "36px", height: "36px" }}>
          <div className="chakra" style={{ width: "20px", height: "20px" }}></div>
        </div>
        <div className="logo-text">
          <div className="logo-main" style={{ fontSize: "16px", letterSpacing: "2px" }}>TRUSTVAULT</div>
          <div className="logo-sub" style={{ fontSize: "8px", letterSpacing: "2px" }}>Blockchain Evidence Platform</div>
        </div>
      </button>

      {/* Right side — bell + profile together */}
      <div className="navbar-right-group">
        <NotificationBell />
        <div className="navbar-right" ref={menuRef}>
          {/* profile button */}
          <motion.button
            className="navbar-profile-btn"
            onClick={() => setOpen(o => !o)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="navbar-avatar" style={{ background: `${roleColor}22`, border: `1.5px solid ${roleColor}`, color: roleColor }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.name}</span>
              <span className="navbar-user-role" style={{ color: roleColor }}>{user?.role}</span>
            </div>
            <ChevronDown size={16} className={`navbar-chevron ${open ? "open" : ""}`} style={{ color: "#64748b" }} />
          </motion.button>

          {/* dropdown */}
          <AnimatePresence>
            {open && (
              <motion.div
                className="navbar-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="navbar-dropdown-header">
                  <div className="navbar-dropdown-avatar" style={{ background: `${roleColor}22`, border: `2px solid ${roleColor}`, color: roleColor }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="navbar-dropdown-name">{user?.name}</div>
                    <div className="navbar-dropdown-email">{user?.email}</div>
                  </div>
                </div>

                <div className="navbar-dropdown-divider" />
                <button className="navbar-dropdown-item" onClick={() => { navigate("/home");     setOpen(false); }}><Home      size={15} /> Home</button>
                <button className="navbar-dropdown-item" onClick={() => { navigate("/cases");    setOpen(false); }}><Briefcase size={15} /> Cases</button>
                <button className="navbar-dropdown-item" onClick={() => { navigate("/log-file"); setOpen(false); }}><FileText  size={15} /> Audit Logs</button>

                {isAdmin && (
                  <>
                    <div className="navbar-dropdown-divider" />
                    <div className="navbar-dropdown-section">Admin</div>
                    <button className="navbar-dropdown-item admin" onClick={() => { navigate("/users"); setOpen(false); }}>
                      <Users size={15} /> User Management
                    </button>
                  </>
                )}

                <div className="navbar-dropdown-divider" />
                <button className="navbar-dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
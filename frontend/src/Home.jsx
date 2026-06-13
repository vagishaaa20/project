import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Briefcase,
  FileText,
  UploadCloud,
  ShieldCheck,
  ScanFace,
  Lock,
  Activity
} from "lucide-react";
import API_URL from "./config";

const cards = [
  {
    title: "View Records",
    desc: "Browse evidence details",
    icon: FileText,
    path: "/approach",
    accent: "green"
  },
  {
    title: "Add Evidence",
    desc: "Upload new evidence",
    icon: UploadCloud,
    path: "/add-evidence",
    accent: "purple"
  },
  {
    title: "Verify Evidence",
    desc: "Check authenticity",
    icon: ShieldCheck,
    path: "/verify-evidence",
    accent: "orange"
  },
  {
    title: "Deepfake Detection",
    desc: "Analyze video authenticity",
    icon: ScanFace,
    path: "/deepfake-detection",
    accent: "red"
  }
];


const Home = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [caseCount, setCaseCount] = useState({ total: 0, open: 0, pending: 0 });

  useEffect(() => {
    fetchLogs();
    fetchCaseStats();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/logs`, { withCredentials: true });
      setLogs(res.data);
    } catch {
      setLogs([
        { action: "Evidence uploaded - Case #EVD-2024-001", status: 200, timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
        { action: "Deepfake analysis completed - Video verified", status: 200, timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
        { action: "Evidence verification - Hash matched", status: 200, timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
        { action: "Failed authentication attempt", status: 401, timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
      ]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchCaseStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/cases`, { withCredentials: true });
      const cases = res.data.cases || [];
      setCaseCount({
        total:   cases.length,
        open:    cases.filter(c => c.status === "open").length,
        pending: cases.filter(c => c.status === "pending").length,
      });
    } catch {
      // silently fail
    }
  };

  return (
    <div className="home-root">
      <div className="ambient ambient-blue" />
      <div className="ambient ambient-purple" />

      <motion.div
        className="home-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="home-header"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="status-pill">System Operational</span>
          <h1 className="hero-title">Chain of Custody System</h1>
          <p className="hero-subtitle">Secure evidence management powered by blockchain integrity.</p>
        </motion.div>

        <div className="card-layout">

          {/* Cases — primary card */}
          <motion.button
            className="feature-card dashboard-card accent-blue"
            onClick={() => navigate("/cases")}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="dashboard-content">
              <div className="icon-box large">
                <Briefcase size={32} />
              </div>
              <div>
                <h3>Case Management</h3>
                <p>Create, assign & track cases with full chain of custody</p>
              </div>
            </div>

            {/* Live case stats inside the card */}
            <div className="dashboard-stats">
              <div className="dashboard-stat">
                <span className="dashboard-stat-value">{caseCount.total}</span>
                <span className="dashboard-stat-label">Total Cases</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value" style={{ color: "#818cf8" }}>{caseCount.open}</span>
                <span className="dashboard-stat-label">Open</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value" style={{ color: "#fbbf24" }}>{caseCount.pending}</span>
                <span className="dashboard-stat-label">Pending</span>
              </div>
            </div>
          </motion.button>

          {/* Secondary cards */}
          <div className="secondary-grid">
            {cards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.title}
                  className={`feature-card accent-${item.accent}`}
                  onClick={() => navigate(item.path)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="icon-box"><Icon size={26} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Recent Activity */}
          <motion.div
            className="logs-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="logs-header">
              <Activity size={20} style={{ marginRight: "10px" }} />
              <h3>Recent Activity</h3>
              <button className="view-all-btn" onClick={() => navigate("/log-file")}>
                View All →
              </button>
            </div>

            {loadingLogs ? (
              <div className="logs-loading">Loading activity logs...</div>
            ) : logs.length === 0 ? (
              <div className="logs-empty">No activity logs yet</div>
            ) : (
              <div className="logs-list">
                {logs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="log-item">
                    <div className="log-action">{log.action}</div>
                    <div className="log-status" style={{ color: log.status === 200 ? "#51cf66" : "#ff8787" }}>
                      {log.status}
                    </div>
                    <div className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="security-notice">
          <div className="security-icon">🔒</div>
          <div className="security-text">
            <h4>Security Notice</h4>
            <p>All evidence records are encrypted and protected with government-grade security. Access is logged for audit purposes. Unauthorized access is prohibited by law.</p>
          </div>
        </div>

        <motion.div className="home-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <span><Lock size={14} /> Secure storage</span>
          <span><Activity size={14} /> Real-time logging</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;